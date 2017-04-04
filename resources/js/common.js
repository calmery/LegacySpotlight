let startup = document.getElementsByClassName( 'startup' )
let startupProcess = false

socket.on( 'startupComplete', () => startupProcess = false )

for( let i=0; i<startup.length; i++ ){
    startup[i].addEventListener( 'click', e => {
        e.preventDefault()
        if( startupProcess === false ){
            socket.emit( 'startup', e.target.getAttribute( 'identifier' ) )
            startupProcess = true
        }
    } )
}

socket.emit( 'getMyProfile' )

socket.on( 'myProfile', profile => {
    document.getElementById( 'icon' ).src = profile.icon
    document.getElementById( 'screen_name' ).innerHTML += profile.screen_name
    document.getElementById( 'name' ).innerHTML = profile.name
    document.getElementById( 'load' ).style.display = 'block'
} )