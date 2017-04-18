socket.emit( 'getConfig' )
socket.on( 'config', list => {
    let output = ''
    for( let key in list ){
        output += '<div class="content clearfix">' +
            '<div class="appName">' + key + '<br><span class="value">' + list[key].value + '</span></div>' +
            '<div class="btn warm float_r" onclick="remove( \'' + key + '\' )">Remove</div>' +
            '<div class="btn float_r' + ( list[key].enable ? '' : ' disable' ) + '" id="able_' + key + '" style="margin-right: 15px" onclick="toggle( \'' + key + '\' )" able="' + 
            ( list[key].enable ? 'enable">Enable' : 'disable">Disable' ) + '</div>' +
            '</div>'
    }
    document.getElementById( 'config' ).innerHTML = output
} )

socket.on( 'complete', () => {
    operationBlocker.hide()
} )
socket.on( 'reject', () => {
    alert( 'Rejected' )
    operationBlocker.hide()
} )

socket.on( 'removed', () => window.location.reload() )

const toggle = key => {
    let e = document.getElementById( 'able_' + key )
    if( e.getAttribute( 'able' ) === 'enable' ){
        operationBlocker.show()
        e.innerHTML = 'Disable'
        e.setAttribute( 'able', 'disable' )
        e.className = 'btn float_r disable'
        socket.emit( 'disable', { key: key } )
    } else {
        operationBlocker.show()
        e.innerHTML = 'Enable'
        e.setAttribute( 'able', 'enable' )
        e.className = 'btn float_r'
        socket.emit( 'enable', { key: key } )
    }
}

const remove = key => {
    operationBlocker.show()
    socket.emit( 'remove', { key: key } )
}