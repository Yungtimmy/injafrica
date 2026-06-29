import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { matchId, predictedHome, predictedAway, predictedQualifier } = body;

    if (matchId === undefined || ((predictedHome === undefined || predictedAway === undefined) && !predictedQualifier)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (predictedHome !== undefined && (typeof predictedHome !== 'number' || predictedHome < 0)) {
      return NextResponse.json({ error: 'Scores must be non-negative numbers' }, { status: 400 });
    }
    if (predictedAway !== undefined && (typeof predictedAway !== 'number' || predictedAway < 0)) {
      return NextResponse.json({ error: 'Scores must be non-negative numbers' }, { status: 400 });
    }
    if (predictedQualifier && !['home', 'away'].includes(predictedQualifier)) {
      return NextResponse.json({ error: 'predictedQualifier must be "home" or "away"' }, { status: 400 });
    }

    await dbConnect();

    const match = await Match.findById(matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Cannot predict after match has started' },
        { status: 400 }
      );
    }

    if (new Date() >= match.matchDate) {
      return NextResponse.json(
        { error: 'Prediction deadline has passed' },
        { status: 400 }
      );
    }

    if (predictedQualifier && match.stage === 'Group Stage') {
      return NextResponse.json({ error: 'Qualification predictions are only for knockout stages' }, { status: 400 });
    }

    // Get user document
    const user = await User.findOne({ discordId: session.user.discordId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build update (support partial for qualifier + scores on same prediction)
    const updateData: any = {
      userId: user._id,
      discordId: session.user.discordId,
      matchId,
      pointsEarned: null,
    };
    if (predictedHome !== undefined) updateData.predictedHome = predictedHome;
    if (predictedAway !== undefined) updateData.predictedAway = predictedAway;
    if (predictedQualifier) updateData.predictedQualifier = predictedQualifier;

    // Upsert prediction
    const prediction = await Prediction.findOneAndUpdate(
      { discordId: session.user.discordId, matchId },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(prediction, { status: 200 });
  } catch (error) {
    console.error('POST /api/predictions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
