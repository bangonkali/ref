import type { NextApiRequest, NextApiResponse } from 'next'
import nextConnect from 'next-connect';
import util from "util";
import fs from "fs";
import os from "os";
import { download } from '../../utils/s3-uploader';
import path from 'path';
import { transact, FindJobByOutputKeyTransaction } from '../../services/database.service';
import getSettings from '../../utils/settings';

const handler = nextConnect()

handler.get(async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    console.log("downloading");
    const settings = getSettings();

    try {
        const jobKey = req.query["key"] as string;
        const destinationDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'foo-'));
        const job = await transact(new FindJobByOutputKeyTransaction(jobKey));

        if (!job.output_filename) {
            res.status(400).json({
                error: true,
                message: "job_not_found"
            });
            res.end();
            return;
        }

        const filename: string = job.output_filename;
        const filePath = path.join(destinationDirectory, filename);

        await download({
            key: jobKey,
            bucket: settings.s3.s3Bucket,
            targetPath: filePath,
        })

        const imageBuffer = fs.createReadStream(filePath);

        await new Promise((resolve) => {
            res.setHeader('Content-Type', 'audio/mpeg3');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            imageBuffer.pipe(res);
            imageBuffer.on('end', resolve);
            imageBuffer.on('error', (err) => {
                res.status(400).json({
                    error: true,
                    message: util.inspect(err)
                });
                res.end();
            });
        });
    } catch (err) {
        res.status(400).json({ error: true, message: err });
        res.end();
    }
});

export const config = {
    api: {
        bodyParser: false
    }
};

export default handler;