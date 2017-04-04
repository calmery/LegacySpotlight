module.exports = yacona => {
    
    const utility = yacona.moduleLoader( 'utility' )
    const yaml    = yacona.moduleLoader( 'yaml' )
    
    yacona.addRoute( './public' )
    yacona.createWindow( { setMenu: null, setResizable: false, openDevTools: false } )
    
    yacona.setSocket( 'getMyProfile', ( socket, value ) => {
        socket.emit( 'myProfile', yacona.emit( { app: 'controller', event: 'myProfile' } ) )
    } )
    
    let isSearch = false
    yacona.setSocket( 'search', ( socket, value ) => {
        if( isSearch === false ){
            isSearch = true
            yacona.emit( { app: 'api', event: 'search' }, { query: value, count: 15 } ).then( ( tweet ) => {
                yacona.notifier( '検索が終了しました' )
                isSearch = false
                socket.emit( 'result', tweet )
            } )
        }
    } )
    
    yacona.setSocket( 'getConfig', ( socket, value ) => {
        if( yacona.config.check( yacona.getName(), 'config.yaml' ) )
            socket.emit( 'config', yaml.parser( yacona.config.load( 'config.yaml' ) ) )
        else
            socket.emit( 'config', {} )
    } )
    
    yacona.setSocket( 'getWord', ( socket, value ) => {
        let c = {}
        if( yacona.config.check( yacona.getName(), 'words.yaml' ) ){
            c = yaml.parser( yacona.config.load( 'words.yaml' ) )
        }
        socket.emit( 'word', c )
    } )
    
    yacona.setSocket( 'saveWord', ( socket, value ) => {
        let c 
        if( yacona.config.check( yacona.getName(), 'words.yaml' ) )
            c = yaml.parser( yacona.config.load( 'words.yaml' ) )
        else
            c = {}
        c[value.name] = value
        yacona.config.save( 'words.yaml', yaml.dump( c ) )
        socket.emit( 'saved', true )
    } )
    
    yacona.setSocket( 'config', ( socket, value ) => {
        
        let count = value.search_count
        let c 
        if( yacona.config.check( yacona.getName(), 'config.yaml' ) )
            c = yaml.parser( yacona.config.load( 'config.yaml' ) )
        else
            c = {}
        
        if( count > 100 ) count = 100
        c.search_count = count
        
        yacona.config.save( 'config.yaml', yaml.dump( c ) )
        socket.emit( 'saved', true )
        
    } )
    
    yacona.setSocket( 'save', ( socket, value ) => {
        
        let name     = value.name,
            raw      = value.raw,
            flag     = value.flag,
            meta     = value.meta,
            statuses = value.statuses
        
        if( yacona.documents.check( 'share', name ) === true ){
            socket.emit( 'reject', 'exists' )
            return false
        }
        
        for( let i=0; i<raw.length; i++ ){
            yacona.documents.share.save( 'share', name + '/dump/d' + i + '.json', JSON.stringify( raw[i] ) )
        }
        
        yacona.documents.share.save( 'share', name + '/flag.json', JSON.stringify( flag ) )
        yacona.documents.share.save( 'share', name + '/meta.json', JSON.stringify( meta ) )
        
        let s = []
        for( let i=0; i<statuses.length; i++ ){
            s.push( {
                id: statuses[i].id,
                text: statuses[i].text,
                media: statuses[i].media_url,
                user: {
                    name: statuses[i].user.name,
                    screen_name: statuses[i].user.screen_name,
                    id: statuses[i].user.id
                },
                flag: flag[i]
            } )
        }
        
        yacona.documents.share.save( 'share', name + '/statuses.json', JSON.stringify( s ) )
        
        socket.emit( 'saved', true )
        
    } )
    
}