// this is to setup the database connection
const knex = require ('knex')({
    client: 'mysql',
    connection: {
        user: 'marcus',
        password: 'password',
        database: 'organic'
    }
})
const bookshelf = require('bookshelf')(knex)

module.exports = bookshelf