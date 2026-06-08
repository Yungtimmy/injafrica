import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import MatchCard from '@/components/MatchCard';
import { IMatch, IPrediction } from '@/types';

async function getMatchesData(discordId: string) {
  await dbConnect();

  const matches = await Match.find({}).sort({ matchDate: 1 }).lean();

  const predictions = await Prediction.find({ discordId }).lean();
  const predMap: Record<string, IPrediction> = {};
  for (const p of predictions) {
    predMap[p.matchId.toString()] = p as unknown as IPrediction;
  }

  // Group by stage then group
  const grouped: Record<string, Record<string, IMatch[]>> = {};
  for (const match of matches as unknown as IMatch[]) {
    if (!grouped[match.stage]) grouped[match.stage] = {};
    const key = match.group;
    if (!grouped[match.stage][key]) grouped[match.stage][key] = [];
    grouped[match.stage][key].push(match);
  }

  return { grouped, predMap };
}

const STAGE_ORDER = ['Group Stage', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'];

export default async function MatchesPage() {
  const session = await auth();
  if (!session || !session.user?.discordId) redirect('/');

  const { grouped, predMap } = await getMatchesData(session.user.discordId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">
          All <span className="gradient-text">Matches</span>
        </h1>
        <p className="text-gray-400">Predict scores before kickoff to earn points</p>
      </div>

      {STAGE_ORDER.filter((stage) => grouped[stage]).map((stage) => (
        <div key={stage} className="mb-10">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
            <span className="text-primary">|</span>
            {stage}
          </h2>

          {Object.entries(grouped[stage])
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([groupKey, matches]) => (
              <div key={groupKey} className="mb-6">
                {stage === 'Group Stage' && (
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1">
                    Group {groupKey}
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matches.map((match) => (
                    <MatchCard
                      key={match._id}
                      match={match}
                      prediction={predMap[match._id]}
                      showPredictionForm={match.status === 'scheduled'}
                      discordId={session.user.discordId}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
