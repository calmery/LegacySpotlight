module.exports = yacona => {
    
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
    
    yacona.setSocket( 'getConfig', socket => {
        socket.emit( 'config', yacona.emit( 'api/config' ) )
    } )
    
    /* Control */
    
    yacona.setSocket( 'add', ( socket, value ) => {
        if( yacona.emit( 'api/config/add', value.key, value.value, value.overwrite ) )
            socket.emit( 'complete', true )
        else
            socket.emit( 'reject', true )
    } )
    
    yacona.setSocket( 'remove', ( socket, value ) => {
        if( yacona.emit( 'api/config/remove', value.key ) ){
            socket.emit( 'complete', true )
            socket.emit( 'removed', true )
        } else
            socket.emit( 'reject', true )
    } )
    
    yacona.setSocket( 'enable', ( socket, value ) => {
        if( yacona.emit( 'api/config/enable', value.key ) )
            socket.emit( 'complete', true )
        else
            socket.emit( 'reject', true )
    } )
    
    yacona.setSocket( 'disable', ( socket, value ) => {
        if( yacona.emit( 'api/config/disable', value.key ) )
            socket.emit( 'complete', true )
        else
            socket.emit( 'reject', true )
    } )
    
}