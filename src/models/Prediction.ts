import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPredictionDocument extends Document {
  userId: Types.ObjectId;
  discordId: string;
  matchId: Types.ObjectId;
  predictedHome: number;
  predictedAway: number;
  pointsEarned: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const PredictionSchema = new Schema<IPredictionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    discordId: { type: String, required: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    predictedHome: { type: Number, required: true },
    predictedAway: { type: Number, required: true },
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
