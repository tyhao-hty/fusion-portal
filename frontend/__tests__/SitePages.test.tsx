import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import SciencePage from '@/app/(site)/science/page';
import TheoryPage from '@/app/(site)/theory/page';
import TechnologyPage from '@/app/(site)/technology/page';
import BusinessPage from '@/app/(site)/business/page';

describe('专题页面渲染', () => {
  const cases = [
    { name: 'science', Component: SciencePage, heading: '核聚变科普知识' },
    { name: 'theory', Component: TheoryPage, heading: '核聚变理论知识' },
    { name: 'technology', Component: TechnologyPage, heading: '核聚变技术路线' },
    { name: 'business', Component: BusinessPage, heading: '核聚变商业尝试' },
  ];

  it.each(cases)('%s 页面包含标题与返回链接', ({ Component, heading }) => {
    render(<Component />);

    expect(screen.getByRole('link', { name: '← 返回首页' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
