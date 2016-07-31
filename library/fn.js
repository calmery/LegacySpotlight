var path    = require( 'path' ),
    fs      = require( 'fs' )

exports.fn = {

    isExist: function( file ){
        try {
            fs.statSync( path.resolve( file ) )
            return true
        } catch( error ) {
            if( error.code === 'ENOENT' )
                return false
        }
    },

    fixPath: function( url ){
        var args = [].slice.call( arguments )
        if( args.length > 1 )
            url = path.join.apply( this, args )
        return path.resolve( url )
    }

}