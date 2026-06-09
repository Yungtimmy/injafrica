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
          scope: 'identify',
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

        token.discordId = discordProfile.id;
        token.username = discordProfile.username;
        token.discriminator = discordProfile.discriminator ?? '0';
        token.avatar = discordProfile.avatar
          ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/0.png`;

        // Upsert user in DB
        try {
          await dbConnect();
          const dbUser = await User.findOneAndUpdate(
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
          token.points = dbUser?.points ?? 0;
          token.walletAddress = dbUser?.walletAddress ?? null;
        } catch (err) {
          console.error('DB error on signIn:', err);
        }
      }

      // Refresh points and wallet from DB on every token refresh
      if (token.discordId && !account) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ discordId: token.discordId }).lean() as {
            points?: number;
            walletAddress?: string;
          } | null;
          if (dbUser) {
            token.points = dbUser.points ?? 0;
            token.walletAddress = dbUser.walletAddress ?? null;
          }
        } catch {
          // ignore
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.discordId = token.discordId as string;
      session.user.username = token.username as string;
      session.user.discriminator = token.discriminator as string;
      session.user.avatar = token.avatar as string;
      session.user.points = (token.points as number) ?? 0;
      session.user.walletAddress = (token.walletAddress as string) ?? null;
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
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
      walletAddress: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
