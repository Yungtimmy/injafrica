import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const setting = await Settings.findOne({ key: 'tournamentEnded' }).lean();
    return NextResponse.json({
      tournamentEnded: setting ? (setting.value as boolean) : false,
    });
  } catch (error) {
    console.error('GET /api/admin/tournament-status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
