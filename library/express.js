exports.run = function(){

    var express = require( 'express' ),
        app     = express()
    
    var http    = require( 'http' ).Server( app )

    var session = require( 'express-session' )( {
        secret           : 'secret',
        resave           : true,
        saveUninitialized: true
    } )
    
    app.use( session )
    
    var fn      = require( './fn' ).fn,
        isExist = fn.isExist,
        fixPath = fn.fixPath
    
    var root
    
    var port = http.listen().address().port
    console.log( 'Running app on localhost:' + port )

    app.use( express.static( fixPath( __dirname, '../view/resources/' ) ) )
    
    var paths = {

        '/': function( request, response ){
            if( !root && request.headers['user-agent'].indexOf('Electron') != -1 ){
                root = request.sessionID
                exports.root = root
            }
            
            // Already send response !
            // Error: Can't set headers after they are sent.
            
            if( !isExist( fixPath( __dirname, '../config/user.js' ) ) )
                response.redirect( '/setup' )
            else
                if( root == request.sessionID )
                    response.sendFile( fixPath( __dirname, '../view/index.html' ) )
                else
                    response.status( 403 ).send( 'Forbidden' )
        },

        '/search': function( request, response ){
            if( root == request.sessionID )
                response.sendFile( fixPath( __dirname, '../view/search.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },

        '/list': function( request, response ){
            if( root == request.sessionID )
                response.sendFile( fixPath( __dirname, '../view/list.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },

        '/setting': function( request, response ){
            if( root == request.sessionID )
                response.sendFile( fixPath( __dirname, '../view/setting.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },

        '/edit': function( request, response ){
            if( root == request.sessionID )
                response.sendFile( fixPath( __dirname, '../view/edit.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },
        
        '/user': function( request, response ){
            if( root == request.sessionID )
                response.sendFile( fixPath( __dirname, '../view/user.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        },

        '/vote': function( request, response ){
            response.sendFile( fixPath( __dirname, '../view/vote.html' ) )
        }

    }

    if( !isExist( fixPath( __dirname, '../config/user.js' ) ) ){

        var config = require( '../config/config' ).config

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

        paths['/twitter']  = passport.authenticate( 'twitter' )
        paths['/callback'] = passport.authenticate( 'twitter', { 
            successRedirect: '/signup',
            failureRedirect: '/setup' 
        } )
        paths['/setup']    = function( request, response ){
            if( root == request.sessionID )
                response.sendFile( fixPath( __dirname, '../view/setup.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        }
        paths['/signup']   = function( request, response ){
            if( root == request.sessionID )
                response.sendFile( fixPath( __dirname, '../view/signup.html' ) )
            else
                response.status( 403 ).send( 'Forbidden' )
        }

        passport.use( new TwitterStrategy( {
            consumerKey   : consumer_key,
            consumerSecret: consumer_secret,
            callbackURL   : 'http://127.0.0.1:' + port + '/callback'
        }, function( token, tokenSecret, profile, done ){
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
    
    for( var path in paths )
        app.get( path, paths[path] )

    return {
        http   : http,
        port   : port,
        session: session
    }

}