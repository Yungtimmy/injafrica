import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Prediction from '@/models/Prediction';

function isAdmin(discordId: string): boolean {
  const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map((id) => id.trim());
  return adminIds.includes(discordId);
}

export async function POST() {
  const session = await auth();
  if (!session || !isAdmin(session.user.discordId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  // Delete all predictions and reset all user points to 0
  const [deletedPredictions] = await Promise.all([
    Prediction.deleteMany({}),
    User.updateMany({}, { $set: { points: 0 } }),
  ]);

  return NextResponse.json({
    message: `Reset complete. ${deletedPredictions.deletedCount} predictions deleted, all user points set to 0.`,
  });
}
