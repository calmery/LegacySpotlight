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

    socket.emit( 'config', app.callListener( 'api/config/load' ).result )

    socket.on( 'save', config => {
      config.enable = true
      let response = app.callListener( 'api/config/save', config.key, config.value, config.enable )
      if( response.error === undefined )
        socket.emit( 'config', app.callListener( 'api/config/load' ).result )
    } )

    socket.on( 'remove', config => {
      let response = app.callListener( 'api/config/delete', config.key )
      if( response.error === undefined )
        socket.emit( 'config', app.callListener( 'api/config/load' ).result )
    } )

    socket.on( 'enable', config => {
      let response = app.callListener( 'api/config/enable', config.key )
      if( response.error === undefined )
        socket.emit( 'config', app.callListener( 'api/config/load' ).result )
    } )

    socket.on( 'disable', config => {
      let response = app.callListener( 'api/config/disable', config.key )
      if( response.error === undefined )
        socket.emit( 'config', app.callListener( 'api/config/load' ).result )
    } )

  } )

}
