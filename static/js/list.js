var sharedFlg = false

socketio.on( 'complateShare', function( response ){
    window.location.href = '/edit'
    alert( '共有が完了しました．' )
} )
socketio.on( 'gotSharedList', function( data ){
    sessionStorage.setItem( 'editList', data.value )
    window.location.href = '/user'
} )

socketio.on( 'gotList', function( data ){
    var obj = []
    for( var i=0; i<data.value.length; i++ )
        obj.push( { name: data.value[i] } )
    console.log( obj )
    if( obj.length > 0 ){
        bind.binding( 'tweet', obj )
        bind.view( 'tweet' )
    }
} )

socketio.on( 'gotListData', function( data ){
    sessionStorage.setItem( 'editList', data.value )
    if( !sharedFlg )
        window.location.href = '/edit'
} )
function getList( val ){
    socketio.emit( 'getListData', {
        value: val
    } )
    sessionStorage.setItem( 'editName', val )
}

function share( name ){

    if( !confirm('この結果をシェアしますか？') )
        return false

    socketio.emit( 'share', name )

    sharedFlg = true
}

function getShared( num ){
    socketio.emit( 'pullSharedList', num )
    sessionStorage.setItem( 'editName', num )
}

socketio.on( 'onInit', function( config ){
    console.log( config )
    if( config.name === 'guest' ){
        var elements = document.getElementsByClassName( 'hideTarget' )
        for( var i=0; i<elements.length; i++ )
            elements[i].style.display = 'none'
    }
} )

window.onload = function(){
    bind.hide( 'tweet' )
    socketio.emit( 'getList', {
        value: true
    } )
    socketio.emit( 'init', {} )
}