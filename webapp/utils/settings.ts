import * as dotenv from "dotenv";

const getSettings = () => {
    dotenv.config();

    const s3Endpoint = process.env['S3_ENDPOINT'] || "192.168.1.213";
    const s3UseSsl = process.env['S3_ENDPOINT_SSL'] ? true : false;
    const s3AccessKey = process.env['S3_AWS_ACCESS_KEY_ID'] || "AKIAIOSFODNN7EXAMPLE";
    const s3SecretKey = process.env['S3_AWS_SECRET_ACCESS_KEY'] || "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
    const s3RegionName = process.env['S3_REGION_NAME'] || "us-east-1";
    const s3Bucket = process.env['S3_BUCKET'] || "mybucket";
    const s3PortStr = process.env['S3_ENDPOINT_PORT'] || "9000";
    const s3Port = parseInt(s3PortStr);

    const amqpUsername = process.env['AMQP_USERNAME'] || "user";
    const amqpPassword = process.env['AMQP_PASSWORD'] || "bitnami";
    const amqpHost = process.env['AMQP_HOST'] || "192.168.1.213";
    const amqpVhost = process.env['AMQP_VHOST'] || "/";
    const amqpPortStr = process.env['AMQP_PORT'] || "5672";
    const amqpPort = parseInt(amqpPortStr);

    const connectionString = process.env['MONGO_CONNECTION_STRING'] || "mongodb://root:example@localhost:27017/";
    const jobsCollectionString = process.env['MONGO_JOBS_COLLECTION_NAME'] || "jobs";
    const clientdb = process.env['MONGO_DB_NAME'] || "ref";

    return {
        mongo: {
            connectionString,
            jobsCollectionString,
            clientdb,
        },
        amqp: {
            amqpUsername,
            amqpPassword,
            amqpHost,
            amqpPort,
            amqpVhost,
        },
        s3: {
            s3Endpoint,
            s3Port,
            s3UseSsl,
            s3AccessKey,
            s3SecretKey,
            s3RegionName,
            s3Bucket,
        }
    }
}

export default getSettings;