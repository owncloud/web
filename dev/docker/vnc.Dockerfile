FROM python:3@sha256:45a0a776348e06d703d4cab0168bbcd2fb9ef571c23f17fc9eeb87cbe30bc63a

WORKDIR /novnc
RUN pip install numpy
RUN git clone --branch v1.2.0 https://github.com/novnc/noVNC.git .
RUN git clone https://github.com/novnc/websockify ./utils/websockify
RUN sed -i 's/$(hostname):${PORT}\/vnc.html?host=$(hostname)&port=${PORT}/host.docker.internal:${PORT}/g' ./utils/launch.sh
RUN cp vnc.html index.html

CMD utils/launch.sh --vnc selenium:5900


