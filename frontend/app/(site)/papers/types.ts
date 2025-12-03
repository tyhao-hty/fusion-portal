export type PaperTag = {
  slug: string;
  name: string;
};

export type Paper = {
  slug: string;
  title: string;
  authors: string;
  year: number;
  venue: string | null;
  url: string | null;
  abstract: string | null;
  sortOrder: number;
  tags: PaperTag[];
  createdAt: string;
  updatedAt: string;
};

export type PapersResponse = {
  data: Paper[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
  };
};
