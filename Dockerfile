# build stage
FROM node:9.11.1-alpine as build-stage
RUN apk update && apk upgrade && \
    apk add --no-cache bash git python make g++

WORKDIR /app
COPY . .
RUN yarn dist
RUN yarn install
RUN yarn build:prod

# production stage
FROM nginx:1.13.12-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
