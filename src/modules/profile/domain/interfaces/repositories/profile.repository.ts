import { Profile } from '@modules/profile/domain/aggregates/profile.aggregate';
import { Result } from '@inpro-labs/core';

export abstract class IProfileRepository {
  abstract save(profile: Profile): Promise<Result<Profile>>;
  abstract findByUserId(userId: string): Promise<Result<Profile>>;
  abstract findById(id: string): Promise<Result<Profile>>;
}
