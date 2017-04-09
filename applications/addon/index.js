module.exports = yacona => {
    
    yacona.addRoute( './public' )
    yacona.createWindow( { 
        setMenu: null, 
        setResizable: false,
        openDevTools: true
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
                socket.emit( 'confirm', { url: options.url, message: status.statusText } )
            } else {
                socket.emit( 'log', 'installed' )
                socket.emit( 'complete', true )
                yacona.emit( 'controller/refresh' )
            }
        } )
    } )
    
    yacona.setSocket( 'getInstalledAddons', socket => socket.emit( 'installedAddons', yacona.emit( 'api/addons' ) ) )
    
    yacona.setSocket( 'remove', ( socket, appName ) => {
        yacona.emit( 'api/app/uninstall', appName, ( status ) => {
            if( status && status.status === true ){
                socket.emit( 'complete', true )
                yacona.emit( 'controller/refresh' )
            } else socket.emit( 'reject', status.statusText )
        } )
    } )
    
}