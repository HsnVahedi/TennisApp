import NextAuth from "next-auth";
import { getBackendUrl, getClientSideBackendUrl } from "@/app/lib/backend";

const backendUrl = getBackendUrl();


const DjangoProvider = {
    id: "django",
    name: "Django",
    type: "oauth",
    scope: "",
    clientId: process.env.NEXT_PUBLIC_DJANGO_CLIENT_ID,
    clientSecret: process.env.NEXT_PUBLIC_DJANGO_CLIENT_SECRET,
    checks: ['none'],
    authorization: `${getClientSideBackendUrl()}/o/authorize/?response_type=code&client_id=${process.env.NEXT_PUBLIC_DJANGO_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_DJANGO_REDIRECT_URI}&scope=read+write`,
    token: `${backendUrl}/o/token/`,
    userinfo: `${backendUrl}/user-info/`,
    session: {
      jwt: true,
    },
    profile(profile) {
        return {
          id: profile.username,
        };
    },
}

const handler = NextAuth({
  debug: true,
  providers: [
    DjangoProvider,
  ],
  // callbacks: {
  //   async signIn({ user, account, profile, email, credentials }) {
  //     return true
  //   },
  //   async redirect({ url, baseUrl }) {
  //     return url.startsWith(baseUrl) ? url : baseUrl
  //   },
  //   async session({ session, user, token }) {
  //     return session
  //   },
  //   async jwt({ token, user, account, profile, isNewUser }) {
  //     return token
  //   }
  // },
});

export { handler as GET, handler as POST };