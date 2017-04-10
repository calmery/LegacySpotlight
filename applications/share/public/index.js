socket.emit( 'getList' )
socket.on( 'list', list => {
    console.log( '??' )
    let e = document.getElementById( 'list' )
    let output = ''
    list.forEach( name => {
        output += '<div class="content clearfix">' + 
            '<div class="list_name">' + name + '</div>' +
            '<div class="btn float_r" onclick="share( \'' + name + '\' )">共有</div>' +
            '</div>'
    } )
    e.innerHTML = output
} )

socket.on( 'shared', () => {
    alert( 'Shared' )
    operationBlocker.hide()
} )
socket.on( 'reject', message => {
    alert( 'Rejected\n' + message )
    operationBlocker.hide()
} )

const share = name => {
    if( confirm( 'Do you want to send it ?' ) ){
        console.log( 'call' )
        operationBlocker.show()
        socket.emit( 'share', name )
    }
}