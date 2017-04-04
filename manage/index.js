module.exports = yacona => {
    
    const file = yacona.moduleLoader( 'file' )
    const yaml = yacona.moduleLoader( 'yaml' )
    
    yacona.addRoute( './public' )
    yacona.createWindow( { setMenu: null, isResizable: false } )
    
    yacona.setSocket( 'getList', ( socket, value ) => {
        let list = []
        let l = yacona.documents.list( 'share', './' )
        for( let i=0; i<l.length; i++ ){
            if( l[i].toLowerCase() !== '.ds_store' && l[i].toLowerCase() !== 'thumbs.db' ){
                list.push( l[i] )
            }
        }
        socket.emit( 'list', list )
    } )
    
    yacona.setSocket( 'getMyProfile', ( socket, value ) => {
        socket.emit( 'myProfile', yacona.emit( { app: 'controller', event: 'myProfile' } ) )
    } )
    
    yacona.setSocket( 'edit', ( socket, value ) => {
        let files = yacona.documents.list( 'share', value + '/dump' )
        let dump = []
        for( let i=0; i<files.length; i++ ){
            if( files[i].match( /d\d+.json/ ) ) dump.push( JSON.parse( yacona.documents.share.load( 'share', value + '/dump/' + files[i] ) ) )
        }
        let flag = JSON.parse( yacona.documents.share.load( 'share', value + '/flag.json' ) )
        socket.emit( 'edit', { flag: flag, raw: dump, name: value } )
    } )
    
    yacona.setSocket( 'remove', ( socket, value ) => {
        if( yacona.documents.check( 'share', value ) === true ){
            yacona.documents.share.rmdir( 'share', value )
        }
        socket.emit( 'removed', true )
    } )
    
    yacona.setSocket( 'save', ( socket, value ) => {

        let name     = value.name,
            raw      = value.raw,
            flag     = value.flag,
            meta     = value.meta,
            statuses = value.statuses

        if( yacona.documents.check( 'share', name ) === true ){
            yacona.documents.share.rmdir( 'share', name )
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