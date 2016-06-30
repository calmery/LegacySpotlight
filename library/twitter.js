var twitter = require( 'twitter' )

var config = require( '../config/config' ).config,
    user   = require( '../config/user' ).config

/* ----- Connection ----- */

var client = new twitter( {
    consumer_key       : config.twitter.consumer_key,
    consumer_secret    : config.twitter.consumer_secret,
    access_token_key   : user.twitter.access_token_key,
    access_token_secret: user.twitter.access_token_secret
} )

/* ----- Exports ----- */

exports.client = client