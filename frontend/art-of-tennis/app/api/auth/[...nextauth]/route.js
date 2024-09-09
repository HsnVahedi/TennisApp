import NextAuth from "next-auth";
import { getBackendUrl, getClientSideBackendUrl } from "@/app/lib/backend";

const backendUrl = getBackendUrl();



let authorizationUrl = getClientSideBackendUrl()
authorizationUrl = `${authorizationUrl}/o/authorize/?response_type=code&client_id=${process.env.NEXT_PUBLIC_DJANGO_CLIENT_ID}`
const redirectUri = process.env.NEXT_PUBLIC_DJANGO_REDIRECT_URI || `https://${process.env.NEXT_PUBLIC_CONTAINER_APP_HOST_URL}/api/auth/callback/django`
authorizationUrl = `${authorizationUrl}&redirect_uri=${redirectUri}&scope=read+write`
authorizationUrl = authorizationUrl 

const DjangoProvider = {
    id: "django",
    name: "Django",
    type: "oauth",
    scope: "",
    clientId: process.env.NEXT_PUBLIC_DJANGO_CLIENT_ID,
    clientSecret: process.env.NEXT_PUBLIC_DJANGO_CLIENT_SECRET,
    checks: ['none'],
    // authorization: `${getClientSideBackendUrl()}/o/authorize/?response_type=code&client_id=${process.env.NEXT_PUBLIC_DJANGO_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_DJANGO_REDIRECT_URI || `${process.env.CONTAINER_APP_HOSTNAME}`}&scope=read+write`,
    authorization: authorizationUrl,
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
    // authorize: async (credentials, req) => {
    //   alert('authorize function')
    // },
}

const handler = NextAuth({
  debug: true,
  providers: [
    DjangoProvider,
  ],


  callbacks: {
    // This callback is triggered when a JWT is created or updated
    async jwt({ token, account }) {
      // When the user initially signs in, the `account` object contains access token details
      if (account) {
        token.accessToken = account.access_token; // Store access token in the JWT
      }
      return token; // Return updated token
    },
    
    // This callback is triggered when a session is created or updated
    async session({ session, token }) {
      // Add access token to the session object
      session.accessToken = token.accessToken;
      return session;
    },
  },

});

export { handler as GET, handler as POST };