/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CONTAINER_APP_HOST_URL: `${process.env.CONTAINER_APP_NAME}.${process.env.CONTAINER_APP_ENV_DNS_SUFFIX}`,
    NEXT_PUBLIC_IS_PROD: process.env.IS_PROD,
    NEXTAUTH_URL: process.env.IS_PROD ? `https://artoftennis.us` : 'http://localhost:3000',
    NEXT_PUBLIC_DOMAIN: process.env.IS_PROD ? `https://artoftennis.us` : 'http://localhost:3000',
  },
};

export default nextConfig;