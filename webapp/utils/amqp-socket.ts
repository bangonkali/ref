import { Server } from 'socket.io';
import * as amqp from 'amqplib/callback_api';
import { connect } from 'amqplib/callback_api';
import util from "util";
import { FindJobTransaction, transact } from '../services/database.service';
import getSettings from './settings';

export class AmqpSocket {
    private options: amqp.Options.Connect;

    constructor(
        private server: Server,
        private queue: string,
    ) {
        const settings = getSettings();

        this.options = {
            username: settings.amqp.amqpUsername,
            password: settings.amqp.amqpPassword,
            hostname: settings.amqp.amqpHost,
            protocol: 'amqp',
            port: settings.amqp.amqpPort,
            vhost: settings.amqp.amqpVhost,
        };
    }

    init(): void {
        connect(this.options, (error0, connection) => {
            if (error0) {
                console.log(`AMQP: error0`);
                console.log(util.inspect(error0));
                return;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    console.log(`AMQP: error1`);
                    console.log(util.inspect(error1));
                    return;
                }

                channel.assertQueue(this.queue, {
                    durable: false
                });

                this.server.on('connection', socket => {
                    console.log('socket.io connection');
                    socket.broadcast.emit('a user connected')
                    socket.on('hello', (msg) => {
                        console.log('socket.io hello');
                        socket.emit('hello', 'world!')
                    });
                });

                channel.consume(this.queue, async (msg) => {
                    if (msg) {
                        try {
                            // Parse the key as string from the msg content
                            const jobKey = msg.content.toString();
                            console.log(" [x] Received %s", jobKey);

                            // Find the job using they key
                            const job = await transact(new FindJobTransaction(jobKey));

                            // Tell everyone about this message. TODO: this needs to be optimized.
                            this.server.emit('update', job);
                        } catch (e) {
                            console.log(util.inspect(e));
                        }
                    }
                }, {
                    noAck: true
                });
            });
        });
    }
}