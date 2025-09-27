import { Result } from '@inpro-labs/core';
import { Profile } from '@modules/profile/domain/aggregates/profile.aggregate';

export type CreateProfileInputDTO = {
  userId: string;
  userName: string;
  bio: string;
  about: string;
  avatarUrl: string;
  bannerUrl: string;
  location: string;
};

export type CreateProfileOutputDTO = Result<{
  profile: Profile;
}>;
