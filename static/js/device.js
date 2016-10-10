socketio.emit( 'getPairingRequestList', {} )

socketio.on( 'updateDevicePage', function(){
    window.location.reload()
} )

socketio.on( 'pairingRequestList', function( list ){
    list = list.value
    
    var allowed = list.allowed,
        during  = list.during
    
    var bindAllowed = []
    var bindDuring = []
    
    for( var i=0; i<allowed.length; i++ )
        bindAllowed.push( {
            name: allowed[i]
        } )
    
    for( var i=0; i<during.length; i++ )
        bindDuring.push( {
            name: during[i]
        } )
    
    console.log( allowed )
    console.log( during )

    bind.binding( 'allowedDevice', bindAllowed )
    bind.binding( 'duringDevice', bindDuring )
    
} )

function permitPairing( device ){
    document.getElementById( device ).innerHTML = '認証中'
    socketio.emit( 'permitPairing', {
        device: device
    } )
    globalDevice = device
}

var globalDevice

socketio.on( 'pairingCode', function( pairing ){
    alert( 'Device : ' + globalDevice + '\nActivation code : ' + pairing.value )
} )

function removePairing( device ){
    socketio.emit( 'removePairing', {
        device: device
    } )
}