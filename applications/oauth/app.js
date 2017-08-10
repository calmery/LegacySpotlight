const Yacona = require( 'yacona' ).Yacona

const passport        = require( 'passport' ),
      twitterStrategy = require( 'passport-twitter' ),
      session         = require( 'express-session' )

const utility = Yacona.loadModule( 'utility' )

const server = new Yacona()

server.use( passport.initialize() )
server.use( passport.session() )
server.use( session( { secret: 'lectern' } ) )

passport.serializeUser( ( user, done ) => done( null, user ) )
passport.deserializeUser( ( user, done ) => done( null, user ) )

// --- Routing --- //

const routes = {
  '/oauth'   : passport.authenticate( 'twitter' ),
  '/callback': passport.authenticate( 'twitter', {
    successRedirect: '/',
    failureRedirect: '/'
  } )
}

for( let route in routes )
  server.get( route, routes[route] )

// --- Instance --- //

module.exports.launch = app => {

  app.addStaticRoute( './public' )

  const key = app.callListener( 'api/twitter/key/consumer' ).result

  passport.use( new twitterStrategy.Strategy( {
    consumerKey   : key.consumer_key,
    consumerSecret: key.consumer_secret,
    callbackURL   : 'http://' + server.getUrl() + '/callback'
  }, ( access_token, access_token_secret, profile, done ) => {
    app.getApp().getYacona().detachApp( app.getApp() )
    app.callListener( 'api/twitter/key/register', {
      access_token       : access_token,
      access_token_secret: access_token_secret,
      id                 : parseInt( profile.id )
    } )
  } ) )

  app.addWebSocket( socket => {
    socket.on( 'getUrl', () => {
      socket.emit( 'url', 'http://' + server.getUrl() + '/oauth' )
    } )
  } )

  app.createWindow( {
    width : 800,
    height: 600
  } ).then( window => {
    window.setMaximumSize( 800, 600 )
    window.setMinimumSize( 800, 600 )
    window.setMenu( null )
  } )

}
