import { Document, Schema } from 'mongoose';
import { SessionModel } from '../models/session.model';

export interface SessionDocument extends Document, Omit<SessionModel, '_id'> {}

export const sessionSchema = new Schema<SessionDocument>(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID() as string,
    },
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    device: {
      type: String,
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    refreshTokenDigest: {
      type: String,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastRefreshAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'sessions',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    id: false,
  },
);

sessionSchema.index({
  userId: 1,
  expiresAt: 1,
  revokedAt: 1,
  refreshTokenDigest: 1,
});
