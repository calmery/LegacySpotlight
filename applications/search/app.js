module.exports.launch = app => {

  app.addStaticRoute( './public' )

  app.createWindow().then( window => {
    window.loadURL( 'http://' + app.getUrl() )
    window.openDevTools()
  } )

  let searched = {}

  app.addWebSocket( socket => {
    socket.on( 'search', options => {
      let response = app.callListener( 'api/twitter/search', options )
      if( response.error === undefined )
        response.result.then( tweet => {
          tweet.identifier = Math.random().toString( 36 ).slice( -8 )
          searched[tweet.identifier] = tweet
          socket.emit( 'tweet', tweet )
        } )
    } )

    socket.on( 'save', data => {
      let name  = data.name
      let id    = data.id
      let safe  = data.safe
      let tweet = searched[id]

      let d = {
        id         : id,
        name       : name,
        safeTweetId: safe,
        original   : tweet
      }

      let response = app.addListener( 'api/twitter/search/save', d )
      if( response.error === undefined )
        socket.emit( 'completed' )
    } )
  } )

}
