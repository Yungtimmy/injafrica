import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettingsDocument extends Document {
  key: string;
  value: unknown;
}

const SettingsSchema = new Schema<ISettingsDocument>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
});

const Settings: Model<ISettingsDocument> =
  mongoose.models.Settings ??
  mongoose.model<ISettingsDocument>('Settings', SettingsSchema);

export default Settings;
