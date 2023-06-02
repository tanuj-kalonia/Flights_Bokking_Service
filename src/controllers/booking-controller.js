const { StatusCodes } = require('http-status-codes');
const { BookingService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common')

const localCacheDB = {};

async function createBooking(req, res) {
    try {
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            noOfSeats: req.body.noOfSeats,
            userId: req.body.userId
        });
        SuccessResponse.data = response;
        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}
async function makePayment(req, res) {
    try {
        const idempotenceyKey = req.headers['x-idempotency-key'];
        if (!idempotenceyKey) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: 'Idempotency Key missing' });
        }
        if (localCacheDB[idempotenceyKey]) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: 'Can-not retry on a succesfull payemt' });
        }
        const response = await BookingService.makePayment({
            bookingId: req.body.bookingId,
            userId: req.body.userId,
            totalCost: req.body.totalCost
        });
        SuccessResponse.data = response;
        localCacheDB[idempotenceyKey] = idempotenceyKey;

        return res
            .status(StatusCodes.OK)
            .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}
module.exports = {
    createBooking,
    makePayment
}