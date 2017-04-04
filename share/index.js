module.exports = yacona => {
    
    yacona.addRoute( './public' )
    yacona.createWindow( { setMenu: null, isResizable: false } )
    
    yacona.setSocket( 'getMyProfile', ( socket, value ) => {
        socket.emit( 'myProfile', yacona.emit( { app: 'controller', event: 'myProfile' } ) )
    } )
    
}