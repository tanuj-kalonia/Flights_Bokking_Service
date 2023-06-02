const axios = require("axios")
const { StatusCodes } = require('http-status-codes');
const { ServerConfig } = require('../config')
const AppError = require('../utils/errors/app-error')
const db = require('../models')

async function createBooking(data) {
    console.log("data", data);
    return new Promise((resolve, reject) => {
        const results = db.sequelize.transaction(async function bookingImpl(t) {
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
            const flightData = flight.data.data;

            if (data.seats > flightData.totalSeats) {
                reject(new AppError('Not enough seats available', StatusCodes.BAD_REQUEST));
            }

            resolve(true);
        })

    })
}

module.exports = {
    createBooking
}