module.exports = yacona => {
    
    const requestKey = yacona.emit( 'api/requestKey' )

    const yaml    = yacona.moduleLoader( 'yaml' ),
          utility = yacona.moduleLoader( 'utility' )

    let server = yacona.createOwnServer()
    let app = server.server.app

    const passport        = require( 'passport' ),
          twitterStrategy = require( 'passport-twitter' ),
          session         = require( 'express-session' )

    app.use( passport.initialize() )
    app.use( passport.session() )
    app.use( session( { secret: 'lectern' } ) )
    
    let routes = {
        '/'        : ( request, response ) => { response.sendFile( utility.fixPath( __dirname, 'public', 'index.html' ) ) },
        '/oauth'   : passport.authenticate( 'twitter' ),
        '/callback': passport.authenticate( 'twitter', { 
            successRedirect: '/',
            failureRedirect: '/' 
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
    }, function( token, tokenSecret, profile, done ){
        yacona.emit( 'api/config/save/oauth', { 
            access_token: token, 
            access_token_secret: tokenSecret, 
            id: profile.id,
            screen_name: profile.username
        } )
        yacona.localAppLoader( '../controller' )
        yacona.kill( yacona.getName() )
    } ) )

    yacona.createWindow( server.url, { setMenu: null, setResizable: false } )

}