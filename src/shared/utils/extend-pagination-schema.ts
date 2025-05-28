/* eslint-disable @typescript-eslint/no-empty-object-type */
import { z, ZodRawShape, ZodType } from 'zod';

type PaginationOptions = {
  withOrderBy?: boolean;
  withSearch?: boolean;
  withPagination?: boolean;
};

type SchemaInput<S extends ZodRawShape> = z.infer<z.ZodObject<S, any, any>>;

type ExtendInput<I, O extends PaginationOptions> = I &
  (O['withOrderBy'] extends true
    ? { orderBy?: `${string}:${'asc' | 'desc'}` }
    : {}) &
  (O['withSearch'] extends true ? { search?: string } : {}) &
  (O['withPagination'] extends true ? { skip: number; take: number } : {});

export function extendPaginationSchema<
  S extends ZodRawShape,
  O extends PaginationOptions,
>(props: {
  schema?: z.ZodObject<S, any, any>;
  options: O;
}): ZodType<ExtendInput<SchemaInput<S>, O>> {
  let schema = props.schema ?? z.object({});

  if (props.options.withOrderBy) {
    schema = schema.merge(
      z.object({
        orderBy: z
          .string()
          .regex(/^[a-zA-Z0-9]+:(asc|desc)$/)
          .optional(),
      }),
    );
  }

  if (props.options.withSearch) {
    schema = schema.merge(
      z.object({
        search: z.string().optional(),
      }),
    );
  }

  if (props.options.withPagination) {
    schema = schema.merge(
      z.object({
        skip: z.coerce.number().default(0),
        take: z.coerce.number().max(50).default(10),
      }),
    );
  }

  return schema as unknown as ZodType<ExtendInput<SchemaInput<S>, O>>;
}
