module.exports.launch = app => {

  app.addStaticRoute( './public' )

  app.createWindow( {
    width : 800,
    height: 600
  } ).then( window => {
    window.setMaximumSize( 800, 600 )
    window.setMinimumSize( 800, 600 )
    window.setMenu( null )
  } )

  app.addWebSocket( socket => {
    app.callListener( 'api/twitter/me' ).result.then( profile => {
      socket.emit( 'myProfile', profile )
    } )

    socket.on( 'add', path => {
      let response = app.callListener( 'api/addon/add', path )
      console.log( response )
      if( response.error === undefined )
        socket.emit( 'refresh' )
    } )

    socket.on( 'remove', name => {
      let response = app.callListener( 'api/addon/remove', name )
      if( response.error === undefined )
        socket.emit( 'addons', app.callListener( 'api/addon' ).result )
    } )

    socket.on( 'setAutoStartup', name => {
      let response = app.callListener( 'api/addon/auto/set', name )
      if( response.error === undefined )
        socket.emit( 'addons', app.callListener( 'api/addon' ).result )
    } )

    socket.on( 'releaseAutoStartup', name => {
      let response = app.callListener( 'api/addon/auto/release', name )
      if( response.error === undefined )
        socket.emit( 'addons', app.callListener( 'api/addon' ).result )
    } )

    socket.emit( 'addons', app.callListener( 'api/addon' ).result )
  } )

}
