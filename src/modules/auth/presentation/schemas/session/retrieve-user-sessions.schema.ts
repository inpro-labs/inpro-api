import { extendPaginationSchema } from '@shared/utils/extend-pagination-schema';

export const retrieveUserSessionsQuerySchema = extendPaginationSchema({
  options: {
    withOrderBy: true,
    withSearch: true,
    withPagination: true,
  } as const,
});
