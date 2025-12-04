import '@testing-library/jest-dom';
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PapersCatalog } from '@/app/(site)/papers/PapersCatalog';
import type { Paper } from '@/app/(site)/papers/types';

const buildPaper = (overrides: Partial<Paper> = {}): Paper => ({
  slug: overrides.slug ?? `paper-${Math.random()}`,
  title: overrides.title ?? '测试论文标题',
  authors: overrides.authors ?? '测试作者',
  year: overrides.year ?? 2024,
  venue: overrides.venue ?? '测试期刊',
  url: overrides.url ?? 'https://example.com/paper',
  abstract: overrides.abstract ?? '测试摘要',
  sortOrder: overrides.sortOrder ?? 1,
  tags: overrides.tags ?? [{ slug: 'tokamak-tag', name: '托卡马克物理' }],
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
});

describe('PapersCatalog', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it('按主题分组展示论文并显示统计信息', async () => {
    const papers: Paper[] = [
      buildPaper({
        slug: 'paper-1',
        title: '托卡马克研究进展',
        tags: [{ slug: 'tokamak', name: '托卡马克物理' }],
      }),
      buildPaper({
        slug: 'paper-2',
        title: '未知分类论文',
        tags: [{ slug: 'other-tag', name: '其他标签' }],
      }),
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: papers }),
    });

    await act(async () => {
      render(<PapersCatalog papers={papers} />);
    });

    expect(screen.getByRole('heading', { name: '磁约束聚变' })).toBeInTheDocument();
    expect(screen.getAllByText('托卡马克物理').length).toBeGreaterThan(0);
    expect(screen.getByText('托卡马克研究进展')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '其他主题' })).toBeInTheDocument();
    expect(screen.getByText('未知分类论文')).toBeInTheDocument();
    expect(screen.getByText(/当前展示 2 \/ 2 篇论文/)).toBeInTheDocument();
  });

  it('根据搜索关键词过滤论文', async () => {
    const initialPapers: Paper[] = [
      buildPaper({
        slug: 'paper-1',
        title: '托卡马克研究进展',
        tags: [{ slug: 'tokamak', name: '托卡马克物理' }],
      }),
      buildPaper({
        slug: 'paper-2',
        title: '材料工程研究',
        tags: [{ slug: 'materials', name: '材料科学与工程' }],
      }),
    ];

    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      const search = new URL(url).searchParams.get('q') ?? '';
      const data = search.includes('材料') ? [initialPapers[1]] : initialPapers;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data }),
      });
    });

    await act(async () => {
      render(<PapersCatalog papers={initialPapers} />);
    });

    const user = userEvent.setup();
    const searchInput = screen.getByRole('searchbox', { name: '搜索核聚变论文' });

    await act(async () => {
      await user.clear(searchInput);
      await user.type(searchInput, '材料');
    });

    await waitFor(() => {
      expect(screen.queryByText('托卡马克研究进展')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: '磁约束聚变' })).not.toBeInTheDocument();
    });
    expect(await screen.findByText('材料工程研究')).toBeInTheDocument();
    expect(screen.getByText(/当前展示 1 \/ 1 篇论文/)).toBeInTheDocument();
  });
});
