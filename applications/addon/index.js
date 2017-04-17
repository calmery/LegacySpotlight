module.exports = yacona => {
    
    const yaml = yacona.moduleLoader( 'yaml' )
    
    yacona.addRoute( './public' )
    yacona.createWindow( { 
        setMenu: null, 
        setResizable: false,
        openDevTools: false,
        width: 800
    } )
    
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
    
    yacona.setSocket( 'installRequest', ( socket, options ) => {
        yacona.emit( 'api/app/install', options, ( status ) => {
            if( status && status.status === false ){
                socket.emit( 'confirm', { url: options.url, message: status.statusText, auto: options.auto } )
            } else {
                if( options.auto === true ){
                    let name = options.url.split( /\/|\\/ ).pop().replace( RegExp( '.zip' ), '' )
                    let autostart = { app: [] }
                    if( yacona.config.check( 'autostart.yaml' ) ){
                        autostart = yaml.parser( yacona.config.load( 'autostart.yaml' ) )
                        if( autostart.app === undefined ) autostart.app = []
                    }
                    if( autostart.app.indexOf( name ) !== -1 ) return true
                    autostart.app.push( name )
                    yacona.config.save( 'autostart.yaml', yaml.dump( autostart ) )
                }
                socket.emit( 'log', 'installed' )
                socket.emit( 'complete', true )
                yacona.emit( 'controller/refresh' )
            }
        } )
    } )
    
    yacona.setSocket( 'getInstalledAddons', socket => {
        let list = yacona.emit( 'api/addons' )
        
        let autostart = { app: [] }
        if( yacona.config.check( 'autostart.yaml' ) )
            autostart = yaml.parser( yacona.config.load( 'autostart.yaml' ) )
        
        socket.emit( 'installedAddons', {
            app: list,
            startup: autostart.app
        } )
    } )
    
    yacona.setSocket( 'remove', ( socket, appName ) => {
        yacona.emit( 'api/app/uninstall', appName, ( status ) => {
            if( status && status.status === true ){
                let autostart = { app: [] }
                if( yacona.config.check( 'autostart.yaml' ) )
                    autostart = yaml.parser( yacona.config.load( 'autostart.yaml' ) )
                    
                if( autostart.app.indexOf( appName ) !== -1 ){
                    autostart.app.splice( autostart.app.indexOf( appName ), 1 )
                    yacona.config.save( 'autostart.yaml', yaml.dump( autostart ) )
                }
                
                socket.emit( 'complete', true )
                yacona.emit( 'controller/refresh' )
            } else socket.emit( 'reject', status.statusText )
        } )
    } )
    
}