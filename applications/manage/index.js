module.exports = yacona => {
    
    const file = yacona.moduleLoader( 'file' )
    const yaml = yacona.moduleLoader( 'yaml' )
    
    yacona.addRoute( './public' )
    yacona.createWindow( { 
        setMenu: null, 
        isResizable: false, 
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
    
    yacona.setSocket( 'getList', socket => {
        let list = []
        let l = yacona.documents.list( 'log', './' )
        l.forEach( fileName => {
            if( fileName.toLowerCase() !== '.ds_store' && fileName.toLowerCase() !== 'thumbs.db' )
                list.push( fileName )
        } )
        socket.emit( 'list', list )
    } )
    
    yacona.setSocket( 'edit', ( socket, name ) => {
        let data = yacona.emit( 'api/data/load', name )
        data.name = name
        socket.emit( 'edit', data )
    } )
    
    yacona.setSocket( 'remove', ( socket, name ) => {
        if( yacona.emit( 'api/data/remove', name ) )
            socket.emit( 'removed', true )
        else 
            socket.emit( 'reject', true )
    } )
    
    yacona.setSocket( 'save', ( socket, data ) => {
        if( yacona.emit( 'api/data/save', data ) ) socket.emit( 'saved', true )
        else socket.emit( 'reject', true )
    } )
    
}