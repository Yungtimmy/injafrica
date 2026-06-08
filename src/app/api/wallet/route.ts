import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Settings from '@/models/Settings';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    // Check tournament ended
    const tournamentSetting = await Settings.findOne({ key: 'tournamentEnded' }).lean();
    const tournamentEnded = tournamentSetting
      ? (tournamentSetting.value as boolean)
      : false;

    if (!tournamentEnded) {
      return NextResponse.json(
        { error: 'Tournament is still ongoing' },
        { status: 403 }
      );
    }

    // Check top 3
    const users = await User.find({}).sort({ points: -1 }).limit(3).lean();
    const top3Ids = users.map((u) => u.discordId);

    if (!top3Ids.includes(session.user.discordId)) {
      return NextResponse.json(
        { error: 'Only top 3 users can submit wallet addresses' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { walletAddress } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // Basic Injective address validation
    if (!walletAddress.startsWith('inj1') || walletAddress.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid Injective wallet address format' },
        { status: 400 }
      );
    }

    await User.findOneAndUpdate(
      { discordId: session.user.discordId },
      {
        walletAddress,
        walletSubmittedAt: new Date(),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/wallet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
