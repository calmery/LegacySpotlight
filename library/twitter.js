var config  = require( '../config/config' ).config,
    twitter = require( 'twitter' )

exports.client = new twitter( {
    consumer_key       : config.twitter.consumer_key,
    consumer_secret    : config.twitter.consumer_secret,
    access_token_key   : config.user.twitter.access_token_key,
    access_token_secret: config.user.twitter.access_token_secret
} )