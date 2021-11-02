import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect';
import multiparty from 'multiparty';
import fs from "fs";
import { upload } from '../../utils/s3-uploader';
import { sendMessage } from '../../utils/amqp-sender';
import { InsertJobTransaction, transact } from '../../services/database.service';
import Job from '../../orm/models/Job';
import { v4 as uuidv4 } from 'uuid';
import getSettings from '../../utils/settings';

type IncomingFileHeader = {
    'content-disposition': string;
    'content-type': string;
}

type IncomingFiles = {
    [key: string]: IncomingFile[];
};

type IncomingFile = {
    fieldName: string;
    originalFilename: string;
    path: string;
    headers: IncomingFileHeader;
    size: number;
}

export type UploadResponse = {
    message: string,
    jobs: string[],
}

const handler = nextConnect()

handler.post(async (
    req: NextApiRequest,
    res: NextApiResponse<UploadResponse>
) => {
    const settings = getSettings();
    
    const form = new multiparty.Form();
    await form.parse(req, async (err, fields, files: IncomingFiles) => {
        if (files) {

            // Flatten all files in the multipart-form payload.
            const collectedFiles: IncomingFile[] = Object.keys(files).flatMap((name) => {
                return files[name].map((file) => {
                    return file;
                });
            });

            // Create Task for pushing a Job entry per file in the collected Files
            const uploadTasks = collectedFiles.map(async (file): Promise<string> => {

                // generate an upload key to avoid filename collisions during upload to s3.
                const key = uuidv4();

                // upload the file to s3.
                await upload({
                    name: key, // this will be the filename when it gets uploaded to s3. this avoid collisions.
                    bucket: settings.s3.s3Bucket,
                    sourcePath: file.path,
                    targetPath: file.originalFilename,
                    contentType: file.headers['content-type'],
                });
                console.log(`Done uploading file ${file.path}`);

                // clean up the file. let's do `non-async` operations here for now. optimize as much as you prefer.
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                console.log(`Done deleting file ${file.path}`);

                // Create a Job entry in the database
                const job: Job = new Job(key, false, file.originalFilename);
                const transaction = new InsertJobTransaction(job);
                await transact(transaction);

                // Pass the Job Id to the Queue.
                await sendMessage({
                    message: key, // pass here the key to the queue.
                    queue: 'job-request', // name of the queue.
                })

                return key; // return the mongodb job id.
            });

            // Run all tasks and await for all to complete.
            const ids = await Promise.all(uploadTasks);

            // Log, we're queing his jobs
            console.log(`Jobs queued.`);

            // Just inform the api client that we've passed everything to queue.
            res.status(200).json({ message: "ok", jobs: ids });
        } else {

            res.status(200).json({ message: "request_empty", jobs: [] });
        }

    });
});

export const config = {
    api: {
        bodyParser: false
    }
};

export default handler;