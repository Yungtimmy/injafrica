import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import FinalPrediction from '@/models/FinalPrediction';

function isAdmin(discordId: string): boolean {
  const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map((id) => id.trim());
  return adminIds.includes(discordId);
}

export async function GET() {
  const session = await auth();
  if (!session || !isAdmin(session.user.discordId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const predictions = await FinalPrediction.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(predictions);
}
