module.exports = yacona => {
    
    if( yacona.emit( 'api/config/load/oauth' ) === undefined ) {
        yacona.localAppLoader( '../oauth' )
        yacona.kill( yacona.getName() )
        return false
    }
    
    let controller
    
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
    } ).then( window => controller = window )
    
    yacona.setSocket( 'connection', socket => {
        yacona.emit( 'api/getProfile' ).then( ( profile ) => {
            if( profile.profile_image_url.indexOf( '_normal' ) !== -1 ) 
                profile.profile_image_url = profile.profile_image_url.replace( /_normal/, '' )
            socket.emit( 'myProfile', {
                name       : profile.name,
                id         : profile.id_str,
                screen_name: profile.screen_name,
                icon       : profile.profile_image_url
            } )
        } ).catch( console.error )
    } )
    
}