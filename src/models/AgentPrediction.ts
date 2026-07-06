import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAgentPredictionDocument extends Document {
  userId: Types.ObjectId;
  discordId: string;
  matchId: Types.ObjectId;
  predictedHome: number | null;
  predictedAway: number | null;
  predictedQualifier: 'home' | 'away' | null;
  source: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for the SEPARATE `agentpredictions` collection.
 *
 * ISOLATION GUARANTEE:
 *   This collection is intentionally orthogonal to the existing `Prediction`
 *   collection. It is never queried by /api/admin/set-score, never summed
 *   into leaderboard totals, and never mutated by any existing code path.
 *   Submitting a row here cannot affect `User.points` by construction.
 */
const AgentPredictionSchema = new Schema<IAgentPredictionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    discordId: { type: String, required: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    predictedHome: { type: Number, default: null },
    predictedAway: { type: Number, default: null },
    predictedQualifier: { type: String, enum: ['home', 'away'], default: null },
    // Audit marker. Useful for distinguishing MCP writes from future
    // discord-bot or programmatic clients that share the endpoint.
    source: { type: String, default: 'agent-mcp' },
    // Optional free-form note shown alongside the agent draft in the UI.
    note: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

// One agent draft per (discordId, matchId) — repeated submit_prediction calls
// upsert in place via the MCP tool rather than appending rows.
AgentPredictionSchema.index({ discordId: 1, matchId: 1 }, { unique: true });

const AgentPrediction: Model<IAgentPredictionDocument> =
  mongoose.models.AgentPrediction ??
  mongoose.model<IAgentPredictionDocument>('AgentPrediction', AgentPredictionSchema);

export default AgentPrediction;
