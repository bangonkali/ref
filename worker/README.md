# Worker

## Manually Running

```bash
docker run -it \
    --env S3_ENDPOINT_URL=http://192.168.1.213:9000 \
    --env MONGO_CONNECTION_STRING=mongodb://root:example@192.168.1.213:27017 \
    --env AMQP_HOST=192.168.1.213 \
    --env FFMPEG_PATH=/usr/bin/ffmpeg \
    ref-worker:latest
```
