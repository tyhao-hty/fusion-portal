export type LinkItem = {
  slug: string;
  name: string;
  url: string;
  description: string | null;
  sortOrder: number;
};

export type LinkGroup = {
  slug: string;
  title: string | null;
  sortOrder: number;
  links: LinkItem[];
};

export type LinkSection = {
  slug: string;
  title: string;
  sortOrder: number;
  groups: LinkGroup[];
};

export type LinksResponse = {
  data: LinkSection[];
  meta: {
    sectionCount: number;
    groupCount: number;
    linkCount: number;
  };
};
