import { PaginateResult } from 'mongoose';

export interface GetAllRequestParams {
  search?: string;
  sortKey?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
  filter?: string;
}

interface MongoosePaginateParams {
  sort?: Record<string, number>;
  page?: number;
  limit?: number;
  select?: string;
}

export interface Paginated {
  docs: Array<Record<string, any>>;
  totalDocs: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  page: number;
  totalPages: number;
  prevPage: number;
  nextPage: number;
}

export const getPaginationOptions = (data: GetAllRequestParams) => {
  const options: MongoosePaginateParams = {};

  if (data.limit) {
    options.limit = data.limit;
  }
  if (data.page) {
    options.page = data.page;
  }
  if (data.sortOrder && data.sortKey) {
    options.sort = {};
    options.sort[data.sortKey] = data.sortOrder.localeCompare('asc') ? -1 : 1;
  }

  return options;
}

export const getPaginatedResult = (data: PaginateResult<any>): Paginated => {
  const paginatedResource: Paginated = {
    docs: data.docs,
    hasNextPage: data.hasNextPage,
    hasPrevPage: data.hasPrevPage,
    limit: data.limit,
    nextPage: data.nextPage,
    page: data.page,
    prevPage: data.prevPage,
    totalDocs: data.totalDocs,
    totalPages: data.totalPages,
  };

  return paginatedResource;
}
