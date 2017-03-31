module.exports = yacona => {
    
    let utility = yacona.moduleLoader( 'utility' )
    
    yacona.addRoute( './public' )
    yacona.createWindow( { setMenu: null, setResizable: false, openDevTools: true } )
    
    yacona.setSocket( 'startup', ( socket, value ) => {
        yacona.localAppLoader( utility.fixPath( __dirname, '..', value ) )
        socket.emit( 'startupComplete', true )
    } )
    
}