'use strict';

//require("dotenv").config({path:__dirname + '/../.envconfig'});

var dbConnection = {};

    dbConnection = 
    {
        host     : 'localhost',
        port     : ,  //add port
        user     : 'root',
        password : '',  //replace password
        database : '', ////replace database name
        charset  : 'utf8'
    }

var dbConfig =
 {
    client: 'mysql',
    connection: dbConnection
};

var knex = require( 'knex' )( dbConfig );

exports.knex = knex;

