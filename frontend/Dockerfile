FROM node:20 AS build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/build /srv
