ARG OC10_IMAGE
FROM ${OC10_IMAGE}

RUN apt -qqy update \
  && apt -qqy --no-install-recommends install \
    bash \
  && rm -rf /var/lib/apt/lists/* \
  && apt -qyy clean
