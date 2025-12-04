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

test.describe('Public site', () => {
  test('home page renders root modules', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '核聚变门户' })).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '发展历史' }),
    ).toBeVisible();
    const navScience = page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '科普知识' });
    await expect(navScience).toHaveAttribute('href', '/science');
  });

  test('history page loads entries', async ({ page }) => {
    await page.route('**/api/timeline**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              slug: 'timeline-stub-1',
              yearLabel: '2024年',
              yearValue: 2024,
              title: '里程碑 Stub',
              description: '测试里程碑描述',
              sortOrder: 1,
            },
          ],
          meta: {
            page: 1,
            limit: 8,
            total: 1,
            totalPages: 1,
            order: 'desc',
            hasNext: true,
            hasMore: true,
          },
        }),
      });
    });

    await page.goto('/history');
    await expect(page.getByRole('heading', { name: '核聚变发展历史' })).toBeVisible();
    await expect(page.getByRole('button', { name: /加载更多里程碑/ })).toBeVisible({ timeout: 15000 });

    await page.unroute('**/api/timeline**');
  });

  test('history page supports manual “加载更多里程碑” interaction', async ({ page }) => {
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

    await page.goto('/history');

    await expect(page.getByText('里程碑 1')).toBeVisible();
    await expect(page.getByRole('button', { name: '加载更多里程碑' })).toBeEnabled();

    await page.getByRole('button', { name: '加载更多里程碑' }).click();

    await expect.poll(() => requestedPages.includes('2')).toBeTruthy();

    await expect(page.getByText('里程碑 2')).toBeVisible();
    await expect(page.getByRole('button', { name: '已经到底啦' })).toBeDisabled();

    await page.unroute('**/api/timeline**');
  });

  test('links page renders mocked data', async ({ page }) => {
    await page.route('**/api/links**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              slug: 'education',
              title: '教育资源',
              sortOrder: 10,
              groups: [
                {
                  slug: 'universities',
                  title: '高校',
                  sortOrder: 5,
                  links: [
                    {
                      slug: 'example',
                      name: '示例资源',
                      url: 'https://example.com',
                      description: '示例描述',
                      sortOrder: 1,
                    },
                  ],
                },
              ],
            },
          ],
          meta: {
            linkCount: 1,
            groupCount: 1,
            sectionCount: 1,
            filters: {},
          },
        }),
      });
    });

    await page.goto('/links');
    await expect(page.getByRole('heading', { name: '核聚变资源导航' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '教育资源' })).toBeVisible();
    await expect(page.getByRole('link', { name: '示例资源' })).toHaveAttribute('href', 'https://example.com');

    await page.unroute('**/api/links**');
  });

  test('science page accessible via nav', async ({ page }) => {
    await page.goto('/');
    const navScience = page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '科普知识' });
    await navScience.click();
    await expect(page).toHaveURL(/\/science$/);
    await expect(page.getByRole('heading', { name: '核聚变科普知识' })).toBeVisible();
  });
});
