import { format } from 'date-fns';

interface MatchShape {
  matchId?: string;
  homeTeam: string;
  awayTeam: string;
  stage: string;
  group?: string;
  matchDate: string | Date;
  status?: string;
}

interface ManualPredictionShape {
  predictedHome: number | null;
  predictedAway: number | null;
  predictedQualifier?: 'home' | 'away' | null;
}

interface AgentPredictionShape {
  predictedHome: number | null;
  predictedAway: number | null;
  predictedQualifier?: 'home' | 'away' | null;
  note?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  source?: string;
}

interface Props {
  match: MatchShape;
  manual: ManualPredictionShape | null;
  agent: AgentPredictionShape | null;
  /** Emphasis style; "highlight" makes the card pop for newly-submitted picks */
  highlight?: boolean;
}

export default function AgentComparisonCard({
  match,
  manual,
  agent,
  highlight = false,
}: Props) {
  const matchDate = new Date(match.matchDate);

  return (
    <div
      className={`sb-card overflow-hidden ${
        highlight ? 'border-l-4 border-l-sb-yellow' : ''
      }`}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-sb-border bg-sb-card-2">
        <span className="text-[10px] font-bold uppercase text-sb-muted tracking-wider">
          {match.stage === 'Group Stage' ? `Group ${match.group ?? ''}` : match.stage}
        </span>
        <span className="text-[10px] text-sb-muted">
          {format(matchDate, 'dd MMM · HH:mm')}
        </span>
      </div>

      <div className="px-3 py-2 text-center font-semibold text-white text-sm">
        {match.homeTeam}{' '}
        <span className="text-sb-muted font-normal">(home)</span>
        <span className="mx-2 text-sb-muted">vs</span>
        <span className="text-sb-muted font-normal">(away)</span>{' '}
        {match.awayTeam}
      </div>

      <div className="grid grid-cols-2 divide-x divide-sb-border border-t border-sb-border">
        <Column
          label="Your manual pick"
          accent="text-sb-muted"
          body={
            manual ? (
              <PredBody
                home={match.homeTeam}
                away={match.awayTeam}
                predictedHome={manual.predictedHome}
                predictedAway={manual.predictedAway}
                predictedQualifier={manual.predictedQualifier ?? null}
              />
            ) : (
              <Empty hint="Submit from /matches" />
            )
          }
        />
        <Column
          label="Agent's draft"
          accent="text-sb-yellow"
          body={
            agent ? (
              <div className="space-y-1.5">
                <PredBody
                  home={match.homeTeam}
                  away={match.awayTeam}
                  predictedHome={agent.predictedHome}
                  predictedAway={agent.predictedAway}
                  predictedQualifier={agent.predictedQualifier ?? null}
                />
                {agent.note && (
                  <p className="text-[11px] text-sb-muted italic leading-snug">
                    “{agent.note}”
                  </p>
                )}
                {agent.source && (
                  <p className="text-[9px] uppercase tracking-wider text-sb-muted">
                    via {agent.source}
                  </p>
                )}
              </div>
            ) : (
              <Empty hint="Ask the agent to predict." />
            )
          }
        />
      </div>

      {manual && agent && (
        <div className="px-3 py-1.5 border-t border-sb-border bg-sb-card-2/60 text-[10px] text-sb-muted">
          Agent drafts live in a SEPARATE collection and do not affect your manual
          pick. To earn real points, confirm the manual prediction on /matches.
        </div>
      )}
    </div>
  );
}

function Column({
  label,
  accent,
  body,
}: {
  label: string;
  accent: string;
  body: React.ReactNode;
}) {
  return (
    <div className="px-3 py-3">
      <div className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${accent}`}>
        {label}
      </div>
      {body}
    </div>
  );
}

function PredBody({
  home,
  away,
  predictedHome,
  predictedAway,
  predictedQualifier,
}: {
  home: string;
  away: string;
  predictedHome: number | null;
  predictedAway: number | null;
  predictedQualifier: 'home' | 'away' | null;
}) {
  if (predictedQualifier) {
    return (
      <div className="font-bold text-white text-base">
        {predictedQualifier === 'home' ? home : away}{' '}
        <span className="text-[10px] text-sb-muted font-semibold uppercase">
          (qualifies)
        </span>
      </div>
    );
  }
  if (predictedHome === null || predictedAway === null) {
    return <Empty hint="No score submitted" />;
  }
  return (
    <div className="font-bold text-white text-base font-mono">
      {predictedHome} – {predictedAway}
    </div>
  );
}

function Empty({ hint }: { hint: string }) {
  return <div className="text-[11px] text-sb-muted italic">{hint}</div>;
}
