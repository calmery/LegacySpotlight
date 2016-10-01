exports.run = function(){

    var express = require( 'express' ),
        app     = express()

    var http    = require( 'http' ).Server( app )

    // Create a new session.
    var session = require( 'express-session' )( {
        secret           : 'secret',
        resave           : true,
        saveUninitialized: true
    } )

    // Express is using session from express-session module.
    app.use( session )

    // To expand the function.
    var fn      = require( './fn' ).fn,
        isExist = fn.isExist,
        fixPath = fn.fixPath

    // Admin
    var root

    // Application is using random port. So get a port number.
    var port = http.listen().address().port
    console.log( 'Running app on localhost:' + port )

    /***** Routing *****/

    // Resources
    app.use( express.static( fixPath( __dirname, '../static/' ) ) )

    var paths = {

        '/': function( request, response ){
            if( !root && request.headers['user-agent'].indexOf('Electron') != -1 ){
                root = request.sessionID
                exports.root = root
            }

            // Error: Can't set headers after they are sent.
            // Cauntion : Response was already sent.

            if( !isExist( fixPath( __dirname, '../core/user.js' ) ) )
                response.redirect( '/setup' )
            else
                if( root === request.sessionID )
                    response.sendFile( fixPath( __dirname, '../templates/index.html' ) )
                else
                    response.status( 403 ).send( 'Forbidden' )
        },

        '/search': function( request, response ){
            if( root === request.sessionID )
                response.sendFile( fixPath( __dirname, '../templates/search.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },

        '/list': function( request, response ){
            if( root === request.sessionID )
                response.sendFile( fixPath( __dirname, '../templates/list.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },

        '/setting': function( request, response ){
            if( root === request.sessionID )
                response.sendFile( fixPath( __dirname, '../templates/setting.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },

        '/edit': function( request, response ){
            if( root === request.sessionID )
                response.sendFile( fixPath( __dirname, '../templates/edit.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },

        '/user': function( request, response ){
            if( root === request.sessionID )
                response.sendFile( fixPath( __dirname, '../templates/user.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },
        
        '/credit': function( request, response ){
            if( root === request.sessionID )
                response.sendFile( fixPath( __dirname, '../templates/credit.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },
        
        '/resetup': function( request, response ){
            if( root === request.sessionID )
                response.sendFile( fixPath( __dirname, '../templates/resetup.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },
        
        '/device': function( request, response ){
            if( root === request.sessionID )
                response.sendFile( fixPath( __dirname, '../templates/device.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },

        '/vote': function( request, response ){
            response.sendFile( fixPath( __dirname, '../templates/vote.html' ) )
        },
        
        '/pairing': function( request, response ){
            response.sendFile( fixPath( __dirname, '../templates/pairing.html' ) )
        }

    }

    // Check __dirname/core/user.js
    if( !isExist( fixPath( __dirname, '../core/user.js' ) ) ){

        // Import application setting.
        var config = require( '../core/config' ).config

        var consumer_key    = config.twitter.consumer_key,
            consumer_secret = config.twitter.consumer_secret

        // Import passport module.
        var passport        = require( 'passport' ),
            TwitterStrategy = require( 'passport-twitter' ).Strategy

        passport.serializeUser( function( user, done ){
            done( null, user.id )
        } )
        passport.deserializeUser( function( obj, done ){
            done( null, obj )
        } )

        paths['/twitter']  = passport.authenticate( 'twitter' )
        paths['/callback'] = passport.authenticate( 'twitter', { 
            successRedirect: '/signup',
            failureRedirect: '/setup' 
        } )
        paths['/setup']    = function( request, response ){
            if( root === request.sessionID )
                response.sendFile( fixPath( __dirname, '../templates/setup.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        }
        paths['/signup']   = function( request, response ){
            if( root === request.sessionID )
                response.sendFile( fixPath( __dirname, '../templates/signup.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        }

        passport.use( new TwitterStrategy( {
            consumerKey   : consumer_key,
            consumerSecret: consumer_secret,
            callbackURL   : 'http://127.0.0.1:' + port + '/callback'
        }, function( token, tokenSecret, profile, done ){
            // Export to index.js
            exports.access_token        = token
            exports.access_token_secret = tokenSecret
            exports.profile             = profile
            process.nextTick( function(){
                return done( null, profile )
            } )
        } ) )

        app.use( passport.initialize() ) 
        app.use( passport.session() )
        app.use( session )

    }

    // Attach paths.
    for( var path in paths )
        app.get( path, paths[path] )

    // Export
    return {
        http   : http,
        port   : port,
        session: session
    }

}
