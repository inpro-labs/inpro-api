import { Profile } from '@modules/profile/domain/aggregates/profile.aggregate';
import { Profile as ProfileModel } from '@prisma/client';
import { ProfileFactory } from '../factories/profile.factory';
import { ID } from '@inpro-labs/core';

export class ProfileMapper {
  static fromModelToDomain(notification: ProfileModel): Profile {
    return ProfileFactory.make({
      id: ID.create(notification.id).unwrap(),
      userId: ID.create(notification.userId).unwrap(),
      name: notification.name,
      userName: notification.userName,
      bio: notification.bio,
      about: notification.about,
      avatarUrl: notification.avatarUrl,
      bannerUrl: notification.bannerUrl,
      location: notification.location,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    });
  }

  static fromDomainToModel(item: Profile): ProfileModel {
    const {
      id,
      userName,
      bio,
      about,
      avatarUrl,
      bannerUrl,
      location,
      createdAt,
      updatedAt,
      userId,
      name,
    } = item.toObject();

    return {
      id,
      userId,
      userName,
      bio,
      about,
      avatarUrl,
      bannerUrl,
      location,
      createdAt,
      updatedAt,
      name,
    };
  }
}
