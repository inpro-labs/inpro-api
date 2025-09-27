import { Aggregate, Err, ID, Ok, Result } from '@inpro-labs/core';
import z from 'zod';

interface ProfileProps {
  id?: ID;
  userId: ID;
  userName: string;
  bio: string;
  about: string;
  avatarUrl: string;
  bannerUrl: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Profile extends Aggregate<ProfileProps> {
  static readonly schema = z.object({
    id: z.optional(z.custom<ID>((value) => value instanceof ID)),
    userId: z.custom<ID>((value) => value instanceof ID),
    userName: z.string(),
    bio: z.string(),
    about: z.string(),
    avatarUrl: z.string(),
    bannerUrl: z.string(),
    location: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });

  private constructor(props: ProfileProps) {
    super(props);
  }

  static create(props: ProfileProps): Result<Profile> {
    if (!Profile.isValidProps(props)) {
      return Err(new Error('Invalid profile props'));
    }

    const profile = new Profile(props);

    return Ok(profile);
  }

  static isValidProps(props: ProfileProps) {
    return Profile.schema.safeParse(props).success;
  }
}
