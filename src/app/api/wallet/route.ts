import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.discordId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { walletAddress } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    if (!walletAddress.startsWith('inj1') || walletAddress.length !== 42) {
      return NextResponse.json(
        { error: 'Must be a valid Injective address (inj1... 42 chars)' },
        { status: 400 }
      );
    }

    await dbConnect();
    await User.findOneAndUpdate(
      { discordId: session.user.discordId },
      { walletAddress, walletSubmittedAt: new Date() }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/wallet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
