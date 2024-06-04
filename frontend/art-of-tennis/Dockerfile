FROM node:lts-alpine3.19 as base 
# Install sudo and configure node user
RUN apk update && apk add --no-cache sudo && echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
# Ensure we use a non-root user
USER node
WORKDIR /app/art-of-tennis
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
EXPOSE 3000

FROM base as dev
USER node
WORKDIR /app/art-of-tennis
ENV NODE_ENV=development
# Do nothing, just wait for frontend developers to run `npm run dev`
CMD ["tail", "-f", "/dev/null"]
