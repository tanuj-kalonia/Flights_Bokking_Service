This is the continuation of the micro-service [FLihgts_API](https://github.com/tanuj-kalonia/Flights_API) which contains all the buisness logic of the FLight API.

This micro-service specificly handles the buisness logic of booking of a flight by the user. This includes flight booking, payments gateway routes etc..

Both the service interacts with the common SQL-based database - powered by Sequelize ORM

### Setup the project

 - Download this template from github and open it in your favourite text editor. 
 - Go inside the folder path and execute the following command:
  ```
  npm install
  ```
 - In the root directory create a `.env` file and add the following env variables
    ```
        PORT=<port number of your choice>
    ```
    ex: 
    ```
        PORT=3000
    ```
 - go inside the `src` folder and execute the following command:
    ```
      npx sequelize init
    ```
 - By executing the above command you will get migrations and seeders folder along with a config.json inside the config folder. 
 - If you're setting up your development environment, then write the username of your db, password of your db and in dialect mention whatever db you are using for ex: mysql, mariadb etc
 - If you're setting up test or prod environment, make sure you also replace the host with the hosted db url.

 - To run the server execute
 ```
 npm run dev
 ```
