const main = app => {

  app.addStaticRoute( './public' )

  let s
  app.addListener( 'refresh', () => { if( s ) s.emit( 'refresh' ) } )

  app.addWebSocket( socket => {
    s = socket

    app.callListener( 'api/twitter/me' ).result.then( profile => {
      socket.emit( 'myProfile', profile )
    } )

    socket.emit( 'addon', app.callListener( 'api/addon' ).result.apps )

    socket.emit( 'running', app.callListener( 'api/app/running' ).result )

    socket.on( 'launch', name => {
      let response = app.callListener( 'api/app/launch', name )
      if( response.error === undefined )
        socket.emit( 'launched', name )
    } )
  } )

  app.createWindow( {
    width : 200,
    height: 600
  } ).then( window => {
    window.setMaximumSize( 200, 600 )
    window.setMinimumSize( 200, 600 )
    window.setMenu( null )
  } )

}

module.exports.launch = app => {

  if( app.callListener( 'api/twitter/isAuthorized' ).result === false )
    app.callListener( 'api/app/launch', 'oauth' )

  app.callListener( 'api/isAvailable', () => main( app ) )

}
