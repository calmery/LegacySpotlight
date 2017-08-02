const launch = name => {
  socket.emit( 'launch', name )
}

socket.on( 'launched', name => {
  document.getElementById( 'app_' + name ).className = '_menu _active'
} )

socket.on( 'myProfile', profile => {
  document.getElementById( 'my_icon' ).style.background = 'url(' + profile.profile_image_url + ')'
  document.getElementById( 'my_icon' ).style.backgroundSize = 'cover'
  document.getElementById( 'my_name' ).innerHTML = profile.name
  document.getElementById( 'my_screen_name' ).innerHTML = '@' + profile.screen_name
} )
