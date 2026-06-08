import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import { wc2026Fixtures } from '@/data/wc2026-fixtures';

function isAdmin(discordId: string): boolean {
  const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map((id) => id.trim());
  return adminIds.includes(discordId);
}

export async function POST() {
  const session = await auth();
  if (!session || !isAdmin(session.user.discordId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    let inserted = 0;
    let skipped = 0;

    for (const fixture of wc2026Fixtures) {
      const existing = await Match.findOne({ matchId: fixture.matchId });
      if (existing) {
        skipped++;
        continue;
      }
      await Match.create(fixture);
      inserted++;
    }

    return NextResponse.json({
      message: `Seeded ${inserted} fixtures. Skipped ${skipped} existing.`,
      inserted,
      skipped,
    });
  } catch (error) {
    console.error('POST /api/admin/seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
