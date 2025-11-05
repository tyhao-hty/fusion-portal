import { test, expect } from '@playwright/test';

type TimelineEvent = {
  id: number;
  slug: string;
  yearLabel: string;
  yearValue: number | null;
  title: string;
  description: string;
  sortOrder: number;
};

type TimelineResponse = {
  data: TimelineEvent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    order: 'asc' | 'desc';
    hasNext: boolean;
  };
};

test.describe('Site pages', () => {
  test('home page renders legacy modules', async ({ page }) => {
    await page.goto('/site');
    await expect(page.getByRole('heading', { name: '核聚变门户' })).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '发展历史' }),
    ).toBeVisible();
  });

  test('timeline page loads entries', async ({ page }) => {
    await page.goto('/site/history');
    await expect(page.getByRole('heading', { name: '核聚变发展历史' })).toBeVisible();
    await expect(page.getByRole('button', { name: /加载更多里程碑/ })).toBeVisible();
  });

  test('timeline page supports manual “加载更多里程碑” interaction', async ({ page }) => {
    await page.addInitScript(() => {
      class NoopIntersectionObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      }
      (window as any).IntersectionObserver = NoopIntersectionObserver;
    });

    const timelinePages: Record<string, TimelineResponse> = {
      '1': {
        data: [
          {
            id: 1,
            slug: 'timeline-automated-1',
            yearLabel: '2020年',
            yearValue: 2020,
            title: '里程碑 1',
            description: '这是第一页的里程碑。',
            sortOrder: 1,
          },
        ],
        meta: {
          page: 1,
          limit: 8,
          total: 2,
          totalPages: 2,
          order: 'desc',
          hasNext: true,
        },
      },
      '2': {
        data: [
          {
            id: 2,
            slug: 'timeline-automated-2',
            yearLabel: '2019年',
            yearValue: 2019,
            title: '里程碑 2',
            description: '这是第二页的里程碑。',
            sortOrder: 2,
          },
        ],
        meta: {
          page: 2,
          limit: 8,
          total: 2,
          totalPages: 2,
          order: 'desc',
          hasNext: false,
        },
      },
    };

    const requestedPages: string[] = [];

    await page.route('**/api/timeline**', async (route) => {
      const url = new URL(route.request().url());
      const pageParam = url.searchParams.get('page') ?? '1';
      requestedPages.push(pageParam);
      const payload = timelinePages[pageParam];
      if (!payload) {
        await route.abort();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      });
    });

    await page.goto('/site/history');

    await expect(page.getByText('里程碑 1')).toBeVisible();
    await expect(page.getByRole('button', { name: '加载更多里程碑' })).toBeEnabled();

    await page.getByRole('button', { name: '加载更多里程碑' }).click();

    await expect.poll(() => requestedPages.includes('2')).toBeTruthy();

    await expect(page.getByText('里程碑 2')).toBeVisible();
    await expect(page.getByRole('button', { name: '已经到底啦' })).toBeDisabled();

    await page.unroute('**/api/timeline**');
  });

  test('users can fall back to legacy static pages', async ({ page }) => {
    await page.goto('/site');

    const scienceCard = page.getByRole('heading', { name: '🔬 科普知识' }).locator('..');
    await scienceCard.getByRole('link', { name: '立即查看' }).click();

    await page.waitForURL('**/science.html');
    await expect(page.getByRole('heading', { name: '核聚变科普知识' })).toBeVisible();
    await expect(page.getByRole('link', { name: /返回首页/ })).toHaveAttribute('href', 'index.html');
  });
});
