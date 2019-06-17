# build stage
FROM node:10.15.3-alpine as build-stage
RUN apk update && apk upgrade && \
    apk add --no-cache bash git

WORKDIR /app
COPY . .
RUN yarn install
RUN yarn dist

# production stage
FROM nginx:1.13.12-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
