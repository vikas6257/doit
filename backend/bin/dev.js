const result = require('dotenv').config();
if (result.error) {
  console.error('Erro with environment file');
  throw result.error;
}

if (process.env.IS_PRODUCTION == undefined || process.env.IS_PRODUCTION == '') {
  console.log('IS_PRODUCTION: production not defined in dotenv');
  return;
}

if (process.env.DB_USERNAME == undefined || process.env.DB_USERNAME == '') {
  console.log('DB_USERNAME: mongodb username not defined in dotenv');
  return;
}

if (process.env.DB_PASS == undefined || process.env.DB_PASS == '') {
  console.log('DB_PASS: mongodb user password not defined in dotenv');
  return;
}
if (process.env.DB_HOST == undefined || process.env.DB_HOST == '') {
  console.log('DB_HOST: mongodb host ip not defined in dotenv');
  return;
}
if (process.env.DB_PORT == undefined || process.env.DB_PORT == '') {
  console.log('DB_PORT: mongodb port not defined in dotenv');
  return;
}
if (process.env.DB_NAME == undefined || process.env.DB_NAME == '') {
  console.log('DB_NAME: mongodb database name not defined in dotenv');
  return;
}

if (process.env.NODE_PORT_HTTP == undefined || process.env.NODE_PORT_HTTP == '') {
  console.log('NODE_PORT_HTTP: Node http port not defined in dotenv');
  return;
}

if (process.env.REMOTE_CLIENT == undefined || process.env.REMOTE_CLIENT == '') {
  console.log('REMOTE_CLIENT: remote client not defined in dotenv');
  return;
}

if (process.env.NODE_PORT_HTTPS == undefined || process.env.NODE_PORT_HTTPS == '') {
  console.log('NODE_PORT_HTTPS: Node https port not defined in dotenv');
  return;
}
require('../entry.js');
