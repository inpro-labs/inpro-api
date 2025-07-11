import { Err, Ok, Result, ValueObject } from '@inpro-labs/core';

export class NotificationVariables extends ValueObject<
  Record<string, unknown>
> {
  private constructor(props: Record<string, unknown>) {
    super(props);
  }

  public static create(
    props: Record<string, unknown>,
  ): Result<NotificationVariables, Error> {
    if (typeof props !== 'object' || props === null) {
      return Err(new Error('Invalid variables'));
    }

    return Ok(new NotificationVariables(props));
  }
}
