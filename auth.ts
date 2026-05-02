import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';
import { users, sessions, auditLog } from '@/lib/db';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      address: string;
      ensName?: string;
      archetype?: string;
    };
  }

  interface JWT {
    userId: string;
    address: string;
    ensName?: string;
    archetype?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            return null;
          }

          const siweMessage = new SiweMessage(JSON.parse(credentials.message as string));
          const fields = await siweMessage.verify({
            signature: credentials.signature as string,
          });

          if (!fields) {
            return null;
          }

          // Find or create user
          let user = await users.getByWallet(fields.data.address);
          if (!user) {
            user = await users.create(fields.data.address, fields.data.ens?.name);
          }

          return {
            id: user.id,
            address: fields.data.address,
            name: fields.data.ens?.name || fields.data.address.slice(0, 6),
          };
        } catch (error) {
          console.error('[Auth] SIWE verification error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.userId = user.id;
        token.address = user.address;
        token.name = user.name;

        // Create session in database
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await sessions.create(user.id, token.jti || '', expiresAt);

        // Log successful authentication
        await auditLog.record(user.id, 'SIWE_LOGIN', {
          address: user.address,
          timestamp: new Date().toISOString(),
        });
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.address = token.address as string;
        session.user.ensName = token.name;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Ensure redirects are to the same origin
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  events: {
    async signIn({ user }) {
      console.log('[Auth] User signed in:', user.id);
    },
    async signOut({ token }) {
      console.log('[Auth] User signed out');
    },
  },
});
