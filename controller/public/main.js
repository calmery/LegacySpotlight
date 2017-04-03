let startupProcess = false

socket.on( 'startupComplete', () => startupProcess = false )

function startup( value ){
    if( startupProcess === false ){
        startupProcess = true
        socket.emit( 'startup', value )
    }
}

socket.on( 'ready', () => {
    socket.emit( 'getMyProfile' )
} )

socket.on( 'myProfile', profile => {
    document.getElementById( 'icon' ).src = profile.icon
    document.getElementById( 'screen_name' ).innerHTML += profile.screen_name
    document.getElementById( 'name' ).innerHTML = profile.name
    document.getElementById( 'load' ).style.display = 'block'
} )