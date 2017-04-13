socket.on( 'saved', () => {
    alert( 'Saved' )
    operationBlocker.hide()
} )

socket.emit( 'getConfig' )
socket.on( 'config', value => {
    if( value.search_count ) 
        document.getElementById( 'search_count' ).placeholder = value.search_count
} )

const save = type => {
    let count = document.getElementById( 'search_count' ).value
    if( count === '' ) return false
    if( type === 'search_count' && count.match( /\d+/ ) && count.match( /\d+/ ).input === count ){
        socket.emit( 'config', { search_count: Number( count ) } )
        operationBlocker.show()
    } else 
        alert( '使用できない文字が含まれています' )
}