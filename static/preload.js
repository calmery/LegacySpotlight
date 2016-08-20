var socketio = io()

socketio.on( 'processError', function( error ){
    if( typeof error.value == 'object' )
        error.value = JSON.stringify( error.value )
        alert( 'エラーが発生しました．\n\n' + error.value )
} )