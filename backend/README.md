1. backend/.env file is mendatory to start nodejs server.
2. create backend/sslcert dir and paste ssl certificates here for https service.

Format of .env file as follow.

/*Code for production.*/
IS_PRODUCTION=false

# Mongo DB username.
DB_USERNAME=onlinestranger

#Mongo DB user password.
DB_PASS=Stranger99

#Mongo DB host ip.
DB_HOST=localhost

#Mongo DB port.
DB_PORT=27017

#Mongo DB concern database name.
DB_NAME=onlinestranger_db

#Node js host ip
NODE_HOST=localhost

#Node js server port
NODE_PORT_HTTP=3000

#Node js server https
NODE_PORT_HTTPS=3001

#Cors
REMOTE_CLIENT=http://localhost:4200
