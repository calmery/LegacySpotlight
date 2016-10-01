/* ----- IO events ----- */
socketio.on( 'userCreated', function( data ){
    alert( '登録が完了しました．' )
    window.location.href = '/'
} )

/* ----- Functions ----- */
function signup(){
    var flg = true
    var name         = document.getElementById( 'fname' ).value,
        organization = document.getElementById( 'foriga' ).value
    if( !name || !organization )
        flg = false
        if( flg )
            socketio.emit( 'recreateUser', {
                name        : name,
                organization: organization
            } )
    else 
        alert( '入力が不正です．確認してください．' )
}