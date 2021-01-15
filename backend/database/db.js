require('dotenv').config({ path: '.env' });

module.exports = {
    db: process.env.MARIAN_DB_STRING
 };