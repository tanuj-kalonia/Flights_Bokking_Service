const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    FLIGHT_SERVICE: process.env.FLIGHT_SERVICE,
    AUTH_SERVICE: process.env.AUTH_SERVICE,
    NOTI_QUEUE: process.env.NOTI_QUEUE,
    RABBIT_MQ_URL: process.env.RABBIT_MQ_URL
}