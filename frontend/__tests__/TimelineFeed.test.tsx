import '@testing-library/jest-dom';
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { TimelineFeed } from '@/app/site/history/TimelineFeed';
import { apiRequest } from '@/utils/api';

jest.mock('@/utils/api');

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

function renderTimelineFeed() {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <TimelineFeed />
    </SWRConfig>,
  );
}

const originalIntersectionObserver = global.IntersectionObserver;
const originalWindowIntersectionObserver = window.IntersectionObserver;

const createTimelineResponse = ({
  page,
  total,
  hasNext,
  items,
}: {
  page: number;
  total: number;
  hasNext: boolean;
  items: Array<Partial<ReturnType<typeof buildTimelineItem>>>;
}) => ({
  data: items.map((item, index) => buildTimelineItem({ id: index + 1, ...item })),
  meta: {
    page,
    limit: 8,
    total,
    totalPages: Math.ceil(total / 8),
    order: 'desc' as const,
    hasNext,
  },
});

function buildTimelineItem({
  id,
  slug = `timeline-${id}`,
  yearLabel = `200${id}年`,
  yearValue = 2000 + id,
  title = `第 ${id} 条里程碑`,
  description = `描述 ${id}`,
  sortOrder = id,
}: {
  id: number;
  slug?: string;
  yearLabel?: string;
  yearValue?: number | null;
  title?: string;
  description?: string;
  sortOrder?: number;
}) {
  return {
    id,
    slug,
    yearLabel,
    yearValue,
    title,
    description,
    sortOrder,
  };
}

describe('TimelineFeed', () => {
  afterEach(() => {
    mockedApiRequest.mockReset();
    global.IntersectionObserver = originalIntersectionObserver;
    window.IntersectionObserver = originalWindowIntersectionObserver;
    jest.clearAllMocks();
  });

  it('显示加载状态并渲染时间线数据', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          slug: 'timeline-2000',
          yearLabel: '2000年',
          yearValue: 2000,
          title: '测试事件',
          description: '描述',
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      meta: { page: 1, limit: 8, total: 1, totalPages: 1, order: 'desc', hasNext: false },
    });

    renderTimelineFeed();

    expect(screen.getByText('时间线加载中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('测试事件')).toBeInTheDocument();
    });
  });

  it('显示错误信息并提供重试按钮', async () => {
    mockedApiRequest.mockRejectedValueOnce(new Error('网络错误'));

    renderTimelineFeed();

    await waitFor(() => {
      expect(screen.getByText(/时间线数据加载失败/)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();

    mockedApiRequest.mockResolvedValueOnce({
      data: [],
      meta: { page: 1, limit: 8, total: 0, totalPages: 0, order: 'desc', hasNext: false },
    });

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: '重试' }));
    });
    await waitFor(() => {
      expect(screen.getByText('暂时无法加载发展历程，请稍后重试。')).toBeInTheDocument();
    });
  });

  it('在数据为空时展示空态提示', async () => {
    mockedApiRequest.mockResolvedValueOnce(
      createTimelineResponse({ page: 1, total: 0, hasNext: false, items: [] }),
    );

    renderTimelineFeed();

    await waitFor(() => {
      expect(screen.getByText('暂时无法加载发展历程，请稍后重试。')).toBeInTheDocument();
    });
  });

  it('点击“加载更多里程碑”时请求下一页并追加渲染', async () => {
    mockedApiRequest.mockImplementation(async (url: string) => {
      const page = Number(new URL(url, 'http://localhost').searchParams.get('page') ?? '1');
      if (page === 1) {
        return createTimelineResponse({
          page,
          total: 12,
          hasNext: true,
          items: [{ id: 1, title: '第一页事件' }],
        });
      }
      if (page === 2) {
        return createTimelineResponse({
          page,
          total: 12,
          hasNext: false,
          items: [{ id: 2, title: '第二页事件' }],
        });
      }
      throw new Error(`Unexpected page ${page}`);
    });

    renderTimelineFeed();

    await waitFor(() => {
      expect(screen.getByText('第一页事件')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: '加载更多里程碑' })).toBeEnabled();

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: '加载更多里程碑' }));
    });

    await waitFor(() => {
      expect(screen.getByText('第二页事件')).toBeInTheDocument();
    });

    expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: '已经到底啦' })).toBeDisabled();
  });

  it('当滚动触发 IntersectionObserver 时自动加载下一页', async () => {
    const observe = jest.fn();
    const disconnect = jest.fn();
    let observerCallback: IntersectionObserverCallback | undefined;

    const mockObserver = { observe, disconnect } as unknown as IntersectionObserver;

    const intersectionObserverStub = jest.fn((callback: IntersectionObserverCallback) => {
      observerCallback = callback;
      return mockObserver;
    }) as unknown as typeof IntersectionObserver;

    global.IntersectionObserver = intersectionObserverStub;
    window.IntersectionObserver = intersectionObserverStub;

    mockedApiRequest.mockImplementation(async (url: string) => {
      const page = Number(new URL(url, 'http://localhost').searchParams.get('page') ?? '1');
      if (page === 1) {
        return createTimelineResponse({
          page,
          total: 16,
          hasNext: true,
          items: [{ id: 1, title: '自动分页事件 1' }],
        });
      }
      if (page === 2) {
        return createTimelineResponse({
          page,
          total: 16,
          hasNext: true,
          items: [{ id: 2, title: '自动分页事件 2' }],
        });
      }
      throw new Error(`Unexpected page ${page}`);
    });

    renderTimelineFeed();

    await waitFor(() => {
      expect(screen.getByText('自动分页事件 1')).toBeInTheDocument();
    });

    expect(observe).toHaveBeenCalled();

    const sentinel = document.querySelector('.timeline-sentinel');
    const entry = {
      isIntersecting: true,
      target: sentinel,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 1,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: 0,
    } as IntersectionObserverEntry;

    await act(async () => {
      observerCallback?.([entry], mockObserver);
    });

    await waitFor(() => {
      expect(screen.getByText('自动分页事件 2')).toBeInTheDocument();
    });

    expect(mockedApiRequest).toHaveBeenCalledTimes(2);
  });
});
