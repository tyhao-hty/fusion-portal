// 数据集配置：定义文件路径、标签与 localStorage 键
const DATASETS = {
  timeline: {
    label: '时间线',
    file: 'data/timeline.json',
    section: 'timeline.json',
    storageKey: 'fusionSite.admin.timeline'
  },
  links: {
    label: '资源链接',
    file: 'data/links.json',
    section: 'links.json',
    storageKey: 'fusionSite.admin.links'
  },
  papers: {
    label: '论文',
    file: 'data/papers.json',
    section: 'papers.json',
    storageKey: 'fusionSite.admin.papers'
  }
};

// 内存中的数据映射
const dataState = {
  timeline: [],
  links: [],
  papers: []
};

// 记录数据来源（用于元信息显示）
const datasetSource = {
  timeline: 'remote',
  links: 'remote',
  papers: 'remote'
};

let schemaDefinitions = {}; // 由 schema.md 解析得到的字段定义
let activeDataset = 'timeline'; // 当前展示的数据集
let currentEditIndex = null; // 当前编辑的索引
let currentMode = 'create'; // 当前对话框模式：create | edit

// 关键 DOM 引用
const elements = {
  container: document.getElementById('data-container'),
  datasetTitle: document.querySelector('[data-dataset-title]'),
  datasetMeta: document.querySelector('[data-dataset-meta]'),
  tabs: document.querySelectorAll('.admin-tab'),
  datasetActions: document.querySelector('.dataset-actions'),
  actionsBar: document.querySelector('.admin-footer-actions'),
  modal: document.querySelector('.modal'),
  modalForm: document.getElementById('entry-form'),
  modalTitle: document.getElementById('modal-title'),
  modalClose: document.querySelector('[data-modal-close]'),
  modalCancel: document.querySelector('[data-modal-cancel]'),
  toastContainer: document.querySelector('.toast-container'),
  importInput: document.querySelector('[data-import-input]')
};

const tableTemplate = document.getElementById('table-template');
const cardTemplate = document.getElementById('card-template');

document.addEventListener('DOMContentLoaded', async () => {
  try {
    schemaDefinitions = await loadSchemaDefinitions();
  } catch (error) {
    showToast(`读取 schema.md 失败：${error.message}`, 'error');
  }

  await Promise.all(Object.keys(DATASETS).map((key) => loadDataset(key)));
  bindGlobalEvents();
  updateActiveDataset('timeline');
});

// 绑定全局交互事件
function bindGlobalEvents() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      updateActiveDataset(tab.dataset.dataset);
    });
  });

  elements.datasetActions?.addEventListener('click', (event) => {
    const action = event.target.closest('button')?.dataset.action;
    if (!action) return;
    if (action === 'refresh') {
      refreshDataset(activeDataset);
    }
  });

  elements.actionsBar.addEventListener('click', (event) => {
    const action = event.target.closest('button')?.dataset.action;
    if (!action) return;
    switch (action) {
      case 'add':
        openModal('create');
        break;
      case 'import':
        elements.importInput.value = '';
        elements.importInput.click();
        break;
      case 'export':
        exportCurrentDataset();
        break;
      case 'save-local':
        persistCurrentDataset();
        break;
      default:
        break;
    }
  });

  elements.importInput.addEventListener('change', handleImport);

  elements.container.addEventListener('click', (event) => {
    const action = event.target.closest('button')?.dataset.action;
    if (!action) return;
    const index = Number(event.target.closest('[data-index]')?.dataset.index);
    if (Number.isNaN(index)) return;
    if (action === 'edit') {
      openModal('edit', index);
    } else if (action === 'delete') {
      handleDelete(index);
    }
  });

  elements.modalClose.addEventListener('click', closeModal);
  elements.modalCancel.addEventListener('click', closeModal);
  elements.modal.addEventListener('click', (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
  });

  elements.modalForm.addEventListener('submit', handleFormSubmit);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !elements.modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

