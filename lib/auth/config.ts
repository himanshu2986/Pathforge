import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb-client"

export const authConfig = {
  // adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "student",
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || "student";
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  session: { strategy: "jwt" as const },
  pages: {
    signIn: '/login',
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
