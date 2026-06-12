import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFinalPrediction extends Document {
  discordId: string;
  username: string;
  team1: string;
  team2: string;
  scoreTeam1: number;
  scoreTeam2: number;
  createdAt: Date;
  updatedAt: Date;
}

const FinalPredictionSchema = new Schema<IFinalPrediction>(
  {
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    scoreTeam1: { type: Number, required: true },
    scoreTeam2: { type: Number, required: true },
  },
  { timestamps: true }
);

const FinalPrediction: Model<IFinalPrediction> =
  mongoose.models.FinalPrediction ??
  mongoose.model<IFinalPrediction>('FinalPrediction', FinalPredictionSchema);

export default FinalPrediction;
