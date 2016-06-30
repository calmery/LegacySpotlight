var express = require( 'express' )(),
    http    = require( 'http' ).Server( express )

var config         = require( '../config/config' ).config,
    isExistFile    = config.fn.isExistFile,
    fixPath        = config.fn.fixPath,
    checkUserAgent = config.fn.checkUserAgent,
    port           = config.express.port

// Common addresses
var commonPath = [
    {
        url: /resources\/[a-zA-Z0-9|.|\/|-]+/,
        fn : function( request, response ){
            response.sendfile( fixPath( __dirname + '/../view/' + request._parsedUrl.pathname ) )
        }
    }, {
        url: '/information',
        fn : function( request, response ){
            response.sendfile( fixPath( __dirname + '/../view/information.html' ) )
        }
    }
]

// Include
var paths = commonPath

// Checking if the user configuration file exists.
// If it exists immediately run application.
// On the other hand if it not exists move page and create new user.  
if( isExistFile( __dirname + '/../config/user.js' ) ){
    
    paths.push( {
        url: '/',
        fn : function( request, response ){
            if( checkUserAgent( request ) )
                response.sendfile( fixPath( __dirname + '/../view/index.html' ) )
        }
    } )
    paths.push( {
        url: '/search',
        fn : function( request, response ){
            if( checkUserAgent( request ) )
                response.sendfile( fixPath( __dirname + '/../view/search.html' ) )
        }
    } )
    paths.push( {
        url: '/list',
        fn : function( request, response ){
            if( checkUserAgent( request ) )
                response.sendfile( fixPath( __dirname + '/../view/list.html' ) )
        }
    } )
    paths.push( {
        url: '/setting',
        fn : function( request, response ){
            if( checkUserAgent( request ) )
                response.sendfile( fixPath( __dirname + '/../view/setting.html' ) )
        }
    } )
    
    paths.push( {
        url: '/edit',
        fn : function( request, response ){
            if( checkUserAgent( request ) )
                response.sendfile( fixPath( __dirname + '/../view/edit.html' ) )
        }
    } )
    
    // This is public address. Allow connections from outside.
    paths.push( {
        url: '/vote',
        fn : function( request, response ){
            response.sendfile( fixPath( __dirname + '/../view/vote.html' ) )
        }
    } )
    
} else {
    
    // Twitter OAuth
    // Get your access token and access token secret.
    var consumer_key    = config.twitter.consumer_key,
        consumer_secret = config.twitter.consumer_secret
    
    var passport        = require( 'passport' ),
        TwitterStrategy = require( 'passport-twitter' ).Strategy
    
    passport.serializeUser( function( user, done ){
        done( null, user.id )
    } )
    passport.deserializeUser( function( obj, done ){
        done( null, obj )
    } )
    
    passport.use( new TwitterStrategy( {
        consumerKey   : consumer_key,
        consumerSecret: consumer_secret,
        callbackURL   : "http://127.0.0.1:3000/callback"
    }, function( token, tokenSecret, profile, done ){
        console.log( token, tokenSecret )
        profile.twitter_token        = token
        profile.twitter_token_secret = tokenSecret
        exports.profile              = profile
        process.nextTick( function(){
            return done( null, profile )
        } )
    } ) )
    
    express.use( passport.initialize() ) 
    express.use( passport.session() )
    express.use( require( 'express-session' )( {
        secret: 'secret'
    } ) )
    
    // Open
    paths.push( {
        url: '/twitter',
        fn : passport.authenticate( 'twitter' )
    } )
    
    // Add callback address
    paths.push( {
        url: '/callback',
        fn : passport.authenticate( 'twitter', { 
            successRedirect: '/newUser',
            failureRedirect: '/' 
        } )
    } )
    
    // Setup
    paths.push( {
        url: '/',
        fn : function( request, response ){
            response.sendfile( fixPath( __dirname + '/../view/setup.html' ) )
        }
    } )
    
    paths.push( {
        url: '/newUser',
        fn : function( request, response ){
            response.sendfile( fixPath( __dirname + '/../view/newUser.html' ) )
        }
    } )
    
}

// Set addresses
for( var i=0; i<paths.length; i++ ){
    express.get( paths[i].url, paths[i].fn )
}

http.listen( 3000 )

/* ----- Exports ----- */

exports.express = express
exports.http    = http