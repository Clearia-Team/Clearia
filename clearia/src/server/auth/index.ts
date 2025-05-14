import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "~/server/db"; // Your Prisma client

// Function to find user and validate password
const findUserByEmailAndPassword = async (email: string, password: string) => {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (user?.password) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
  }

  return null;
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    // Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Patient credentials login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};
        if (!email || !password) return null;

        const user = await findUserByEmailAndPassword(email, password);
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? null,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],

  pages: {
    signIn: "/signin",
  },

  callbacks: {
    // Add user info to the token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "PATIENT";
      }
      return token;
    },

    // Expose token info to the session
    async session({ session, token }) {
      if (session.user && token?.id && token?.role) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
});

