import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatchDocument extends Document {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  group: string;
  stage: string;
  matchDate: Date;
  venue: string;
  city: string;
  status: 'scheduled' | 'live' | 'finished';
  homeScore: number | null;
  awayScore: number | null;
}

const MatchSchema = new Schema<IMatchDocument>({
  matchId: { type: String, required: true, unique: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  group: { type: String, required: true },
  stage: { type: String, required: true },
  matchDate: { type: Date, required: true },
  venue: { type: String, required: true },
  city: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'finished'],
    default: 'scheduled',
  },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
});

const Match: Model<IMatchDocument> =
  mongoose.models.Match ?? mongoose.model<IMatchDocument>('Match', MatchSchema);

export default Match;
