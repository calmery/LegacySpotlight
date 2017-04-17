module.exports = yacona => {
    
    let controller
    
    const yaml = yacona.moduleLoader( 'yaml' )
    
    yacona.addRoute( './public' )
    yacona.createWindow( {
        setMinimumSize: { 
            width: 200, 
            height: 200 
        }, 
        setMaximumSize: { 
            width: 200, 
            height: 600 
        }, 
        width:200, 
        setMenu: null, 
        setResizable: true
    } ).then( window => {
        controller = window
        
        yacona.emit( 'api/ready', () => {
            if( yacona.emit( 'api/isAuthorized' ) === false ){
                yacona.emit( 'api/app/launch', 'oauth' )
                controller.hide()
            }
        } )

        yacona.emit( 'api/available', () => {
            controller.show()
            
            if( yacona.config.check( 'addon', 'autostart.yaml' ) ){
                let autostart = yaml.parser( yacona.config.share.load( 'addon', 'autostart.yaml' ) )
                autostart.app.forEach( name => yacona.emit( 'api/app/launch', name ) )
            }
        } )
    } )
    
    let s
    yacona.setSocket( 'connection', socket => s = socket  )
    
    yacona.setSocket( 'getMyProfile', socket => {
        yacona.emit( 'api/twitter/profile', profile => {
            if( profile.profile_image_url.indexOf( '_normal' ) !== -1 ) 
                profile.profile_image_url = profile.profile_image_url.replace( /_normal/, '' )
            socket.emit( 'myProfile', {
                name       : profile.name,
                id         : profile.id_str,
                screen_name: profile.screen_name,
                icon       : profile.profile_image_url
            } )
        } )
    } )
    
    yacona.setSocket( 'launch', ( socket, appName ) => {
        let status = yacona.emit( 'api/app/launch', appName )
        if( status.status === false ) socket.emit( 'reject', status.statusText )
    } )
    
    yacona.setSocket( 'getInstalledAddons', socket => socket.emit( 'installedAddons', yacona.emit( 'api/addons' ) ) )
    
    yacona.on( 'refresh', () => {
        s.emit( 'refresh', true )
    } )
    
}