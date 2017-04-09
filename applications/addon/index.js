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
    
}