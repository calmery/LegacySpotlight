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

socket.emit( 'getAddons', true )
socket.on( 'addons', function( list ){
    let addons = document.getElementById( 'addons' )
    for( let i=0; i<list.length; i++ ){
        addons.innerHTML += '<a href="javascript:void(0)" onclick="appLoader(\'' + list[i] + '\')"><div class="menu"><div class="left">' + list[i] + '</div><div class="right"></div></div></a>'
    }
} )

function appLoader( appName ){
    socket.emit( 'appLoader', appName )
}

socket.on( 'update', function(){ window.location.reload() } )