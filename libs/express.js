const Express = require( 'express' )
const Http    = require( 'http' )

const _Config = require( '../core/config' )
const Config = _Config.config
const Util   = require( './utility' )

var semiRoots = []

const run = function(){

    var app  = Express(),
        http = Http.Server( app )

    // Create a new session.
    const session = require( 'express-session' )( {
        secret           : 'secret',
        resave           : true,
        saveUninitialized: true
    } )

    // Express is using session from express-session module.
    app.use( session )

    // Admin
    var root

    // Application is using random port. So get a port number.
    const port = http.listen().address().port
    console.log( 'Running app on localhost:' + port )

    /***** Routing *****/

    // Resources
    app.use( Express.static( Util.fixPath( __dirname, '../static/' ) ) )
    
    const sendResponse = function( request, response, staticTemplatePath ){
        if( root === request.sessionID || semiRoots.indexOf( request.sessionID ) != -1 ) 
            response.sendFile( 
                Util.fixPath( __dirname, '..', 'templates', 
                    ( typeof staticTemplatePath === 'string' ? staticTemplatePath : ( request._parsedOriginalUrl.href + '.html' ) )
                ) 
            )
        else 
            response.status( 403 ).send( 'Forbidden' )
    }

    const paths = {

        '/'      : function( request, response ){
            if( !root && request.headers['user-agent'].indexOf('Electron') !== -1 ){
                root = request.sessionID
                // Export root for socket.io
                module.exports.root = root
            }

            // Error: Can't set headers after they are sent.
            // Cauntion : Response was already sent.
            if( _Config.update().user === undefined )
                response.redirect( '/setup' )
            else
                sendResponse( request, response, 'index.html' )
        },

        '/search' : sendResponse,
        
        '/list'   : sendResponse,
        '/edit'   : sendResponse,
        
        '/setting': sendResponse,
        '/user'   : sendResponse,
        '/credit' : sendResponse,
        
        '/device' : sendResponse,
        
        '/vote'   : function( request, response ){
            response.sendFile( Util.fixPath( __dirname, '../templates/vote.html' ) )
        },
        
        '/pairing'   : function( request, response ){
            response.sendFile( Util.fixPath( __dirname, '../templates/pairing.html' ) )
        },
        
        '/resetup': sendResponse

    }

    // Check __dirname/core/user.js
    if( Config.user === undefined ){

        const consumer_key    = Config.twitter.consumer_key
        const consumer_secret = Config.twitter.consumer_secret

        // Import passport module.
        const passport        = require( 'passport' )
        const TwitterStrategy = require( 'passport-twitter' ).Strategy

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
        paths['/setup']    = sendResponse
        paths['/signup']   = sendResponse
        
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

module.exports.run = run
module.exports.semiRootUsers = semiRoots