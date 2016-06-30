var express  = require( './library/express' ),
    electron = require( './library/electron' ),
    fs       = require( 'fs' )
    
var config      = require( './config/config' ).config,
    isExistFile = config.fn.isExistFile,
    fixPath     = config.fn.fixPath

var io = require( 'socket.io' )( express.http )
io.sockets.on( 'connection', function( socket ){
    
    /* ----- Global Functions ----- */
    
    function emitResult( type, data ){
        socket.emit( type, {
            value: data
        } )
    }
    
    function emitError( data ){
        socket.emit( 'error', {
            value: data
        } )
    }
    
    /* ----- Main process ----- */
    
    // Checking if the user configuration file exists.
    if( isExistFile( __dirname + '/config/user.js' ) ){
        
        var twitter  = require( './library/twitter' ),
            user     = require( './config/user' ).config
        
        var client = twitter.client
        
        var myId = user.twitter.id
        
        /* ----- Local Functions ----- */
        
        var voteCounter
        function initVote(){
            voteCounter = {
                value: false,
                good : 0,
                bad  : 0
            }
        }
        
        /* ----- Events ----- */
        
        socket.on( 'getMyProfile', function( data ){
            client.get( 'users/show', {
                user_id: myId
            }, function( error, data, response ){
                if( error ) emitError( error )
                else emitResult( 'gotMyProfile', data )
            } )
        } )
        
        // SearchQuery
        socket.on( 'searchQuery', function( data ){
            client.get( 'search/tweets', { 
                q: data.value,
                count: data.count ? data.count : 20
            }, function( error, tweets, response ){
                console.log( tweets )
                if( error ) emitError( error )
                else emitResult( 'searchResult', tweets )
            } )
        } )
        
        socket.on( 'postResult', function( data ){
            var error
            fs.writeFile( __dirname + '/data/result/' + data.name + '.json', JSON.stringify( data.data ), function( err ){
                if( err ) 
                    error = true
            } )
            fs.writeFile( __dirname + '/data/result/' + data.name + '.raw.json', JSON.stringify( data.raw ), function( err ){
                if( err ) 
                    error = true
            } )
            if( error )
                emitError( error )
            else
                emitResult( 'postedResult', {
                    value: {
                        data: 'data/result/' + data.name + '.json',
                        raw : 'data/result/' + data.name + '.raw.json'
                    }
                } )
        } )
        
        socket.on( 'getList', function(){
            fs.readdir( __dirname + '/data/result/', function( err, files ){
                if( err ) emitError( err )
                else {
                    var fileList = []
                    files.filter( function( file ){
                        return file != '.DS_Store' && file.slice( file.length-9, file.length ) != '.raw.json'
                    } ).forEach( function( file ){
                        fileList.push( file.slice( 0, file.length-5 ) )
                    } )
                    emitResult( 'gotList', fileList )
                }
            } )
        } )

        socket.on( 'getListData', function( data ){
            var error = ''
            var json, raw
            fs.readFile( __dirname + '/data/result/' + data.value + '.json', 'utf8', function( err, text ){
                if( err ) error += err
                json = JSON.parse( unescape( text ) )
                fs.readFile( __dirname + '/data/result/' + data.value + '.raw.json', 'utf8', function( err, text ){
                    if( err ) error += err
                    raw = JSON.parse( unescape( text ) )
                    if( error ) 
                        emitError( error )
                    else 
                        emitResult( 'gotListData', {
                            data: json,
                            raw : raw
                        } )
                })
            })
        } )
        
        socket.on( 'userReset', function( data ){
            fs.unlink( __dirname + '/config/user.js', function( err ){
                if( err ) emitError( err )
                else
                    emitResult( 'userResetComplate', {
                        value: true
                    } )
            } )
        } )
        
        socket.on( 'dataReset', function( data ){
            fs.readdir( __dirname + '/data/result/', function( err, files ){
                for( var i=0; i<files.length; i++ )
                    fs.unlink( __dirname + '/data/result/' + files[i], function( err ){
                        if( err ) emitError( err )
                    } )
            } )
            emitResult( 'dataResetComplate', {
                value: true
            } )
        } )

    // Not exist.
    } else {
        
        socket.on( 'createUser', function( data ){
            
            console.log( 'createUser function' )
            
            var output   = '', 
                writeFlg = true
            
            var name         = data.name.replace( /\'/g, "\'" ),
                organization = data.organization.replace( /\'/g, "\'" ),
                id           = express.profile.id.replace( /\'/g, "\'" ),
                screen_name  = express.profile.username.replace( /\'/g, "\'" ),
                token_key    = express.profile.twitter_token.replace( /\'/g, "\'" ),
                token_secret = express.profile.twitter_token_secret.replace( /\'/g, "\'" )
            
            if( !name || !organization ){
                emitError( '未入力の項目が存在します' )
                writeFlg = false
            }
            if( !screen_name || !token_key || !token_secret ){
                emitError( '値の取得に失敗しました' )
                writeFlg = false
            }
            
            if( writeFlg ){
                
                output += 'exports.config = {'
                
                output += 'name: "' + name + '",'
                output += 'organization: "' + organization + '",'
                output += 'twitter: {'
                output += 'id: ' + id + ','
                output += 'screen_name: "' + screen_name + '",'
                output += 'access_token_key: "' + token_key + '",'
                output += 'access_token_secret: "' + token_secret + '"'
                output += '}'
                
                output += '}'
            
                fs.writeFile( __dirname + '/config/user.js', output, function( error ){
                    if( error ) emitError( error )
                    else emitResult( 'userCreated', true )
                } )
            
            }
                
        } )

    } 
    
} )