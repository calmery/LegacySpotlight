const main = app => {

}

module.exports.launch = app => {

  if( app.callListener( 'api/twitter/isAuthorized' ).result === false )
    app.callListener( 'api/app/launch', 'oauth' )

  app.addStaticRoute( './public' )

  app.callListener( 'api/isAvailable', () => {
    app.createWindow().then( window => {
      window.openDevTools()
    } )
  } )

}
