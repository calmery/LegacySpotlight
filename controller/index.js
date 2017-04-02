module.exports = yacona => {
    
    let utility = yacona.moduleLoader( 'utility' )
    let window
    
    yacona.addRoute( './public' )
    yacona.createWindow( { setMenu: null, setResizable: false, openDevTools: true } ).then( w => {
        window = w
        window.hide()
    } )
    
    yacona.setSocket( 'connection', ( socket, value ) => {
        let auth = yacona.config.load( 'oauth', 'twitter/authorization.yaml' )
        if( auth.status === false ){
            yacona.localAppLoader( utility.fixPath( __dirname, '..', 'oauth' ) )
            yacona.kill( yacona.getName() )
        } else {
            window.show()
        }
    } )
    
    yacona.setSocket( 'startup', ( socket, value ) => {
        yacona.localAppLoader( utility.fixPath( __dirname, '..', value ) )
        socket.emit( 'startupComplete', true )
    } )
    
}