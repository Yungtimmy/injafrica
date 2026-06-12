import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import FinalPrediction from '@/models/FinalPrediction';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const existing = await FinalPrediction.findOne({ discordId: session.user.discordId });
  return NextResponse.json(existing || null);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { team1, team2, scoreTeam1, scoreTeam2 } = await req.json();
  if (!team1 || !team2 || team1 === team2) {
    return NextResponse.json({ error: 'Select two different teams' }, { status: 400 });
  }
  if (typeof scoreTeam1 !== 'number' || typeof scoreTeam2 !== 'number' || scoreTeam1 < 0 || scoreTeam2 < 0) {
    return NextResponse.json({ error: 'Invalid scores' }, { status: 400 });
  }
  await dbConnect();
  const pred = await FinalPrediction.findOneAndUpdate(
    { discordId: session.user.discordId },
    { discordId: session.user.discordId, username: session.user.username, team1, team2, scoreTeam1, scoreTeam2 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return NextResponse.json(pred);
}
