require('dotenv').config();

config = {
  env: process.env.NODE_ENV || 'dev',
  port: process.env.NODE_PORT || '3000',
  dbuser: process.env.DB_USER ||  'root',
  dbPassword: process.env.DB_PASSWORD || '' ,
  dbHost: process.env.DB_HOST || 'localhost',
  dbNAME: process.env.DB_NAME || 'Licoreria1',
  dbPORT: process.env.DB_PORT || '3306',
}

module.exports = {config};
