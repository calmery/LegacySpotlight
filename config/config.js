var path    = require( 'path' ),
    fs      = require( 'fs' )

var config = {
    
    express: {
        port: ( function(){
            var net    = require('net'),
                server = new net.Server()
            var port
            for( ;port = 1000 + Math.floor( Math.random() * 9999 ); )
                try {
                    server.listen( port, '127.0.0.1' )
                    server.close()
                    break
                } catch( e ) {
                    continue
                }
            return port
        } )()
    },
    
    electron: {
        app: {
            show: false,
            width: 800,
            height: 600,
            center: true,
            fullscreen: false,
            fullscreenenable: false,
            title : 'Spotlight Beta'
        },
        maxListeners: 5
    },
    
    twitter: {
        name: 'SpotlightBeta-Patchworks',
        app: '12368503',
        consumer_key: '2aZzmhzrNsXqjQcDv0z3eB8cQ',
        consumer_secret: 'qBHKHCoaHOsfrzkTB5AchtWgpB1wCIuQBc6ZMQlylod5QdAdkk'
    },
    
    fn: {
        isExistFile: function( file ){
            try {
                fs.statSync( path.resolve( file ) )
                return true
            } catch( error ) {
                if( error.code === 'ENOENT' )
                    return false
            }
        },
        fixPath: function( url ){
            return path.resolve( url )
        },
        checkUserAgent: function( request ){
            return request.headers['user-agent'].indexOf('Electron') != -1
        }
    }
    
}

/* ----- Exports ----- */

exports.config = config