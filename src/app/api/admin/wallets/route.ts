import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

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
  const users = await User.find({ walletAddress: { $exists: true, $nin: [null, ''] } })
    .sort({ points: -1 })
    .select('discordId username points walletAddress')
    .lean();

  return NextResponse.json(users);
}
