import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Prediction from '@/models/Prediction';
import Settings from '@/models/Settings';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const predictions = await Prediction.find({ discordId: session.user.discordId })
      .populate('matchId')
      .sort({ createdAt: -1 })
      .lean();

    const tournamentSetting = await Settings.findOne({ key: 'tournamentEnded' }).lean();
    const tournamentEnded = tournamentSetting
      ? (tournamentSetting.value as boolean)
      : false;

    return NextResponse.json({ predictions, tournamentEnded });
  } catch (error) {
    console.error('GET /api/predictions/profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
