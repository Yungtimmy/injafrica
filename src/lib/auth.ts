import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import dbConnect from './mongodb';
import User from '@/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
      authorization: {
        params: {
          scope: 'identify guilds',
          prompt: 'consent',
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        const discordProfile = profile as {
          id: string;
          username: string;
          discriminator: string;
          avatar: string;
        };

        // Check guild membership — access_token is available here on first sign-in
        const guildId = process.env.DISCORD_GUILD_ID;
        if (guildId && account.access_token) {
          try {
            const res = await fetch('https://discord.com/api/users/@me/guilds', {
              headers: { Authorization: `Bearer ${account.access_token}` },
            });
            if (res.ok) {
              const guilds: { id: string }[] = await res.json();
              token.guildVerified = guilds.some((g) => g.id === guildId);
            } else {
              console.error('Failed to fetch guilds:', res.status, await res.text());
              token.guildVerified = false;
            }
          } catch (err) {
            console.error('Guild check error:', err);
            token.guildVerified = false;
          }
        } else {
          token.guildVerified = false;
        }

        token.discordId = discordProfile.id;
        token.username = discordProfile.username;
        token.discriminator = discordProfile.discriminator ?? '0';
        token.avatar = discordProfile.avatar
          ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/0.png`;

        // Upsert user in DB
        if (token.guildVerified) {
          try {
            await dbConnect();
            await User.findOneAndUpdate(
              { discordId: discordProfile.id },
              {
                discordId: discordProfile.id,
                username: discordProfile.username,
                discriminator: discordProfile.discriminator ?? '0',
                avatar: discordProfile.avatar
                  ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                  : `https://cdn.discordapp.com/embed/avatars/0.png`,
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          } catch (err) {
            console.error('DB error on signIn:', err);
          }
        }
      }

      // Refresh points from DB on every token refresh
      if (token.discordId) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ discordId: token.discordId }).lean();
          if (dbUser) {
            token.points = (dbUser as { points?: number }).points ?? 0;
          }
        } catch {
          // ignore
        }
      }

      return token;
    },

    async signIn({ account, profile: _profile }) {
      if (account?.provider !== 'discord') return false;
      // Guild check is done in jwt callback; block here if not verified
      // On first sign-in the jwt runs before signIn completes, so we allow
      // and rely on session callback + page guards
      return true;
    },

    async session({ session, token }) {
      session.user.discordId = token.discordId as string;
      session.user.username = token.username as string;
      session.user.discriminator = token.discriminator as string;
      session.user.avatar = token.avatar as string;
      session.user.points = (token.points as number) ?? 0;
      session.user.guildVerified = (token.guildVerified as boolean) ?? false;
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/not-authorized',
  },
});

declare module 'next-auth' {
  interface Session {
    user: {
      discordId: string;
      username: string;
      discriminator: string;
      avatar: string;
      points: number;
      guildVerified: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
