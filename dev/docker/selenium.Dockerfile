# for m1 use SELENIUM_IMAGE=seleniarm/standalone-chromium:4.0.0-beta-1-20210215 docker-compose run selenium
#ARG SELENIUM_IMAGE=selenium/standalone-chrome-debug
ARG SELENIUM_IMAGE
FROM ${SELENIUM_IMAGE}

RUN sudo apt -qqy update \
  && sudo apt -qqy --no-install-recommends install \
    fonts-indic \
  && sudo rm -rf /var/lib/apt/lists/* \
  && sudo apt -qyy clean