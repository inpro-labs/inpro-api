import { ID } from '@inpro-labs/core';
import { Profile } from '@modules/profile/domain/aggregates/profile.aggregate';

interface ProfileProps {
  id: ID;
  userId: ID;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  userName: string;
  bio: string;
  about: string;
  avatarUrl: string;
  bannerUrl: string;
  location: string;
}

export class ProfileFactory {
  static make(data: ProfileProps): Profile {
    return Profile.create({
      id: data.id,
      userId: data.userId,
      name: data.name,
      userName: data.userName,
      bio: data.bio,
      about: data.about,
      avatarUrl: data.avatarUrl,
      bannerUrl: data.bannerUrl,
      location: data.location,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }).unwrap();
  }
}
