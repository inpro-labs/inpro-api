import { Result, ValueObject, Ok, Err } from '@inpro-labs/core';
import { PlaceholderSensitivity } from '../enums/placeholder-sensitivity.enum';
import { z } from 'zod';

interface PlaceholderProps {
  name: string;
  description?: string;
  sensitivity: PlaceholderSensitivity;
}

export class Placeholder extends ValueObject<PlaceholderProps> {
  static readonly schema = z.object({
    name: z.string(),
    description: z.string().optional(),
    sensitivity: z.nativeEnum(PlaceholderSensitivity),
  });

  private constructor(props: PlaceholderProps) {
    super(props);
  }

  static isValidProps(props: unknown): props is PlaceholderProps {
    console.log(Placeholder.schema.safeParse(props).error);
    return Placeholder.schema.safeParse(props).success;
  }

  static create(props: PlaceholderProps): Result<Placeholder, Error> {
    if (!Placeholder.isValidProps(props)) {
      return Err(new Error('Invalid placeholder props'));
    }

    return Ok(new Placeholder(props));
  }
}
