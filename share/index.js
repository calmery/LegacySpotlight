module.exports = yacona => {
    
    const yaml = yacona.moduleLoader( 'yaml' )
    
    yacona.addRoute( './public' )
    yacona.createWindow( { setMenu: null, isResizable: false, openDevTools: true } )
    
    yacona.setSocket( 'getMyProfile', ( socket, value ) => {
        socket.emit( 'myProfile', yacona.emit( { app: 'controller', event: 'myProfile' } ) )
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
        
        yacona.notifier( 'Shared' )
        setTimeout( () => { socket.emit( 'shared', true ) }, 3000 )
        
    } )
    
}