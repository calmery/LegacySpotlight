let target = document.getElementById( 'share_target_url' )

const save = () => {
    let url = target.value
    if( url === '' ) return false
    socket.emit( 'saveUrl', url )
    operationBlocker.show()
}

socket.emit( 'getUrl' )
socket.on( 'url', config => target.placeholder = config.server_url )

socket.on( 'saved', () => {
    alert( 'Saved' )
    operationBlocker.hide()
    socket.emit( 'getUrl' )
} )

socket.on( 'reject', () => alert( 'Rejected' ) )