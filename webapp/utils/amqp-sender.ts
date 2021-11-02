import * as amqp from 'amqplib/callback_api';

import util from "util";
import getSettings from './settings';

export type ListenerOptions = {
    queue: string;
}

export type PayloadOptions = {
    message: string;
    queue: string;
}

export async function sendMessage(payload: PayloadOptions): Promise<void> {

    const settings = getSettings();

    const options: amqp.Options.Connect = {
        username: settings.amqp.amqpUsername,
        password: settings.amqp.amqpPassword,
        hostname: settings.amqp.amqpHost,
        protocol: 'amqp',
        port: settings.amqp.amqpPort,
        vhost: settings.amqp.amqpVhost,
    };

    return new Promise((resolve, reject) => {
        amqp.connect(options, (error0, connection) => {
            if (error0) {
                reject(error0);
                console.log(util.inspect(error0));
                return;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    reject(error1);
                    console.log(util.inspect(error1));
                    return;
                }

                var queue = payload.queue;
                var msg = payload.message;

                channel.assertQueue(queue, {
                    durable: false
                });
                channel.sendToQueue(queue, Buffer.from(msg));

                console.log(" [x] Sent %s", msg);
            });
            setTimeout(() => {
                connection.close();
                // process.exit(0);
                resolve()
            }, 500);
        });
    });
}
