const remove = ( appName ) => {
    if( confirm( 'Are you sure you want to permanently delete this app ?' ) ){
        socket.emit( 'remove', appName )
        operationBlocker.show()
    }
}

socket.emit( 'getInstalledAddons' )
socket.on( 'installedAddons', list => {
    let output = ''
    list.app.forEach( appName => {
        output += '<div class="content clearfix">' +
            '<div class="appName">' + appName + '</div>' +
            '<div class="btn warm float_r" onclick="remove( \'' + appName + '\' )">Remove</div>' +
            ( ( list.startup.indexOf( appName ) !== -1 ) ? '<div class="btn float_r long" style="margin-right: 15px" onclick="autostart( \'' + appName + '\' )">Run at Startup</div>' : '' ) +
            '</div>'
    } )
    document.getElementById( 'addons' ).innerHTML = output
} )

socket.on( 'complete', () => {
    alert( 'App has been successfully deleted' )
    operationBlocker.hide()
    window.location.reload()
} )

socket.on( 'reject', ( message ) => {
    alert( message )
    operationBlocker.hide()
    window.location.reload()
} )