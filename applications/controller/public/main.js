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

socket.on( 'refresh', () => window.location.reload() )

socket.on( 'addon', addons => {
  let el = new Vue( {
    el: '#addons',
    data: {
      addons: addons
    },
    methods: {
      launch: addon => { return 'launch("' + addon + '")' },
      getId: addon => { return 'app_' + addon }
    }
  } )
} )

socket.on( 'running', apps => {
  let e
  for( let app in apps ){
    e = document.getElementById( 'app_' + app )
    if( e ) e.className = '_menu _active'
  }
} )
