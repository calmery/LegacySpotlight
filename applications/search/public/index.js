const search = () => {
    let word = document.getElementById( 'word' ).value
    if( word === '' ) return false

    operationBlocker.show()
    socket.emit( 'search', word )
}