FROM owncloudops/nginx@sha256:8cc1f3c1365b7633f98dd6b77b5fe6ace25269839b6099cd14088d3d8e56fb27

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
