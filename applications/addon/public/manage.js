if( document.getElementById( 'profile' ) !== null ){
    socket.emit( 'getMyProfile' )
    socket.on( 'myProfile', profile => {
        document.getElementById( 'profile-icon' ).src = profile.icon
        document.getElementById( 'user_name' ).innerHTML = profile.name
        document.getElementById( 'screen_name' ).innerHTML = '@' + profile.screen_name
        document.getElementById( 'profile-area' ).className = 'fadeIn'
    } )
}

const remove = ( appName ) => {
    if( confirm( 'Are you sure you want to permanently delete this app ?' ) ){
        socket.emit( 'remove', appName )
        document.getElementById( 'operationBlocker' ).className = 'fadeIn show'
    }
}

socket.emit( 'getInstalledAddons' )
socket.on( 'installedAddons', list => {
    let output = ''
    list.forEach( appName => {
        output += '<div class="content clearfix">' +
            '<div class="appName">' + appName + '</div>' +
            '<div class="btn warm float_r" onclick="remove( \'' + appName + '\' )">Remove</div>' +
            '</div>'
    } )
    document.getElementById( 'addons' ).innerHTML = output
} )

socket.on( 'complete', () => {
    alert( 'App has been successfully deleted' )
    document.getElementById( 'operationBlocker' ).className = 'fadeOut'
    setTimeout( () => { document.getElementById( 'operationBlocker' ).className = 'hide'; window.location.reload() }, 1000 )
} )

socket.on( 'reject', ( message ) => {
    alert( message )
    document.getElementById( 'operationBlocker' ).className = 'fadeOut'
    setTimeout( () => { document.getElementById( 'operationBlocker' ).className = 'hide'; window.location.reload() }, 1000 )
} )