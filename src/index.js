const express = require('express');
const { ServerConfig, LoggerConfig } = require("./config");

const apiRoutes = require('./routes')

const CRON = require('./utils/common/cron-jobs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`Server running at Port : ${ServerConfig.PORT}`);
    CRON();
    // This will print the logs on the console.
    // LoggerConfig.info('Server is up here')
})
