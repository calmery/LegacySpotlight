module.exports = yacona => {
    
    const file = yacona.moduleLoader( 'file' )
    const yaml = yacona.moduleLoader( 'yaml' )
    
    yacona.addRoute( './public' )
    yacona.createWindow( { setMenu: null, isResizable: false, openDevTools: true } )
    
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
    
    yacona.setSocket( 'edit', ( socket, value ) => {
        let files = yacona.documents.list( 'log', value + '/dump' )
        let dump = []
        for( let i=0; i<files.length; i++ ){
            if( files[i].match( /d\d+.json/ ) ) dump.push( JSON.parse( yacona.documents.share.load( 'log', value + '/dump/' + files[i] ) ) )
        }
        let flag = JSON.parse( yacona.documents.share.load( 'log', value + '/flag.json' ) )
        socket.emit( 'edit', { flag: flag, raw: dump, name: value } )
    } )
    
    yacona.setSocket( 'remove', ( socket, value ) => {
        if( yacona.documents.check( 'log', value ) === true ){
            yacona.documents.share.rmdir( 'log', value )
        }
        socket.emit( 'removed', true )
    } )
    
    yacona.setSocket( 'save', ( socket, value ) => {

        let name     = value.name,
            raw      = value.raw,
            flag     = value.flag,
            meta     = value.meta,
            statuses = value.statuses

        if( yacona.documents.check( 'log', name ) === true ){
            yacona.documents.share.rmdir( 'log', name )
        }

        for( let i=0; i<raw.length; i++ ){
            yacona.documents.share.save( 'log', name + '/dump/d' + i + '.json', JSON.stringify( raw[i] ) )
        }

        yacona.documents.share.save( 'log', name + '/flag.json', JSON.stringify( flag ) )
        yacona.documents.share.save( 'log', name + '/meta.json', JSON.stringify( meta ) )

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

        yacona.documents.share.save( 'log', name + '/statuses.json', JSON.stringify( s ) )

        socket.emit( 'saved', true )

    } )
    
}