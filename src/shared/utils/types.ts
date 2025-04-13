import { z } from 'zod';

/* eslint-disable @typescript-eslint/no-empty-object-type */
export type Pagination = {
  take: number;
  skip: number;
};

export type OrderBy = {
  [key: string]: 'asc' | 'desc';
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
};

export type QueryParams<
  T = undefined,
  P = undefined,
  O = undefined,
  S = undefined,
> = (T extends undefined ? {} : { data: T }) &
  (P extends undefined ? {} : { pagination: Pagination }) &
  (O extends undefined ? {} : { orderBy: OrderBy }) &
  (S extends undefined ? {} : { search: string });

export const ZodQueryParamsSchema = z.object({
  orderBy: z.record(z.string(), z.enum(['asc', 'desc'])).optional(),
  search: z.string().optional(),
  pagination: z.object({
    take: z.number().optional(),
    skip: z.number().optional(),
  }),
});

export function zodQueryParams<T extends z.ZodObject<any>>(schema: T) {
  return z.object({
    ...schema.shape,
    ...ZodQueryParamsSchema.shape,
  });
}
