const fs   = require( 'fs' ),
      path = require( 'path' )

// Additional modules
const JsYaml = require( 'js-yaml' )

// Utility
const Util = require( '../libs/utility' )

// yamlParser :: String -> Object
const yamlParser = ( path ) => JsYaml.safeLoad( fs.readFileSync( Util.fixPath( __dirname, path ), 'utf8' ) )

var config

const update = function(){
    config = {}
    
    config = {
        default : yamlParser( 'config/default.yaml' ),
        electron: yamlParser( 'config/electron.yaml' ),
        twitter : yamlParser( 'config/twitter.yaml' ),
        server  : yamlParser( 'config/server.yaml' )
    }
    
    console.log( Util.isExist( Util.fixPath( __dirname, 'config', 'user.yaml' ) ) )

    if( Util.isExist( Util.fixPath( __dirname, 'config', 'user.yaml' ) ) )
        config['user'] = yamlParser( 'config/user.yaml' )
    
    module.exports.config = config
    
    return config
}

update()

module.exports.update = update