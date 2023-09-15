# for m1 use SELENIUM_IMAGE=seleniarm/standalone-chromium:4.7.0-20221206 docker-compose run selenium
ARG SELENIUM_IMAGE
FROM ${SELENIUM_IMAGE}

RUN sudo apt -qqy update \
  && sudo apt -qqy --no-install-recommends install \
    fonts-indic \
  && sudo rm -rf /var/lib/apt/lists/* \
  && sudo apt -qyy clean
