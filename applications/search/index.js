module.exports = yacona => {
    
    const utility = yacona.moduleLoader( 'utility' )
    const yaml    = yacona.moduleLoader( 'yaml' )
    
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
    
    let isSearch = false
    yacona.setSocket( 'search', ( socket, value ) => {
        if( isSearch === false ){
            isSearch = true
            let count = 15
            if( yacona.config.check( yacona.getName(), 'config.yaml' ) )
                count = yaml.parser( yacona.config.load( 'config.yaml' ) ).search_count
            yacona.emit( 'api/twitter/search', { query: value, count: count } ).then( ( tweet ) => {
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
    
    yacona.setSocket( 'save', ( socket, data ) => {
        if( yacona.emit( 'api/data/save', data ) ) socket.emit( 'saved', true )
        else socket.emit( 'reject', true )
    } )
    
}