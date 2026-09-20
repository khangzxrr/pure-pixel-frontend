FROM node:20.19.6-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
  yarn install --frozen-lockfile --network-timeout 600000

COPY . .

# vite inlines VITE_* at build time, so every environment needs its own build
ARG VITE_SITE_URL
ARG VITE_OIDC_AUTHORITY
ARG VITE_OIDC_CLIENT_ID=purepixel
ARG VITE_AUTH_REGISTER_URL
ARG VITE_AXIOS_BASE_URL
ARG VITE_WEBSOCKET_UPLOAD_PHOTO
ARG VITE_ONE_SIGNAL_APP_ID
ARG VITE_MAPBOX_TOKEN

RUN yarn build

FROM nginx:1.30.4-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
