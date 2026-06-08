import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Prediction from '@/models/Prediction';

export async function GET(
  _req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const prediction = await Prediction.findOne({
      discordId: session.user.discordId,
      matchId: params.matchId,
    }).lean();

    if (!prediction) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('GET /api/predictions/[matchId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
