FROM alpine:3

# RUN apk add --update build-base ca-certificates python3 python3-dev ffmpeg py-pip
# docker image inspect ref-worker:latest --format='{{.Size}}' => 452223808

RUN apk add --update python3 ffmpeg py-pip
# docker image inspect ref-worker:latest --format='{{.Size}}' => 452223808

WORKDIR /opt/worker
COPY requirements.txt .

RUN pip3 install -r requirements.txt \
    && ln -s /usr/include/locale.h /usr/include/xlocale.h \
    && mkdir -p /etc/chaperone.d \
    && rm -rf /tmp/* \
    && rm -rf /var/cache/*

COPY . .

ENTRYPOINT [ "python3", "main.py" ]