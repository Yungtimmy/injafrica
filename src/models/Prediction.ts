import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPredictionDocument extends Document {
  userId: Types.ObjectId;
  discordId: string;
  matchId: Types.ObjectId;
  predictedHome: number | null;
  predictedAway: number | null;
  predictedQualifier: 'home' | 'away' | null;
  pointsEarned: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const PredictionSchema = new Schema<IPredictionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    discordId: { type: String, required: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    predictedHome: { type: Number, default: null },
    predictedAway: { type: Number, default: null },
    predictedQualifier: { type: String, enum: ['home', 'away'], default: null },
    pointsEarned: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
);

PredictionSchema.index({ discordId: 1, matchId: 1 }, { unique: true });

const Prediction: Model<IPredictionDocument> =
  mongoose.models.Prediction ??
  mongoose.model<IPredictionDocument>('Prediction', PredictionSchema);

export default Prediction;
