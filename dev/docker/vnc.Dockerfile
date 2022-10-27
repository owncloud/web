FROM python:3@sha256:105d77e7d7ae7f03112b72880f5b630b4d3b39e59f1a2a8cabb021c737128818

WORKDIR /novnc
RUN pip install numpy
RUN git clone --branch v1.2.0 https://github.com/novnc/noVNC.git .
RUN git clone https://github.com/novnc/websockify ./utils/websockify
RUN sed -i 's/$(hostname):${PORT}\/vnc.html?host=$(hostname)&port=${PORT}/host.docker.internal:${PORT}/g' ./utils/launch.sh
RUN cp vnc.html index.html

CMD utils/launch.sh --vnc selenium:5900


