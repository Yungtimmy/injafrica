#!/usr/bin/env node
/**
 * scripts/smoke-africp-auth.mjs — Authenticated Africp round-trip smoke test.
 *
 * Plan:
 *   1. Spin up an in-memory Mongo (mongodb-memory-server).
 *   2. Connect mongoose, set env MONGODB_URI, seed one User + one Match
 *      using INLINE schemas that mirror src/models/*. This keeps the
 *      Node script standalone — no need to import .ts files.
 *   3. Spawn `next dev` as a subprocess with MONGODB_URI + AUTH_*
 *      pointing at the in-memory Mongo and the smoke secret.
 *   4. Mint a NextAuth v5 session JWT cookie via next-auth/jwt's encode.
 *      Top-level token fields must include discordId, username,
 *      discriminator, avatar, points, walletAddress — username/avatar
 *      are NOT refreshed from the DB on every request, so leaving
 *      them out would set them to undefined in session.user.*.
 *   5. POST /api/africp with tools/call=submit_prediction → JSON-RPC.
 *   6. GET /api/predictions/agent-history.
 *   7. Assert isolation: User.points still 0, Prediction empty, AgentPrediction = 1.
 *   8. Tear down.
 *
 * Run via `npm run smoke:africp`.
 */

import { spawn } from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { encode } from 'next-auth/jwt';

const TEST_DISCORD_ID = 'smoketest-discord-abc';
const TEST_USERNAME = 'smoke';
const TEST_AVATAR = 'https://cdn.discordapp.com/embed/avatars/0.png';
const BUSINESS_MATCH_ID = 'S1';
const COOKIE_NAME = 'authjs.session-token';
const COOKIE_SALT = COOKIE_NAME; // NextAuth v5 salts by cookie name
const SMOKE_SECRET =
  process.env.AUTH_SECRET || 'smoketest-dummy-secret-do-not-use-in-prod-1234567890abcdef';
const PORT = 3000;
const READY_TIMEOUT_MS = 60_000;

const log = (...args) => console.log('[smoke]', ...args);

function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

// --------------------------------------------------------------------------
// Inline Mongoose schemas that mirror /src/models/*. We use these from the
// host Node process so the script doesn't have to compile/import the TS
// models. The dev server uses its own copies; both write to the same DB.
// --------------------------------------------------------------------------
const UserSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true, unique: true },
    username: { type: String, default: '' },
    discriminator: { type: String, default: '0' },
    avatar: { type: String, default: '' },
    points: { type: Number, default: 0 },
    walletAddress: { type: String },
    walletSubmittedAt: { type: Date },
  },
  { timestamps: true }
);

const MatchSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  group: { type: String, default: '' },
  stage: { type: String, required: true },
  matchDate: { type: Date, required: true },
  venue: { type: String, default: '' },
  city: { type: String, default: '' },
  status: { type: String, enum: ['scheduled', 'live', 'finished'], default: 'scheduled' },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  qualifier: { type: String, enum: ['home', 'away'], default: null },
});

const PredictionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    discordId: { type: String, required: true },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    predictedHome: { type: Number, default: null },
    predictedAway: { type: Number, default: null },
    predictedQualifier: { type: String, enum: ['home', 'away'], default: null },
    pointsEarned: { type: Number, default: null },
  },
  { timestamps: true }
);
PredictionSchema.index({ discordId: 1, matchId: 1 }, { unique: true });

const AgentPredictionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    discordId: { type: String, required: true },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    predictedHome: { type: Number, default: null },
    predictedAway: { type: Number, default: null },
    predictedQualifier: { type: String, enum: ['home', 'away'], default: null },
    source: { type: String, default: 'agent-africp' },
    note: { type: String, default: null },
  },
  { timestamps: true }
);
AgentPredictionSchema.index({ discordId: 1, matchId: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
const Match = mongoose.model('Match', MatchSchema);
const Prediction = mongoose.model('Prediction', PredictionSchema);
const AgentPrediction = mongoose.model('AgentPrediction', AgentPredictionSchema);

// --------------------------------------------------------------------------
// Dev server lifecycle
// --------------------------------------------------------------------------
async function waitForReady() {
  const start = Date.now();
  while (Date.now() - start < READY_TIMEOUT_MS) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/`, { redirect: 'manual' });
      if (res.status < 500) return; // 2xx/3xx/4xx OK as long as it's NOT 500
    } catch {
      // not up yet
    }
    await wait(500);
  }
  throw new Error(`next dev on :${PORT} did not become ready within ${READY_TIMEOUT_MS}ms`);
}

async function spawnNextDev() {
  log('spawning next dev...');
  log(`  MONGODB_URI we will pass: ${process.env.MONGODB_URI}`);
  // Use the project's installed next binary directly to avoid npx resolution noise.
  const nextBin = new URL('../node_modules/.bin/next', import.meta.url).pathname;
  const proc = spawn(nextBin, ['dev', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      MONGODB_URI: process.env.MONGODB_URI,
      AUTH_SECRET: SMOKE_SECRET,
      AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID || '0',
      AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET || '0',
      NODE_ENV: 'development',
    },
  });
  proc.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    process.stdout.write(`[next] ${text.replace(/\n(?=.)/g, '\n[next] ')}`);
  });
  proc.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    process.stderr.write(`[next:err] ${text.replace(/\n(?=.)/g, '\n[next:err] ')}`);
  });
  proc.on('exit', (code) => {
    log(`next dev exited (code ${code})`);
  });
  return { proc };
}

// --------------------------------------------------------------------------
// Main flow
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// .env masking: a committed .env overrides the MONGODB_URI we pass to next dev
// (Next.js auto-loads .env at startup and lets env-file values win), which
// would silently redirect the dev process at a real local mongod. We rename
// .env out of the way for the duration of the test, then restore it.
// --------------------------------------------------------------------------
const PROJECT_ROOT = process.cwd();
const ENV_PATH = path.resolve(PROJECT_ROOT, '.env');
const ENV_BACKUP_PATH = path.resolve(PROJECT_ROOT, '.env.smoke-backup');
function maskEnvFile() {
  if (existsSync(ENV_PATH)) {
    log('masking .env -> .env.smoke-backup so next dev cannot auto-override our MONGODB_URI');
    renameSync(ENV_PATH, ENV_BACKUP_PATH);
    return true;
  }
  return false;
}
function restoreEnvFile() {
  if (existsSync(ENV_BACKUP_PATH)) {
    try {
      renameSync(ENV_BACKUP_PATH, ENV_PATH);
      log('restored .env from .env.smoke-backup');
    } catch (e) {
      log(`WARN: failed to restore .env: ${e?.message ?? e}`);
    }
  }
}

async function main() {
  // 0. Mask installed env so Next.js can't poison our MONGODB_URI.
  const envWasMasked = maskEnvFile();
  // 1. In-memory Mongo
  log('starting MongoMemoryServer...');
  const mem = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mem.getUri();
  log('Mongo at', process.env.MONGODB_URI);

  // 2. Connect, clean, seed
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([
    User.deleteMany({}),
    Match.deleteMany({}),
    Prediction.deleteMany({}),
    AgentPrediction.deleteMany({}),
  ]);
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days
  await User.create({
    discordId: TEST_DISCORD_ID,
    username: TEST_USERNAME,
    discriminator: '0',
    avatar: TEST_AVATAR,
    points: 0,
  });
  const matchDoc = await Match.create({
    matchId: BUSINESS_MATCH_ID,
    homeTeam: 'Smoke FC',
    awayTeam: 'Test United',
    group: 'S',
    stage: 'Group Stage',
    matchDate: futureDate,
    venue: 'Smoke Stadium',
    city: 'Test City',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  });
  log(
    `seeded user=${TEST_DISCORD_ID} (points=0) match=${matchDoc.matchId} (ObjectId=${matchDoc._id}, +${(
      (futureDate.getTime() - Date.now()) /
      (60 * 60 * 1000)
    ).toFixed(0)}h in future)`
  );

  // 3. Spawn next dev
  const { proc } = await spawnNextDev();
  const cleanup = async () => {
    try {
      proc.kill('SIGTERM');
      await new Promise((resolve) => {
        const t = setTimeout(() => resolve(), 3000);
        proc.on('exit', () => {
          clearTimeout(t);
          resolve();
        });
      });
    } catch {}
    try { await mongoose.disconnect(); } catch {}
    try { await mem.stop(); } catch {}
    try { restoreEnvFile(); } catch {}
  };
  // Ensure .env is restored even if some other failure path wipes mem/proc.
  process.on('exit', () => {
    if (envWasMasked) restoreEnvFile();
  });
  process.on('SIGINT', async () => {
    console.error('\n[smoke] SIGINT — cleaning up');
    await cleanup();
    process.exit(1);
  });

  try {
    await waitForReady();
    log(`next dev ready on http://127.0.0.1:${PORT}`);

    // 4. Mint JWT
    const jwtToken = await encode({
      token: {
        name: TEST_USERNAME,
        sub: TEST_DISCORD_ID,
        discordId: TEST_DISCORD_ID,
        username: TEST_USERNAME,
        discriminator: '0',
        avatar: TEST_AVATAR,
        points: 0,
        walletAddress: null,
      },
      secret: SMOKE_SECRET,
      salt: COOKIE_SALT,
    });
    const cookie = `${COOKIE_NAME}=${jwtToken}`;
    log(`minted JWT (${jwtToken.length} chars)`);

    // 5. POST /api/africp with tools/call=submit_prediction
    log('POST /api/africp { method: tools/call, params: { name: submit_prediction } }');
    const africpRes = await fetch(`http://127.0.0.1:${PORT}/api/africp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // The StreamableHTTPServerTransport (under @modelcontextprotocol/sdk)
        // expects the client to advertise willingness to receive SSE, even
        // though our route sets enableJsonResponse: true and returns JSON.
        Accept: 'application/json, text/event-stream',
        Cookie: cookie,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'submit_prediction',
          arguments: {
            matchId: BUSINESS_MATCH_ID,
            predictedHome: 2,
            predictedAway: 1,
            note: 'smoke test prediction',
          },
        },
      }),
    });
    const africpText = await africpRes.text();
    assert(
      africpRes.status === 200,
      `POST returned HTTP ${africpRes.status}. Body: ${africpText.slice(0, 500)}`
    );
    const africpJson = JSON.parse(africpText);
    assert(
      !africpJson.error,
      `Africp returned JSON-RPC error: ${JSON.stringify(africpJson.error)}`
    );
    assert(
      africpJson.result && Array.isArray(africpJson.result.content),
      'response did not include result.content array'
    );
    const contentText = africpJson.result.content.map((c) => c.text).join('\n');
    log('Africp content text:\n' + contentText);
    assert(
      contentText.includes('"isolated": true'),
      `response missing isolation fact. Got: ${contentText}`
    );

    // 6. GET /api/predictions/agent-history
    log('GET /api/predictions/agent-history');
    const histRes = await fetch(
      `http://127.0.0.1:${PORT}/api/predictions/agent-history`,
      { headers: { Cookie: cookie } }
    );
    assert(histRes.status === 200, `agent-history GET returned ${histRes.status}`);
    const histJson = await histRes.json();
    log('agent-history payload: ' + JSON.stringify(histJson, null, 2));
    assert(
      Array.isArray(histJson.agentPredictions),
      'agent-history did not return agentPredictions array'
    );
    assert(
      histJson.agentPredictions.length === 1,
      `agent-history has ${histJson.agentPredictions.length} rows, expected 1`
    );
    const pick = histJson.agentPredictions[0];
    assert(
      pick.predictedHome === 2 && pick.predictedAway === 1,
      `agent pick wrong: ${pick.predictedHome}-${pick.predictedAway}, expected 2-1`
    );
    assert(
      pick.source === 'agent-africp',
      `agent pick source wrong: ${pick.source}, expected agent-africp`
    );
    assert(
      pick.note === 'smoke test prediction',
      `agent pick note not persisted: ${pick.note}`
    );
    log(
      `round-trip OK — agent-history shows ${pick.predictedHome}-${pick.predictedAway} for ${pick.matchId?.homeTeam} vs ${pick.matchId?.awayTeam}`
    );

    // 7. Invariants
    const userDoc = await User.findOne({ discordId: TEST_DISCORD_ID }).lean();
    assert(userDoc, 'seeded user disappeared');
    assert(
      userDoc.points === 0,
      `ISOLATION BROKEN: User.points = ${userDoc.points}, expected 0. submit_prediction leaked into real points.`
    );
    log(`ISOLATION ✓ User.points = 0`);

    const predictionCount = await Prediction.countDocuments({});
    assert(
      predictionCount === 0,
      `ISOLATION BROKEN: Prediction collection has ${predictionCount} rows, expected 0.`
    );
    log(`ISOLATION ✓ Prediction collection is empty`);

    const agentCount = await AgentPrediction.countDocuments({});
    assert(
      agentCount === 1,
      `AgentPrediction count = ${agentCount}, expected 1 (round-trip incomplete)`
    );
    log(`ROUND-TRIP ✓ AgentPrediction has exactly 1 row`);

    log('PASS — all assertions valid');
  } finally {
    await cleanup();
  }
}

main().catch(async (err) => {
  console.error('\n[smoke] FAIL:', err.message);
  console.error(err.stack);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
