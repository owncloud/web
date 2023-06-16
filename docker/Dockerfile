FROM owncloudops/nginx@sha256:c98a27123278cea89602f7cf9e757385242bef552c9d29dd0f89d9cb626a3465

LABEL maintainer="ownCloud GmbH <devops@owncloud.com>" \
  org.opencontainers.image.title="ownCloud Web" \
  org.opencontainers.image.vendor="ownCloud GmbH" \
  org.opencontainers.image.authors="ownCloud GmbH" \
  org.opencontainers.image.description="ownCloud Web - User interface for ownCloud" \
  org.opencontainers.image.licenses="AGPL-3.0" \
  org.opencontainers.image.documentation="https://github.com/owncloud/web" \
  org.opencontainers.image.url="https://hub.docker.com/r/owncloud/web" \
  org.opencontainers.image.source="https://github.com/owncloud/web"

RUN rm -f /var/lib/nginx/html/*

ADD docker/overlay /
ADD dist/ /var/lib/nginx/html

EXPOSE 8080

USER nginx

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
WORKDIR /var/lib/nginx/html
