socket.on( 'url', url => {
  document.getElementById( 'main' ).className = 'fadeOut'
  setTimeout( () => {
    window.location.href = url
  }, 500 )
} )

document.getElementById( 'oauth' ).addEventListener( 'click', () => {
  socket.emit( 'getUrl' )
}, false )
