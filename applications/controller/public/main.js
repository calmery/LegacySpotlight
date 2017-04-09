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

socket.on( 'refresh', () => {
    window.location.reload()
} )