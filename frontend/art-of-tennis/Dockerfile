# nextjs-starter was used to create a nextjs project
FROM node:lts-alpine3.19 as nextjs-starter
WORKDIR /app
# Install sudo and configure node user
RUN apk update && apk add --no-cache sudo && echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
# Ensure we use a non-root user
USER node

FROM nextjs-starter as base
COPY package*.json ./
RUN sudo npm install
COPY . .
EXPOSE 3000

FROM base as dev
ENV NODE_ENV=development
# Do nothing, just wait for frontend developers to run `npm run dev`
CMD ["tail", "-f", "/dev/null"]

FROM base as build
ENV NODE_ENV=build
RUN npm run build

FROM build as prod
ENV NODE_ENV=production
CMD npm run start
