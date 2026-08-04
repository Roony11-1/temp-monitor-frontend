FROM node:22 AS build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_CAMARA_MUESTREO_CADENCIA_MS
ENV VITE_CAMARA_MUESTREO_CADENCIA_MS=$VITE_CAMARA_MUESTREO_CADENCIA_MS

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@11 && pnpm install

COPY . .

RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80