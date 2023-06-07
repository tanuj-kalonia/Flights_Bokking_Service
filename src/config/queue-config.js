const ampqplib = require('amqplib');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { NOTI_QUEUE, RABBIT_MQ_URL } = require('./server-config');

let channel, connection;
async function connectQueue() {
    try {
        connection = await ampqplib.connect(RABBIT_MQ_URL); // creates a connection
        /**
         * A channel is a multiplexed light weight channel which helps in sending multiple messages
         * Without a channel there will be lot of tcp conenction going on, which will overload the server
         */
        channel = await connection.createChannel();
        await channel.assertQueue(NOTI_QUEUE);

    } catch (error) {
        console.log(error);
        throw new AppError('Someting went wrong, while conneting to queue', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function sendData(data) {
    try {
        await channel.sendToQueue(NOTI_QUEUE, Buffer.from(JSON.stringify(data)));
    } catch (error) {
        throw new AppError('Someting went wrong sending data', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    connectQueue,
    sendData
};