// 从 schema.md 读取字段定义
async function loadSchemaDefinitions() {
  const response = await fetch('data/schema.md', { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const markdown = await response.text();
  return parseSchemaMarkdown(markdown);
}

// 粗略解析 Markdown 中的字段定义表
function parseSchemaMarkdown(markdown) {
  const map = {};
  const sectionRegex = /##\s+([^\n]+)\n([\s\S]*?)(?=(\n##\s+)|$)/g;
  let match;
  while ((match = sectionRegex.exec(markdown)) !== null) {
    const sectionName = match[1].trim();
    const sectionBody = match[2];
    const fields = extractFieldsFromSection(sectionBody);
    if (fields.length) {
      map[sectionName] = fields;
    }
  }
  return map;
}

function extractFieldsFromSection(sectionText) {
  const fields = [];
  const definitionSplit = sectionText.split(/- \*\*字段定义\*\*：/);
  if (definitionSplit.length < 2) {
    return fields;
  }

  const block = definitionSplit[1];
  const lines = block.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^- \*\*/.test(line) && !/^-\s+\*\*字段定义\*\*/.test(line)) {
      break;
    }
    const fieldMatch = line.match(/^-\s*`([^`]+)`\s*\(([^)]+)\)：?\s*(.*)$/);
    if (fieldMatch) {
      fields.push({
        key: fieldMatch[1],
        type: fieldMatch[2],
        description: fieldMatch[3]
      });
    }
  }
  return fields;
}

// 读取数据集：优先 localStorage，回退到静态文件
async function loadDataset(key) {
  const dataset = DATASETS[key];
  const stored = readFromStorage(dataset.storageKey);
  if (stored) {
    dataState[key] = stored;
    datasetSource[key] = 'localStorage';
    return;
  }

  try {
    const response = await fetch(dataset.file, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    dataState[key] = await response.json();
    datasetSource[key] = 'remote';
  } catch (error) {
    dataState[key] = [];
    datasetSource[key] = 'error';
    showToast(`${dataset.label} 加载失败：${error.message}`, 'error');
  }
}

function readFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('期望为数组');
    }
    return parsed;
  } catch (error) {
    console.error('[admin] 读取 localStorage 失败', error);
    showToast(`本地存储解析失败：${error.message}`, 'error');
    return null;
  }
}

function updateActiveDataset(nextKey) {
  if (!DATASETS[nextKey]) return;
  activeDataset = nextKey;
  elements.tabs.forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.dataset === nextKey);
  });
  renderActiveDataset();
}

// 渲染当前激活的数据集
function renderActiveDataset() {
  const datasetConfig = DATASETS[activeDataset];
  const rows = dataState[activeDataset];
  const fields = schemaDefinitions[datasetConfig.section] || deriveFields(rows);

  elements.datasetTitle.textContent = `${datasetConfig.label}数据`;
  elements.datasetMeta.textContent = makeDatasetMeta(rows.length, datasetSource[activeDataset]);

  if (!Array.isArray(rows) || rows.length === 0) {
    elements.container.innerHTML = '<p class="empty-indicator">暂无数据，可点击右下角的「新增」按钮创建。</p>';
    return;
  }

  const tableNode = renderTable(rows, fields);
  const cardNode = renderCards(rows, fields);

  elements.container.innerHTML = '';
  elements.container.append(tableNode, cardNode);
}

function deriveFields(rows) {
  if (!Array.isArray(rows) || !rows.length) return [];
  return Object.keys(rows[0]).map((key) => ({
    key,
    type: 'string',
    description: ''
  }));
}

function makeDatasetMeta(count, source) {
  const sourceLabel =
    source === 'localStorage'
      ? '来源：localStorage'
      : source === 'remote'
      ? '来源：data/ 原始文件'
      : source === 'local'
      ? '来源：当前会话（未保存）'
      : '来源：加载失败';
  return `当前共有 ${count} 条记录；${sourceLabel}`;
}

// 按字段渲染桌面端表格
function renderTable(rows, fields) {
  const clone = tableTemplate.content.firstElementChild.cloneNode(true);
  const thead = clone.querySelector('thead');
  const tbody = clone.querySelector('tbody');

  const headerRow = document.createElement('tr');
  fields.forEach((field) => {
    const th = document.createElement('th');
    th.textContent = `${field.key}${field.type ? ` (${field.type})` : ''}`;
    headerRow.appendChild(th);
  });
  const actionTh = document.createElement('th');
  actionTh.textContent = '操作';
  headerRow.appendChild(actionTh);
  thead.appendChild(headerRow);

  rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.dataset.index = index;
    fields.forEach((field) => {
      const td = document.createElement('td');
      td.textContent = formatFieldValue(row[field.key]);
      tr.appendChild(td);
    });
    const actionTd = document.createElement('td');
    actionTd.className = 'table-actions';
    actionTd.append(
      createActionButton('编辑', 'edit'),
      createActionButton('删除', 'delete')
    );
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  });

  return clone;
}

// 渲染移动端卡片视图
function renderCards(rows, fields) {
  const clone = cardTemplate.content.firstElementChild.cloneNode(true);
  rows.forEach((row, index) => {
    const card = document.createElement('article');
    card.className = 'data-card';
    card.dataset.index = index;
    fields.forEach((field) => {
      const fieldNode = document.createElement('p');
      fieldNode.className = 'data-card__field';
      const label = document.createElement('strong');
      label.textContent = `${field.key}${field.type ? ` (${field.type})` : ''}`;
      const value = document.createElement('span');
      value.textContent = formatFieldValue(row[field.key]);
      fieldNode.append(label, value);
      card.appendChild(fieldNode);
    });
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    actions.append(
      createActionButton('编辑', 'edit'),
      createActionButton('删除', 'delete')
    );
    card.appendChild(actions);
    clone.appendChild(card);
  });
  return clone;
}

function createActionButton(label, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = action === 'edit' ? 'primary-button' : 'ghost-button';
  button.dataset.action = action;
  button.textContent = label;
  return button;
}

function formatFieldValue(value) {
  if (value == null) return '—';
  if (typeof value === 'string') {
    return value.length > 120 ? `${value.slice(0, 117)}…` : value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value) || typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return '[复杂结构]';
    }
  }
  return String(value);
}

// 打开编辑/新增对话框
function openModal(mode, index = null) {
  const datasetConfig = DATASETS[activeDataset];
  const fields = schemaDefinitions[datasetConfig.section] || deriveFields(dataState[activeDataset]);
  currentMode = mode;
  currentEditIndex = index;

  elements.modalTitle.textContent = mode === 'create' ? '新增条目' : '编辑条目';
  elements.modalForm.innerHTML = '';

  const draft = mode === 'edit' && index != null ? cloneEntry(dataState[activeDataset][index]) : {};

  fields.forEach((field) => {
    const formField = document.createElement('div');
    formField.className = 'form-field';

    const label = document.createElement('label');
    label.setAttribute('for', `field-${field.key}`);
    label.textContent = field.key;
    formField.appendChild(label);

    const inputElement = createInputForField(field, draft[field.key]);
    inputElement.id = `field-${field.key}`;
    inputElement.name = field.key;
    formField.appendChild(inputElement);

    const hint = document.createElement('p');
    hint.className = 'field-hint';
    hint.textContent = `${field.type ?? ''}${field.description ? `｜${field.description}` : ''}`;
    formField.appendChild(hint);

    elements.modalForm.appendChild(formField);
  });

  elements.modal.classList.remove('hidden');
  const firstInput = elements.modalForm.querySelector('input, textarea');
  firstInput?.focus();
}

// 按字段类型生成输入控件
function createInputForField(field, value) {
  const lowerType = (field.type || '').toLowerCase();
  const isJson = lowerType.includes('array') || lowerType.includes('object');
  const isLongText = ['description', 'abstract', 'groups'].includes(field.key) || lowerType.includes('text');
  const defaultValue = value ?? (isJson ? (lowerType.includes('array') ? [] : {}) : '');

  if (isJson || isLongText) {
    const textarea = document.createElement('textarea');
    textarea.rows = isJson ? 6 : 4;
    textarea.dataset.fieldType = isJson ? 'json' : 'string';
    textarea.value = defaultValue ? formatValueForInput(defaultValue, isJson) : '';
    return textarea;
  }

  const input = document.createElement('input');
  if (lowerType.includes('number')) {
    input.type = 'number';
    input.step = 'any';
    if (typeof defaultValue === 'number') {
      input.value = String(defaultValue);
    } else if (defaultValue != null) {
      input.value = String(defaultValue);
    }
  } else {
    input.type = 'text';
    input.value = defaultValue != null ? String(defaultValue) : '';
  }
  if (field.key === 'id') {
    input.required = true;
  }
  return input;
}

function formatValueForInput(value, asJson) {
  if (asJson) {
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return '';
    }
  }
  return value != null ? String(value) : '';
}

function closeModal() {
  elements.modal.classList.add('hidden');
  elements.modalForm.reset();
  currentEditIndex = null;
  currentMode = 'create';
}

// 提交编辑表单，应用到内存数据
function handleFormSubmit(event) {
  event.preventDefault();
  const datasetConfig = DATASETS[activeDataset];
  const fields = schemaDefinitions[datasetConfig.section] || deriveFields(dataState[activeDataset]);

  const draft = {};
  const errors = [];

  fields.forEach((field) => {
    const name = field.key;
    const input = elements.modalForm.elements.namedItem(name);
    if (!input) return;
    const rawValue = input.value.trim();

    if (name === 'id') {
      if (!rawValue) {
        errors.push('ID 不能为空');
        return;
      }
      if (!isIdUnique(rawValue, currentEditIndex)) {
        errors.push('ID 已存在，请修改后重试');
        return;
      }
      draft[name] = rawValue;
      return;
    }

    const lowerType = (field.type || '').toLowerCase();
    if (input.dataset.fieldType === 'json' || lowerType.includes('array') || lowerType.includes('object')) {
      if (!rawValue) {
        draft[name] = lowerType.includes('array') ? [] : {};
        return;
      }
      try {
        draft[name] = JSON.parse(rawValue);
      } catch (error) {
        errors.push(`${name} 字段 JSON 解析失败：${error.message}`);
      }
      return;
    }

    if (lowerType.includes('number')) {
      if (!rawValue) {
        draft[name] = null;
      } else {
        const numberValue = Number(rawValue);
        if (Number.isNaN(numberValue)) {
          errors.push(`${name} 需要是数字`);
        } else {
          draft[name] = numberValue;
        }
      }
      return;
    }

    draft[name] = rawValue;
  });

  if (errors.length) {
    showToast(errors.join('；'), 'error');
    return;
  }

  if (currentMode === 'edit' && currentEditIndex != null) {
    dataState[activeDataset][currentEditIndex] = draft;
  } else {
    dataState[activeDataset].push(draft);
  }

  datasetSource[activeDataset] = 'local';
  renderActiveDataset();
  closeModal();
  showToast('条目已更新，记得保存到 localStorage。', 'success');
}

function isIdUnique(id, ignoreIndex = null) {
  return !dataState[activeDataset].some((item, index) => {
    if (ignoreIndex != null && index === ignoreIndex) return false;
    return item?.id === id;
  });
}

function handleDelete(index) {
  const entry = dataState[activeDataset][index];
  const label = entry?.title || entry?.name || entry?.id || `第 ${index + 1} 条`;
  const confirmed = window.confirm(`确定要删除「${label}」吗？该操作无法撤销。`);
  if (!confirmed) return;
  dataState[activeDataset].splice(index, 1);
  datasetSource[activeDataset] = 'local';
  renderActiveDataset();
  showToast('条目已删除。', 'success');
}

async function refreshDataset(key) {
  localStorage.removeItem(DATASETS[key].storageKey);
  await loadDataset(key);
  if (key === activeDataset) {
    renderActiveDataset();
  }
  showToast('已从原始文件重新加载。', 'success');
}

function persistCurrentDataset() {
  const key = DATASETS[activeDataset].storageKey;
  try {
    const payload = JSON.stringify(dataState[activeDataset], null, 2);
    localStorage.setItem(key, payload);
    datasetSource[activeDataset] = 'localStorage';
    renderActiveDataset();
    showToast('数据已保存到 localStorage。', 'success');
  } catch (error) {
    showToast(`保存失败：${error.message}`, 'error');
  }
}

function exportCurrentDataset() {
  try {
    const payload = JSON.stringify(dataState[activeDataset], null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${activeDataset}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('导出成功。', 'success');
  } catch (error) {
    showToast(`导出失败：${error.message}`, 'error');
  }
}

function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) {
        throw new Error('导入文件必须是数组');
      }
      dataState[activeDataset] = parsed;
      datasetSource[activeDataset] = 'local';
      renderActiveDataset();
      showToast('导入成功，记得保存到 localStorage。', 'success');
    } catch (error) {
      showToast(`导入失败：${error.message}`, 'error');
    }
  };
  reader.onerror = () => {
    showToast('文件读取失败，请重试。', 'error');
  };
  reader.readAsText(file, 'utf-8');
}

function showToast(message, variant = 'info', timeout = 3600) {
  const toast = document.createElement('div');
  toast.className = `toast${variant === 'error' ? ' toast--error' : variant === 'success' ? ' toast--success' : ''}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button type="button" aria-label="关闭提示">×</button>
  `;
  elements.toastContainer.appendChild(toast);

  const remove = () => {
    toast.remove();
  };

  const timer = setTimeout(remove, timeout);
  toast.querySelector('button').addEventListener('click', () => {
    clearTimeout(timer);
    remove();
  });
}

function cloneEntry(entry) {
  if (entry == null) return {};
  if (typeof structuredClone === 'function') {
    return structuredClone(entry);
  }
  try {
    return JSON.parse(JSON.stringify(entry));
  } catch (error) {
    console.warn('[admin] cloneEntry fallback失败', error);
    return Object.assign({}, entry);
  }
}
