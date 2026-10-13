export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePositiveInteger = (
  value: unknown,
  defaultValue: number
): number | null => {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

export const parsePagination = (query: unknown): PaginationOptions | null => {
  if (typeof query !== "object" || query === null) {
    return null;
  }

  const params = query as Record<string, unknown>;
  const page = parsePositiveInteger(params.page, DEFAULT_PAGE);
  const limit = parsePositiveInteger(params.limit, DEFAULT_LIMIT);

  if (
    page === null ||
    limit === null ||
    limit > MAX_LIMIT ||
    !Number.isSafeInteger((page - 1) * limit)
  ) {
    return null;
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const createPaginationMetadata = (
  page: number,
  limit: number,
  total: number
): PaginationMetadata => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
};
