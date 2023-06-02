const axios = require("axios")
const { StatusCodes } = require('http-status-codes');
const { ServerConfig } = require('../config')
const AppError = require('../utils/errors/app-error')
const db = require('../models')
const enums = require('../utils/common/enum')

const { BOOKED, CANCELLED } = enums.BOOKING_STATUS;

const { BookingRepository } = require('../repositories')

const bookingRepository = new BookingRepository();

async function createBooking(data) {
    const transaction = await db.sequelize.transaction(); // creates a transaction -> commit or rollback to make it an atomic api call
    try {
        // get the flight details
        console.log(data);
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;


        // check for seats
        if (data.seats > flightData.totalSeats) {
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }

        // calc price and create payload
        const totalBillingAmout = data.noOfSeats * flightData.price;
        const bookingPayload = { ...data, totalCost: totalBillingAmout };
        const booking = await bookingRepository.create(bookingPayload, transaction);

        // Lock the seats
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
            seats: data.noOfSeats,
            dec: 1
        })
        await transaction.commit();
        return booking;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function makePayment(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction);
        console.log(bookingDetails);
        if (bookingDetails.status == CANCELLED) {
            throw new AppError('The Booking has expired', StatusCodes.BAD_REQUEST);
        }

        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();

        if (currentTime - bookingTime > 300000) { // after 5 min, cancel the booking if payment not done
            await cancelBooking(data.bookingId);
            throw new AppError('The Booking has expired', StatusCodes.BAD_REQUEST);
        }

        if (bookingDetails.totalCost != data.totalCost) {
            throw new AppError('The amount of the payment does not match', StatusCodes.BAD_REQUEST);
        }
        if (bookingDetails.userId != data.userId) {
            throw new AppError('The user corrosponding to booking doesnot match', StatusCodes.BAD_REQUEST);
        }
        // we assume that the payment is successfull here 
        // booking status , initiated -> booked
        await bookingRepository.update(data.bookingId, { status: BOOKED }, transaction)
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function cancelBooking(bookingId) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(bookingId, transaction);

        if (bookingDetails.status == CANCELLED) {
            await transaction.commit();
            return true;
        }

        // unlock the locked seats
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`, {
            seats: bookingDetails.noOfSeats,
            dec: 0
        })
        await bookingRepository.update(bookingId, { status: CANCELLED }, transaction);
        await transaction.commit();

    } catch (error) {
        console.log(error);
        await transaction.rollback();
        throw error;
    }
}

async function cancelOldBookings() {
    try {
        const time = new Date(Date.now() - 1000 * 300)// 5 min
        const response = await bookingRepository.cancelOldBookings(time);
        return response;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    createBooking,
    makePayment,
    cancelOldBookings
}