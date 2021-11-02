import { UploadedObjectInfo, Client } from 'minio';
import getSettings from './settings';


export type DownloadFile = {
    key: string;
    bucket: string;
    targetPath: string;
}

export type UploadFile = {
    name: string;
    bucket: string;
    sourcePath: string;
    targetPath: string;
    contentType: string;
}

// Instantiate the minio client with the endpoint
// and access keys as shown below.

export function getS3Client() {
    const settings = getSettings();
    return {
        client: new Client({
            endPoint: settings.s3.s3Endpoint,
            port: settings.s3.s3Port,
            useSSL: settings.s3.s3UseSsl,
            accessKey: settings.s3.s3AccessKey,
            secretKey: settings.s3.s3SecretKey
        }),
        region: settings.s3.s3RegionName,
        bucket: settings.s3.s3Bucket,
    };
}

export async function download(params: DownloadFile): Promise<void> {
    const s3settings = getS3Client();
    await s3settings.client.fGetObject(params.bucket, params.key, params.targetPath);
}

export async function upload(file: UploadFile): Promise<UploadedObjectInfo> {
    const s3settings = getS3Client();
    const exists = await s3settings.client.bucketExists(file.bucket);
    if (!exists) {
        try {
            await s3settings.client.makeBucket(file.bucket, s3settings.bucket);
            console.log('Bucket created successfully in "us-east-1".')
        } catch (ex) {
            console.log('Bucket already exists in "us-east-1".')
        }
    }
    const metaData = {
        'Content-Type': file.contentType,
        'X-Amz-Meta-Testing': 1234,
        'example': 5678
    }
    const info: UploadedObjectInfo = await s3settings.client.fPutObject(file.bucket, file.name, file.sourcePath, metaData);
    return info;
}
