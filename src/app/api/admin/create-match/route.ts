import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

function isAdmin(discordId: string): boolean {
  const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map((id) => id.trim());
  return adminIds.includes(discordId);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !isAdmin(session.user.discordId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { homeTeam, awayTeam, stage, group, matchDate, venue, city } = body;

    if (!homeTeam || !awayTeam || !stage || !matchDate) {
      return NextResponse.json({ error: 'homeTeam, awayTeam, stage, and matchDate are required' }, { status: 400 });
    }

    await dbConnect();

    // Generate a unique matchId (the string field is required by schema but only used for seeded group fixtures)
    const generatedMatchId = `KO-${stage.replace(/\s+/g, '').toUpperCase().slice(0, 8)}-${Date.now().toString(36)}`;

    const match = await Match.create({
      matchId: generatedMatchId,
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      stage: stage.trim(),
      group: group?.trim() || '',
      matchDate: new Date(matchDate),
      venue: venue?.trim() || '',
      city: city?.trim() || '',
      status: 'scheduled',
      homeScore: null,
      awayScore: null,
    });

    return NextResponse.json({ message: 'Match created', match }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/create-match error:', error);
    const msg = error?.message || 'Internal server error';
    return NextResponse.json({ error: msg.includes('validation') || error?.name === 'ValidationError' ? msg : 'Internal server error' }, { status: 500 });
  }
}
