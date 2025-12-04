import '@testing-library/jest-dom';
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinksDirectory } from '@/app/(site)/links/LinksDirectory';
import type { LinkSection } from '@/app/(site)/links/types';

const buildSection = (slug: string, title: string, linkSuffix: string): LinkSection => ({
  slug,
  title,
  sortOrder: 10,
  groups: [
    {
      slug: `${slug}-group`,
      title: `${title} 子组`,
      sortOrder: 5,
      links: [
        {
          slug: `${slug}-link-${linkSuffix}`,
          name: `${title} 资源 ${linkSuffix}`,
          url: `https://example.com/${slug}/${linkSuffix}`,
          description: `${title} 描述 ${linkSuffix}`,
          sortOrder: 3,
        },
      ],
    },
  ],
});

const originalIntersectionObserver = global.IntersectionObserver;

describe('LinksDirectory', () => {
  const originalFetch = global.fetch;

  beforeAll(() => {
    global.IntersectionObserver = class {
      observe() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  afterAll(() => {
    global.IntersectionObserver = originalIntersectionObserver;
  });

  it('渲染资源统计与初始分类', async () => {
    const sections: LinkSection[] = [
      buildSection('section-a', '分类 A', '1'),
      buildSection('section-b', '分类 B', '1'),
      buildSection('section-c', '分类 C', '1'),
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: sections,
          meta: { linkCount: 3, sectionCount: 3, groupCount: 3 },
        }),
    });

    render(<LinksDirectory sections={sections} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    expect(await screen.findByText(/资源统计：共收录/)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: '分类 A' })).toBeInTheDocument();
    const links = await screen.findAllByRole('link', { name: /资源/ });
    expect(links).toHaveLength(3);
  }, 10000);

  it('支持关键词搜索', async () => {
    const sections: LinkSection[] = [
      buildSection('section-a', '分类 A', '1'),
      buildSection('section-b', '分类 B', '1'),
    ];

    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      const q = new URL(url).searchParams.get('q') ?? '';
      const data = q.includes('分类 B 资源') ? [sections[1]] : sections;
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data,
            meta: { linkCount: data.length, sectionCount: data.length, groupCount: data.length },
          }),
      });
    });

    render(<LinksDirectory sections={sections} />);

    const user = userEvent.setup();
    const searchInput = screen.getByRole('searchbox', { name: '搜索聚变资源' });
    await act(async () => {
      await user.clear(searchInput);
      await user.type(searchInput, '分类 B 资源');
    });

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: '分类 A' })).not.toBeInTheDocument();
    });
    expect(await screen.findByRole('heading', { name: '分类 B' })).toBeInTheDocument();
  });

  it('点击“加载更多资源”显示更多分类', async () => {
    const sections: LinkSection[] = [
      buildSection('section-a', '分类 A', '1'),
      buildSection('section-b', '分类 B', '1'),
      buildSection('section-c', '分类 C', '1'),
      buildSection('section-d', '分类 D', '1'),
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: sections,
          meta: { linkCount: sections.length, sectionCount: sections.length, groupCount: sections.length },
        }),
    });

    render(<LinksDirectory sections={sections} />);

    expect(screen.queryByRole('heading', { name: '分类 D' })).not.toBeInTheDocument();

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '加载更多资源' }));
    });

    expect(await screen.findByRole('heading', { name: '分类 D' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '已经到底啦' })).toBeDisabled();
    });
  });
});
