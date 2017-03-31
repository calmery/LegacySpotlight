module.exports = yacona => {
    
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
    
    passport.serializeUser( function( user, done ){ done( null, user ) } )
    passport.deserializeUser( function( user, done ){ done( null, user ) } )

    passport.use( new twitterStrategy.Strategy( {
        consumerKey   : 'nDnk9b8WsPVE5hLoY44qNSevM',
        consumerSecret: 'hEesWDwCN6HTbkQ0YdIvgdHsgIhzEqcGwgKKtrerLbIz87BhS9',
        callbackURL   : server.url + 'callback'
    }, function( token, tokenSecret, profile, done ){
        console.log( token, tokenSecret )
    } ) )
    
    yacona.createWindow( server.url + 'oauth' )
    
}