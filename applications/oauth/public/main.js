socket.on( 'url', url => window.location.href = url )

document.getElementById( 'oauth' ).addEventListener( 'click', () => {
  socket.emit( 'getUrl' )
}, false )
