module.exports = yacona => {
    
    let utility = yacona.moduleLoader( 'utility' )
    let window
    
    yacona.addRoute( './public' )
    yacona.createWindow( { setMinimumSize: { width: 200, height: 200 }, setMaximumSize: { width: 200, height: 600 }, width:200, setMenu: null, setResizable: true } ).then( w => {
        window = w
        window.hide()
    } )
    
    let myProfile
    let isStartup = false
    
    yacona.setSocket( 'connection', ( socket, value ) => {
        if( isStartup === false ){
            console.log( 'Welcome to Spotlight Beta !' )
            let auth = yacona.config.load( 'oauth', 'twitter/authorization.yaml' )
            if( auth.status === false ){
                yacona.localAppLoader( utility.fixPath( __dirname, '..', 'oauth' ) )
                yacona.kill( yacona.getName() )
            } else {
                window.show()
                yacona.localAppLoader( utility.fixPath( __dirname, '..', 'api' ) )
                yacona.emit( { app: 'api', event: 'getProfile' } ).then( ( profile ) => {
                    myProfile = {
                        name: profile.name,
                        id: profile.id_str,
                        screen_name: profile.screen_name,
                        icon: profile.profile_image_url
                    }
                    if( myProfile.icon.indexOf( '_normal' ) !== -1 ) myProfile.icon = myProfile.icon.replace( /_normal/, '' )
                    console.log( myProfile )
                    socket.emit( 'ready' )
                } )
                isStartup = true
            }
        } else socket.emit( 'ready' )
    } )
    
    yacona.setSocket( 'getMyProfile', ( socket, value ) => {
        socket.emit( 'myProfile', myProfile )
    } )
    
    yacona.setSocket( 'startup', ( socket, value ) => {
        yacona.localAppLoader( utility.fixPath( __dirname, '..', value ) )
        socket.emit( 'startupComplete', true )
    } )
    
}