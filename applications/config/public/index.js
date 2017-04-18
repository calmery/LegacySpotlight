socket.on( 'complete', () => {
    alert( 'Completed' )
    cleanup()
    operationBlocker.hide()
} )
socket.on( 'reject', () => {
    alert( 'Rejected' )
    operationBlocker.hide()
} )

let key       = document.getElementById( 'key' )
let value     = document.getElementById( 'value' )
let overwrite = document.getElementById( 'overwrite' )

const cleanup = () => {
    key.value         = ''
    value.value       = ''
    overwrite.checked = false
}

const add = () => {
    if( key.value === '' || value.value === '' ) return false
    
    operationBlocker.show()
    
    socket.emit( 'add', {
        key      : key.value,
        value    : value.value,
        overwrite: overwrite.checked
    } )
}