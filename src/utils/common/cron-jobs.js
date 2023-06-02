const cron = require('node-cron');
const { BookingService } = require('../../services');

function scheduleCrons() {
    // check in every 30 mins
    cron.schedule('*/30 * * * *', async () => {
        await BookingService.cancelOldBookings();
    })
}

module.exports = scheduleCrons;