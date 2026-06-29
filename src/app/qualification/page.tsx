import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import QualificationForm from '@/components/QualificationForm';
import { IMatch, IPrediction } from '@/types';

async function getQualificationData(discordId: string) {
  await dbConnect();

  const matches = await Match.find({ stage: { $ne: 'Group Stage' } })
    .sort({ matchDate: 1 })
    .lean();

  const predictions = await Prediction.find({ discordId }).lean();
  const predMap: Record<string, IPrediction> = {};
  for (const p of predictions) {
    predMap[p.matchId.toString()] = p as unknown as IPrediction;
  }

  return { matches: matches as unknown as IMatch[], predMap };
}

export default async function QualificationPage() {
  const session = await auth();
  if (!session || !session.user?.discordId) redirect('/');

  const { matches, predMap } = await getQualificationData(session.user.discordId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">
          Qualification <span className="gradient-text">Knockouts</span>
        </h1>
        <p className="text-gray-400">
          Predict who advances in knockout stages (even on penalties). Correct guess = <span className="text-sb-yellow font-bold">+2 pts</span>. No draws, no scores.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="sb-card p-8 text-center text-sb-muted">No knockout matches yet.</div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const prediction = predMap[match._id];
            const canPredict = match.status === 'scheduled' && new Date() < new Date(match.matchDate);
            return (
              <div key={match._id} className="sb-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-white text-sm">
                      {match.homeTeam} <span className="text-sb-muted">vs</span> {match.awayTeam}
                    </div>
                    <div className="text-[10px] text-sb-muted">
                      {new Date(match.matchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {match.city}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                    match.status === 'finished' ? 'bg-sb-border text-sb-muted' :
                    match.status === 'live' ? 'bg-sb-live/20 text-sb-live' :
                    'bg-green-900/40 text-green-400'
                  }`}>
                    {match.status}
                  </span>
                </div>

                {canPredict ? (
                  <QualificationForm
                    matchId={match._id}
                    homeTeam={match.homeTeam}
                    awayTeam={match.awayTeam}
                    existingPrediction={prediction}
                  />
                ) : (
                  <div className="text-[10px] text-sb-muted">
                    {prediction?.predictedQualifier
                      ? `Your pick: ${prediction.predictedQualifier === 'home' ? match.homeTeam : match.awayTeam} (qualifies)`
                      : 'Prediction closed'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
