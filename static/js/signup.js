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
        socketio.emit( 'createUser', {
            name        : name,
            organization: organization
        } )
    else 
        alert( '入力が不正，または未入力の項目があります．' )
}

function skip(){
    socketio.emit( 'createUser', {
        name        : 'guest',
        organization: 'guest'
    } )
}