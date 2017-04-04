const y = require( 'yacona' )

module.exports = yacona => {
    
    yacona.addRoute( './public' )
    yacona.createWindow( { setMenu: null, isResizable: false } )
    
    yacona.setSocket( 'getMyProfile', ( socket, value ) => {
        socket.emit( 'myProfile', yacona.emit( { app: 'controller', event: 'myProfile' } ) )
    } )
    
    yacona.setSocket( 'getAddons', ( socket, value ) => {
        socket.emit( 'addons', yacona.getInstalledAppList() )
    } )
    
    yacona.setSocket( 'install', ( socket, value ) => {
        let status = y.appInstaller( value, function( status ){
            socket.emit( 'installed', true )
            yacona.emit( { app: 'controller', event: 'update' }, true )
        } )
    } )
    
    yacona.setSocket( 'uninstall', ( socket, value ) => {
        let status = y.appRemover( value )
        if( status === true )socket.emit( 'uninstalled', true )
        else if( status === false ) socket.emit( 'reject', true )
        yacona.emit( { app: 'controller', event: 'update' }, true )
    } )
    
}