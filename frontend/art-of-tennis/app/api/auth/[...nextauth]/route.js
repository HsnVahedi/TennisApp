import NextAuth from "next-auth";
import { getBackendUrl, getClientSideBackendUrl } from "@/app/lib/backend";

const backendUrl = getBackendUrl();

console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
console.log('NEXT_PUBLIC_DJANGO_CLIENT_ID', process.env.NEXT_PUBLIC_DJANGO_CLIENT_ID)
console.log('NEXT_PUBLIC_DJANGO_CLIENT_SECRET', process.env.NEXT_PUBLIC_DJANGO_CLIENT_SECRET)
console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')


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

console.log('666666666666666666666666666666666666666666666666666666666666666')
console.log('666666666666666666666666666666666666666666666666666666666666666')
console.log(DjangoProvider)
console.log('666666666666666666666666666666666666666666666666666666666666666')
console.log('666666666666666666666666666666666666666666666666666666666666666')

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