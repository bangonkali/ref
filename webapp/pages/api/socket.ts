import type { NextApiRequest, NextApiResponse } from 'next'
import { Server, ServerOptions } from 'socket.io'
import { AmqpSocket } from '../../utils/amqp-socket'

export type SocketIoResponse = NextApiResponse & {
    "socket": {
        "server": {
            "io": Server;
        }
    }
}

const handler = async (
    req: NextApiRequest,
    res: SocketIoResponse
) => {
    if (!res.socket.server.io) {
        console.log('*First use, starting socket.io')

        // just doing this so that it works on typescript. TODO: maybe there is a better way?
        const response = res.socket.server as Partial<ServerOptions>;

        // create a socketio server from the res object
        const io: Server = new Server(response);

        // create the binder between amqp and socket.io
        const amqpSocket = new AmqpSocket(io, "job-update");

        // the heavy lifting happens here
        amqpSocket.init();

        // assign it back to the `io` of `server`.
        res.socket.server.io = io
    }
    res.end();
}

export const config = {
    api: {
        bodyParser: false
    }
};

export default handler;