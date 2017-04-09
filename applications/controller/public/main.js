const appLoader = ( appName ) => socket.emit( 'launch', appName )
socket.on( 'reject', message => console.error( message ) )

socket.emit( 'getInstalledAddons' )
socket.on( 'installedAddons', list => {
    let addons = document.getElementById( 'addons' )
    let output = ''
    list.forEach( appName => {
        output += '<a href="javascript: void(0)" onclick="appLoader( \'' + appName + '\' )">' +
                  '<div class="menu">' +
                  '<div class="name">' + appName + '</div>' +
                  '<div class="isRunning"></div>' +
                  '</div>' +
                  '</a>'
    } )
    addons.innerHTML = output
} )

if( document.getElementById( 'profile' ) !== null ){
    socket.emit( 'getMyProfile' )
    socket.on( 'myProfile', profile => {
        document.getElementById( 'profile-icon' ).src = profile.icon
        document.getElementById( 'user_name' ).innerHTML = profile.name
        document.getElementById( 'screen_name' ).innerHTML = '@' + profile.screen_name
        document.getElementById( 'profile-area' ).className = 'fadeIn'
    } )
}

socket.on( 'refresh', () => {
    window.location.reload()
} )