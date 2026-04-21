export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface HousesQueryParams {
  page: number;
  pageSize: number;
  name: string;
}
