FROM node:22.23.4 AS build

# Install the distribution CA update for the eMudhra incident.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM caddy

RUN apk add --no-cache 'ca-certificates>=20261020-r0'

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/build /srv
