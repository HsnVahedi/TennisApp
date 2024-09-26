/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CONTAINER_APP_HOST_URL: `${process.env.CONTAINER_APP_NAME}.${process.env.CONTAINER_APP_ENV_DNS_SUFFIX}`,
    NEXT_PUBLIC_IS_PROD: process.env.IS_PROD,
    // NEXTAUTH_URL: process.env.IS_PROD ? `http://aot-web-idoz445l32m-front.happyhill-9bdb3392.eastus.azurecontainerapps.io` : 'http://localhost:3000',
    NEXTAUTH_URL: process.env.IS_PROD ? `https://tennishub.pro` : 'http://localhost:3000',
    // NEXTAUTH_URL: process.env.IS_PROD ? `http://artoftennis.us` : 'http://localhost:3000',
    NEXT_PUBLIC_DOMAIN: process.env.IS_PROD ? `https://tennishub.pro` : 'http://localhost:3000',
    // NEXT_PUBLIC_DOMAIN: process.env.IS_PROD ? `http://aot-web-idoz445l32m-front.happyhill-9bdb3392.eastus.azurecontainerapps.io` : 'http://localhost:3000',
    // NEXT_PUBLIC_DOMAIN: process.env.IS_PROD ? `http://artoftennis.us` : 'http://localhost:3000',
  },
};

export default nextConfig;