module.exports = yacona => {
    
    const requestKey = yacona.emit( 'api/twitter/key' )

    const utility = yacona.moduleLoader( 'utility' )

    let server = yacona.createOwnServer()
    let app = server.server.app

    const passport        = require( 'passport' ),
          twitterStrategy = require( 'passport-twitter' ),
          session         = require( 'express-session' )

    app.use( passport.initialize() )
    app.use( passport.session() )
    app.use( session( { secret: 'lectern' } ) )
    
    const sendFile = ( response, fileName ) => response.sendFile( utility.fixPath( __dirname, 'public', fileName ) )
    
    let routes = {
        '/'        : ( _, response ) => { sendFile( response, 'index.html' ) },
        '/layout'  : ( _, response ) => { sendFile( response, 'layout.css' ) },
        '/fail'    : ( _, response ) => { sendFile( response, 'fail.html' ) },
        '/oauth'   : passport.authenticate( 'twitter' ),
        '/callback': passport.authenticate( 'twitter', { 
            successRedirect: '/',
            failureRedirect: '/fail' 
        } )
    }
    
    for( let i in routes )
        app.get( i, routes[i] )

    passport.serializeUser( ( user, done ) => done( null, user ) )
    passport.deserializeUser( ( user, done ) => done( null, user ) )

    passport.use( new twitterStrategy.Strategy( {
        consumerKey   : requestKey.consumer_key,
        consumerSecret: requestKey.consumer_secret,
        callbackURL   : server.url + 'callback'
    }, ( token, token_secret, profile, done ) => {
        yacona.emit( 'api/twitter/authorized', { 
            access_token: token, 
            access_token_secret: token_secret, 
            id: profile.id,
            screen_name: profile.username
        } )
        yacona.kill( yacona.getName() )
    } ) )

    yacona.createWindow( server.url, { 
        setMenu: null, 
        setResizable: false
    } )

}