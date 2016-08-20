socketio.on( 'complateDataReset', function( data ){
    alert( '活動情報を消去しました．' )
    window.location.href = '/'
} )

function del( types ){
    var flg = confirm( 'この処理は取り消すことができません．続けますか？' )
    if( flg )
        if( types === 'data' )
            socketio.emit( 'dataReset', {
                value: true
            } )
        else
            alert( '不正な操作を検知しました．' )
}

socketio.on( 'onInit', function( config ){
    
    if( config.name === 'guest' )
        document.getElementsByClassName( 'hideTarget' )[0].style.display = 'block'
    
} )

window.onload = function(){
    
    document.getElementsByClassName( 'hideTarget' )[0].style.display = 'none'
    
    socketio.emit( 'init', {} )
}