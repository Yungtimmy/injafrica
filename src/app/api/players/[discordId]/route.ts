import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Prediction from '@/models/Prediction';

export async function GET(
  _req: NextRequest,
  { params }: { params: { discordId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { discordId } = params;
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
