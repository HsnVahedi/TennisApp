/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CONTAINER_APP_HOST_URL: `${process.env.CONTAINER_APP_NAME}.${process.env.CONTAINER_APP_ENV_DNS_SUFFIX}`,
    NEXTAUTH_URL: process.env.is_prod ? `${process.env.CONTAINER_APP_NAME}.${process.env.CONTAINER_APP_ENV_DNS_SUFFIX}` : 'http://localhost:3000',
  },
};

export default nextConfig;