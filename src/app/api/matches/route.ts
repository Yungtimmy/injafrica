import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const matches = await Match.find({}).sort({ matchDate: 1 }).lean();
    return NextResponse.json(matches);
  } catch (error) {
    console.error('GET /api/matches error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
