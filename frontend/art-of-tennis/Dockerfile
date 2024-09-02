# FROM node:lts-alpine3.19 as base 
# RUN apk update && apk add --no-cache sudo && echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
# USER node
# WORKDIR /app/art-of-tennis
# COPY --chown=node:node package*.json ./
# RUN npm install
# COPY --chown=node:node . .
# EXPOSE 3000


FROM node:lts-alpine3.19 as base 
RUN apk update && apk add --no-cache sudo && echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER node
WORKDIR /app/art-of-tennis
COPY --chown=node:node package*.json ./
RUN sudo chown -R node:node /app/art-of-tennis
########################################################
# RUN apk update
########################################################
RUN npm install
COPY --chown=node:node . .
EXPOSE 3000

FROM base as dev
USER node
# WORKDIR /app/art-of-tennis
ENV NODE_ENV=development
# Do nothing, just wait for frontend developers to run `npm run dev`
CMD ["tail", "-f", "/dev/null"]


FROM base as prod 
USER node
# WORKDIR /app/art-of-tennis
ENV NODE_ENV=development
# Do nothing, just wait for frontend developers to run `npm run dev`
CMD ["tail", "-f", "/dev/null"]