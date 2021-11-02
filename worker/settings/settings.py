import os

S3_ENDPOINT_URL: str = os.environ.get('S3_ENDPOINT_URL', "http://192.168.1.213:9000",)
S3_AWS_ACCESS_KEY_ID: str = os.environ.get('S3_AWS_ACCESS_KEY_ID', "AKIAIOSFODNN7EXAMPLE",)
S3_AWS_SECRET_ACCESS_KEY: str = os.environ.get('S3_AWS_SECRET_ACCESS_KEY', "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",)
S3_REGION_NAME: str = os.environ.get('S3_REGION_NAME', "us-east-1")
S3_BUCKET: str = os.environ.get('S3_BUCKET', "mybucket")

MONGO_CONNECTION_STRING = os.environ.get('MONGO_CONNECTION_STRING', "mongodb://root:example@192.168.1.213:27017")
FFMPEG_PATH: str = os.environ.get('FFMPEG_PATH', "/usr/local/bin/ffmpeg")

AMQP_USERNAME: str = os.environ.get('AMQP_USERNAME', "user")
AMQP_PASSWORD: str = os.environ.get('AMQP_PASSWORD', "bitnami")
AMQP_HOST: str = os.environ.get('AMQP_HOST', "192.168.1.213")
AMQP_PORT: int = os.environ.get('AMQP_PORT', 5672)
AMQP_VHOST: str = os.environ.get('AMQP_PORT', "/")