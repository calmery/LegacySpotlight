module.exports = yacona => {
    
    const yaml = yacona.moduleLoader( 'yaml' )
    const utility = yacona.moduleLoader( 'utility' )
    
    let server = yacona.createOwnServer()
    let app = server.server.app
    
    const passport        = require( 'passport' ),
          twitterStrategy = require( 'passport-twitter' ),
          session         = require( 'express-session' )
    
    app.use( passport.initialize() )
    app.use( passport.session() )
    app.use( session( { secret: 'lectern' } ) )
    
    app.get( '/oauth', passport.authenticate( 'twitter' ) )
    app.get( '/callback', passport.authenticate( 'twitter', { 
        successRedirect: '/',
        failureRedirect: '/fail' 
    } ) )
    
    app.get( '/', ( request, response ) => {
        response.sendFile( utility.fixPath( __dirname, 'public', 'index.html' ) )
    } )
    
    app.get( '/fail', ( request, response ) => {
        response.sendFile( utility.fixPath( __dirname, 'public', 'fail.html' ) )
    } )
    
    passport.serializeUser( function( user, done ){ done( null, user ) } )
    passport.deserializeUser( function( user, done ){ done( null, user ) } )

    passport.use( new twitterStrategy.Strategy( {
        consumerKey   : 'nDnk9b8WsPVE5hLoY44qNSevM',
        consumerSecret: 'hEesWDwCN6HTbkQ0YdIvgdHsgIhzEqcGwgKKtrerLbIz87BhS9',
        callbackURL   : server.url + 'callback'
    }, function( token, tokenSecret, profile, done ){
        yacona.config.save( 'twitter/authorization.yaml', yaml.dump( { access_token: token, access_token_secret: tokenSecret } ) )
        yacona.localAppLoader( 'controller' )
        yacona.kill( yacona.getName() )
    } ) )
    
    yacona.createWindow( server.url, { setMenu: null, setResizable: false } )
    
}