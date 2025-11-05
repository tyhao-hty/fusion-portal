import '@testing-library/jest-dom';
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinksDirectory } from '@/app/site/links/LinksDirectory';
import type { LinkSection } from '@/app/site/links/types';

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
  beforeAll(() => {
    global.IntersectionObserver = class {
      observe() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
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

    render(<LinksDirectory sections={sections} />);

    expect(await screen.findByText(/资源统计：共收录/)).toBeInTheDocument();
    expect(await screen.findByText('分类 A')).toBeInTheDocument();
    expect(screen.getByText('分类 A 子组')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /资源/ })).toHaveLength(3);
  });

  it('支持关键词搜索', async () => {
    const sections: LinkSection[] = [
      buildSection('section-a', '分类 A', '1'),
      buildSection('section-b', '分类 B', '1'),
    ];

    render(<LinksDirectory sections={sections} />);

    const user = userEvent.setup();
    const searchInput = screen.getByRole('searchbox', { name: '搜索聚变资源' });
    await act(async () => {
      await user.clear(searchInput);
      await user.type(searchInput, '分类 B 资源');
    });

    await waitFor(() => {
      expect(screen.queryByText('分类 A')).not.toBeInTheDocument();
    });
    expect(await screen.findByText('分类 B')).toBeInTheDocument();
  });

  it('点击“加载更多资源”显示更多分类', async () => {
    const sections: LinkSection[] = [
      buildSection('section-a', '分类 A', '1'),
      buildSection('section-b', '分类 B', '1'),
      buildSection('section-c', '分类 C', '1'),
      buildSection('section-d', '分类 D', '1'),
    ];

    render(<LinksDirectory sections={sections} />);

    expect(screen.queryByText('分类 D')).not.toBeInTheDocument();

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole('button', { name: '加载更多资源' }));
    });

    expect(await screen.findByText('分类 D')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '已经到底啦' })).toBeDisabled();
    });
  });
});
