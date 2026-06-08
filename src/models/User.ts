import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string;
  points: number;
  walletAddress?: string;
  walletSubmittedAt?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    discriminator: { type: String, default: '0' },
    avatar: { type: String, default: '' },
    points: { type: Number, default: 0 },
    walletAddress: { type: String },
    walletSubmittedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>('User', UserSchema);

export default User;
