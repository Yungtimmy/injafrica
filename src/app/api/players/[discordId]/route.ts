import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Prediction from '@/models/Prediction';
import Match from '@/models/Match'; // ensure model is registered for .populate('matchId')

export async function GET(
  _req: NextRequest,
  { params }: { params: { discordId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Support both sync params (Next 14) and async (Next 15+)
    const resolvedParams = params && typeof (params as any).then === 'function' 
      ? await (params as any) 
      : params;
    const discordId = resolvedParams?.discordId;
    await dbConnect();

    const user = await User.findOne({ discordId }).select('discordId username avatar points createdAt').lean();
    if (!user) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const userPoints = (user as any).points ?? 0;
    const rank = (await User.countDocuments({ points: { $gt: userPoints } })) + 1;

    const predictions = await Prediction.find({ discordId, pointsEarned: { $ne: null } })
      .populate('matchId')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ user, rank, predictions });
  } catch (error) {
    console.error('GET /api/players/[discordId] error:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal server error', details }, { status: 500 });
  }
}
