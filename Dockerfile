FROM node:14-alpine AS BUILD_IMAGE

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .
ARG MONGO_MAIN
ARG FIREBASE_WEB_CONFIG
RUN npm run build-ts
RUN MONGO_MAIN=$MONGO_MAIN FIREBASE_WEB_CONFIG=$FIREBASE_WEB_CONFIG npm run next:build

RUN npm prune --production

WORKDIR /usr/src/app

FROM node:14-alpine

WORKDIR /usr/src/app

COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /usr/src/app/public ./public
COPY --from=BUILD_IMAGE /usr/src/app/next/public ./next/public
COPY --from=BUILD_IMAGE /usr/src/app/package.json ./package.json
COPY --from=BUILD_IMAGE /usr/src/app/next/.next ./next/.next
COPY --from=BUILD_IMAGE /usr/src/app/next/next.config.js ./next/next.config.js
COPY --from=BUILD_IMAGE /usr/src/app/config ./config

EXPOSE 5555

CMD [ "node", "dist/server.js"]