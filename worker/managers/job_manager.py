import os
import subprocess
import tempfile
import uuid
import time
import boto3
import pika
from botocore.client import Config
from pymongo.collection import Collection
from pymongo.database import Database

from pathlib import Path
from models.job_model import JobModel
from settings.settings import FFMPEG_PATH, AMQP_HOST, AMQP_PASSWORD, AMQP_PORT, AMQP_USERNAME, AMQP_VHOST, S3_AWS_ACCESS_KEY_ID, S3_AWS_SECRET_ACCESS_KEY, S3_BUCKET, S3_ENDPOINT_URL, S3_REGION_NAME
from utils.get_database import get_database


class JobManager():

    channel = None
    connection = None

    s3 = boto3.resource(
        "s3",
        endpoint_url=S3_ENDPOINT_URL,
        aws_access_key_id=S3_AWS_ACCESS_KEY_ID,
        aws_secret_access_key=S3_AWS_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name=S3_REGION_NAME)

    bucket: str = S3_BUCKET

    database: Database = get_database()

    jobs_collection: Collection = database["jobs"]

    def upload(self, file_to_upload: str, key: str) -> None:
        self.s3.Bucket(self.bucket).upload_file(file_to_upload, key)
        print("File uploaded: " + file_to_upload)

    def download_and_convert(self, job: JobModel) -> None:
        ffmpeg = FFMPEG_PATH
        output_key = str(uuid.uuid1())

        # using this with mechanism deletes the entire temp directory after operation is complete.
        with tempfile.TemporaryDirectory() as tmpdirname:
            print("created temporary directory", tmpdirname)
            source_file = os.path.join(tmpdirname, job["filename"])

            self.s3.Bucket(self.bucket).download_file(job["key"], source_file)
            print("Downloaded file to", source_file)

            if not os.path.exists(source_file):
                self.jobs_collection.find_one_and_update(
                    {u"key": job["key"]},
                    {u"$set": {
                        u"completed": True,
                        u"failed": True,
                    }})
                return

            print("Starting conversion", source_file)
            destination_file_name: str = Path(source_file).stem + ".mp3"
            destination_file: str = os.path.join(
                tmpdirname, destination_file_name)
            command = [ffmpeg, "-i", source_file, destination_file, ]
            result = subprocess.run(command, capture_output=True, text=True)

            print("Completed conversion", destination_file)
            if not os.path.exists(destination_file):
                print("Output file doesn't exist", destination_file)
                self.jobs_collection.find_one_and_update(
                    {u"key": job["key"]},
                    {u"$set": {
                        u"completed": True,
                        u"failed": True,
                        u"stderr": str(result.stderr),
                        u"stdout": str(result.stdout),
                        u"returncode": result.returncode,
                    }})
                return

            print("Ok! Conversion. Uploading " + output_key)
            self.upload(destination_file, output_key)

            self.jobs_collection.find_one_and_update(
                {u"key": job["key"]},
                {u"$set": {
                    u"completed": True,
                    u"failed": False,
                    u"output_key": output_key,
                    u"output_filename": destination_file_name,
                    u"stderr": str(result.stderr),
                    u"returncode": result.returncode,
                }})

            self.channel.basic_publish(
                exchange='',
                routing_key='job-update',
                body=job["key"],
            )

            print("completed processes for", source_file)

    def callback(self, ch, method, properties, body) -> None:
        # decode the key from the body as utf-8 and inform log about it
        key = body.decode("utf-8", "ignore")
        print(" [x] Received %r. Starting download" % key)

        # connect to mongodb and find the job description based on the key
        data: JobModel = self.jobs_collection.find_one({u"key": key})

        # download the file_to_upload to the worker disk and perform conversion
        self.download_and_convert(data)

    def start(self):
        credentials = pika.PlainCredentials(AMQP_USERNAME, AMQP_PASSWORD)
        params = pika.ConnectionParameters(
            host=AMQP_HOST,
            virtual_host=AMQP_VHOST,
            port=AMQP_PORT,
            credentials=credentials,
        )

        while True:
            try:
                print(" [*] Waiting for messages. To exit press CTRL+C")
                self.connection = pika.BlockingConnection(params)
                self.channel = self.connection.channel()
                self.channel.queue_declare(queue="job-request")
                self.channel.basic_consume(
                    queue="job-request",
                    on_message_callback=self.callback,
                    auto_ack=True,
                )
                self.channel.start_consuming() # Pause
            except Exception as e:
                print(" [*] Exception encountered" + str(e))
            finally:
                print(" [*] Delaying for 10 seconds")

            time.sleep(10)
