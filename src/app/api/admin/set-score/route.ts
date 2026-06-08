import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import User from '@/models/User';
import Settings from '@/models/Settings';
import { calculatePoints } from '@/lib/points';

function isAdmin(discordId: string): boolean {
  const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map((id) => id.trim());
  return adminIds.includes(discordId);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !isAdmin(session.user.discordId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { matchId, homeScore, awayScore } = body;

    if (matchId === undefined || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await dbConnect();

    const match = await Match.findByIdAndUpdate(
      matchId,
      {
        homeScore,
        awayScore,
        status: 'finished',
      },
      { new: true }
    );

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Score all predictions for this match
    const predictions = await Prediction.find({ matchId });
    let predictionsUpdated = 0;

    for (const pred of predictions) {
      const pts = calculatePoints(
        pred.predictedHome,
        pred.predictedAway,
        homeScore,
        awayScore
      );

      await Prediction.findByIdAndUpdate(pred._id, { pointsEarned: pts });

      // Update user total points (add if not already scored)
      if (pred.pointsEarned === null) {
        await User.findOneAndUpdate(
          { discordId: pred.discordId },
          { $inc: { points: pts } }
        );
      } else {
        // Re-score: adjust the difference
        const diff = pts - pred.pointsEarned;
        if (diff !== 0) {
          await User.findOneAndUpdate(
            { discordId: pred.discordId },
            { $inc: { points: diff } }
          );
        }
      }

      predictionsUpdated++;
    }

    return NextResponse.json({ success: true, predictionsUpdated });
  } catch (error) {
    console.error('POST /api/admin/set-score error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Toggle tournament status
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !isAdmin(session.user.discordId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { tournamentEnded } = body;

    await dbConnect();

    await Settings.findOneAndUpdate(
      { key: 'tournamentEnded' },
      { key: 'tournamentEnded', value: tournamentEnded },
      { upsert: true }
    );

    return NextResponse.json({ success: true, tournamentEnded });
  } catch (error) {
    console.error('PATCH /api/admin/set-score error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
