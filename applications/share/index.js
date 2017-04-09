const request = require( 'request' )

module.exports = yacona => {
    
    const yaml = yacona.moduleLoader( 'yaml' )
    
    yacona.addRoute( './public' )
    yacona.createWindow( { setMenu: null, isResizable: false, openDevTools: true } )
    
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
    
    yacona.setSocket( 'getUrl', ( socket, value ) => {
        if( yacona.config.check( yacona.getName(), 'config.yaml' ) )
            socket.emit( 'url', yaml.parser( yacona.config.load( 'config.yaml' ) ) )
        else
            socket.emit( 'url', { server_url: 'http://example.com' } )
    } )
    
    yacona.setSocket( 'saveUrl', ( socket, value ) => {
        let conf = {}
        if( yacona.config.check( yacona.getName(), 'config.yaml' ) )
            conf = yaml.parser( yacona.config.load( 'config.yaml' ) )
        conf.server_url = value
        let status = yacona.config.save( 'config.yaml', yaml.dump( conf ) )
        if( status.status === true ) socket.emit( 'saved', true )
        else socket.emit( 'reject', true )
    } )
    
    yacona.setSocket( 'getList', ( socket, value ) => {
        let list = []
        let l = yacona.documents.list( 'log', './' )
        for( let i=0; i<l.length; i++ ){
            if( l[i].toLowerCase() !== '.ds_store' && l[i].toLowerCase() !== 'thumbs.db' ){
                list.push( l[i] )
            }
        }
        socket.emit( 'list', list )
    } )
    
    yacona.setSocket( 'share', ( socket, value ) => {
        
        if( yacona.config.check( yacona.getName(), 'config.yaml' ) ){
            let config = yaml.parser( yacona.config.load( 'config.yaml' ) ).server_url
            if( config ){
                config += '/report'
                request.post( {
                    uri: config,
                    form: yacona.documents.load( 'log', value + '/statuses.json' ),
                    json: false
                }, ( error, response, body ) => {
                    if( error !== null || response.statusCode !== 200 ){
                        yacona.notifier( 'Rejected' )
                        socket.emit( 'reject', 'Bad request' )
                    } else {
                        yacona.notifier( 'Shared' )
                        socket.emit( 'shared', true )
                    }
                } )
            } else socket.emit( 'reject', 'Unknown server. Please check server setting' )
        } else socket.emit( 'reject', 'Unknown server. Please check server setting' )
        
    } )
    
}