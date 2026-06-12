import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

function isAdmin(discordId: string): boolean {
  const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map((id) => id.trim());
  return adminIds.includes(discordId);
}

const CORRECT_TIMES: Record<string, string> = {
  A1:'2026-06-11T19:00:00Z',A2:'2026-06-12T02:00:00Z',A3:'2026-06-25T01:00:00Z',A4:'2026-06-25T01:00:00Z',A5:'2026-06-19T01:00:00Z',A6:'2026-06-18T16:00:00Z',
  B1:'2026-06-12T19:00:00Z',B2:'2026-06-13T19:00:00Z',B3:'2026-06-24T19:00:00Z',B4:'2026-06-24T19:00:00Z',B5:'2026-06-18T22:00:00Z',B6:'2026-06-18T19:00:00Z',
  C1:'2026-06-13T22:00:00Z',C2:'2026-06-14T01:00:00Z',C3:'2026-06-24T22:00:00Z',C4:'2026-06-24T22:00:00Z',C5:'2026-06-20T01:00:00Z',C6:'2026-06-19T22:00:00Z',
  D1:'2026-06-13T01:00:00Z',D2:'2026-06-14T04:00:00Z',D3:'2026-06-26T02:00:00Z',D4:'2026-06-26T02:00:00Z',D5:'2026-06-19T19:00:00Z',D6:'2026-06-20T04:00:00Z',
  E1:'2026-06-20T20:00:00Z',E2:'2026-06-21T00:00:00Z',E3:'2026-06-14T17:00:00Z',E4:'2026-06-14T23:00:00Z',E5:'2026-06-25T20:00:00Z',E6:'2026-06-25T20:00:00Z',
  F1:'2026-06-14T20:00:00Z',F2:'2026-06-15T02:00:00Z',F3:'2026-06-25T23:00:00Z',F4:'2026-06-25T23:00:00Z',F5:'2026-06-20T17:00:00Z',F6:'2026-06-21T04:00:00Z',
  G1:'2026-06-15T19:00:00Z',G2:'2026-06-16T04:00:00Z',G3:'2026-06-27T03:00:00Z',G4:'2026-06-27T03:00:00Z',G5:'2026-06-21T19:00:00Z',G6:'2026-06-22T01:00:00Z',
  H1:'2026-06-15T16:00:00Z',H2:'2026-06-15T22:00:00Z',H3:'2026-06-27T00:00:00Z',H4:'2026-06-27T00:00:00Z',H5:'2026-06-21T16:00:00Z',H6:'2026-06-21T22:00:00Z',
  I1:'2026-06-16T19:00:00Z',I2:'2026-06-16T22:00:00Z',I3:'2026-06-26T19:00:00Z',I4:'2026-06-26T19:00:00Z',I5:'2026-06-22T21:00:00Z',I6:'2026-06-23T00:00:00Z',
  J1:'2026-06-17T01:00:00Z',J2:'2026-06-17T04:00:00Z',J3:'2026-06-28T02:00:00Z',J4:'2026-06-28T02:00:00Z',J5:'2026-06-22T17:00:00Z',J6:'2026-06-23T03:00:00Z',
  K1:'2026-06-17T17:00:00Z',K2:'2026-06-18T02:00:00Z',K3:'2026-06-27T23:30:00Z',K4:'2026-06-27T23:30:00Z',K5:'2026-06-23T17:00:00Z',K6:'2026-06-24T02:00:00Z',
  L1:'2026-06-17T20:00:00Z',L2:'2026-06-17T23:00:00Z',L3:'2026-06-27T21:00:00Z',L4:'2026-06-27T21:00:00Z',L5:'2026-06-23T20:00:00Z',L6:'2026-06-23T23:00:00Z',
};

export async function POST() {
  const session = await auth();
  if (!session || !isAdmin(session.user.discordId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  let updated = 0, skipped = 0;
  for (const [matchId, isoDate] of Object.entries(CORRECT_TIMES)) {
    const result = await Match.updateOne({ matchId }, { $set: { matchDate: new Date(isoDate) } });
    result.matchedCount === 0 ? skipped++ : updated++;
  }
  return NextResponse.json({ updated, skipped });
}
