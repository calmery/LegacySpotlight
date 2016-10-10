const path = require( 'path' ),
      fs   = require( 'fs' ),
      os   = require( 'os' )

const fn = {

    // Check file.
    isExist: function( file ){
        try {
            fs.statSync( path.resolve( file ) )
            return true
        } catch( error ){
            // if( error.code === 'ENOENT' )
            return false
        }
    },

    // Create a new path from arguments.
    fixPath: function(){
        return path.resolve( path.join.apply( this, [].slice.call( arguments ) ) )
    },

    // http://qiita.com/_shimizu/items/b38d1459abf8436f7f1f
    // Thanks to _shimizu ! 
    getLocalAddress: function(){
        var ifacesObj = {}
        ifacesObj.ipv4 = []
        ifacesObj.ipv6 = []
        const interfaces = os.networkInterfaces()
        for( var dev in interfaces )
            interfaces[dev].forEach( function( details ){
                if( !details.internal )
                    switch( details.family ){
                        case 'IPv4':
                            ifacesObj.ipv4.push( {
                                name   : dev, 
                                address: details.address
                            } )
                            break
                        case 'IPv6':
                            ifacesObj.ipv6.push( {
                                name   : dev, 
                                address: details.address
                            } )
                            break
                    }
            } )
        return ifacesObj
    },
    
    getLocalAddressIpv4: function(){
        return this.getLocalAddress()['ipv4'][0]['address']
    }

}

module.exports = fn