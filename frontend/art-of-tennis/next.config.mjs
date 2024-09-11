/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CONTAINER_APP_HOST_URL: `${process.env.CONTAINER_APP_NAME}.${process.env.CONTAINER_APP_ENV_DNS_SUFFIX}`,
    NEXTAUTH_URL: process.env.IS_PROD ? `http://artoftennis.ai` : 'http://localhost:3000',
    NEXT_PUBLIC_DOMAIN: process.env.IS_PROD ? `http://artoftennis.ai` : 'http://localhost:3000',
  },
};

export default nextConfig;