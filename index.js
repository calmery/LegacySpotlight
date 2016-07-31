var express = require( './library/express' ),
    server  = express.run()

var request = require( 'request' ),
    fs      = require( 'fs' ),
    os      = require( 'os' )

var sharedsession = require( 'express-socket.io-session' ),
    io            = require( 'socket.io' )( server.http )

io.use( sharedsession( server.session ) )

// Root user's session id.
var root 

var config = require( './config/config' ).config
var serverAddress = 'http' + ( config.server.secure ? 's' : '' ) + '://' + config.server.uri

var fn      = require( './library/fn' ).fn,
    fixPath = fn.fixPath,
    isExist = fn.isExist

var userConfig
var twitter
var client

if( isExist( fixPath( 'config', 'user.js' ) ) ){
    userConfig = require( './config/user' ).config
    twitter = require( './library/twitter' )
    client  = twitter.client
}

var voteStatus = {
    good: 0,
    bad: 0,
    text: '',
    id: 0
}

io.sockets.on( 'connection', function( socket ){
    
    if( !root && express.root == socket.handshake.sessionID ){
        root = express.root
        console.log( 'Root user\'s session id of application is ' + root )
    }
    
    /* ----- Global Functions ----- */

    function emitResult( type, data ){
        socket.emit( type, {
            value: data
        } )
    }
    
    function emitError( data ){
        socket.emit( 'processError', {
            value: data
        } )
    }
    
    socket.on( 'getMyProfile', function( data ){
        console.log( userConfig )
        client.get( 'users/show', {
            user_id: userConfig.id
        }, function( error, data, response ){
            if( error ) emitError( error )
            else emitResult( 'gotMyProfile', data )
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
        emitResult( 'gotListData', fs.readFileSync( fixPath( __dirname, 'data', 'result', data.value + '.json' ), 'utf-8' ) )
    } )
    
    // SearchQuery
    socket.on( 'searchQuery', function( data ){
        client.get( 'search/tweets', { 
            q: data.value,
            count: data.count ? data.count : 20
        }, function( error, tweets, response ){
            if( error ) emitError( error )
            else emitResult( 'searchResult', tweets )
        } )
    } )

    socket.on( 'postResult', function( data ){
        console.log( data.name )
        var error
        fs.writeFileSync( __dirname + '/data/result/' + data.name + '.json', JSON.stringify( data.data ) )
        fs.writeFileSync( __dirname + '/data/result/' + data.name + '.raw.json', JSON.stringify( data.raw ) )
        emitResult( 'postedResult', {
            value: {
                data: 'data/result/' + data.name + '.json',
                raw : 'data/result/' + data.name + '.raw.json'
            }
        } )
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
    
    
    socket.on( 'pullSharedList', function( rank ){
        
        if( rank == 6 ){
            rank = 'others'
        }
        
        request.get( {
            uri: serverAddress + '/list?rank=' + rank
        }, function( error, response, body ){
            
            if( error )
                emitError( 'サーバとの接続に失敗しました．接続状態，また設定を確認してください．' )
            else {
                
                if( body ){
                    
                    console.log( body )
                    
                    emitResult( 'gotSharedList', body )
                    
                }
                
            }
            
        } )
        
    } )
    
    socket.on( 'getUserProfile', function( id ){
        console.log( id )
        var data = {}
        twitter.fn.get.userProfile( id ).then( function( profile ){
            data.profile = profile
            twitter.fn.get.userTweets( id ).then( function( tweets ){
                data.tweets = tweets
                emitResult( 'gotUserProfile', data )
            }, function( inject){
                emitError( JSON.stringify( inject) )
            } )
        }, function( inject){
            emitError( JSON.stringify( inject ))
        } )
    } )
    
    socket.on( 'share', function( name ){
        
        var result = JSON.parse( fs.readFileSync( fixPath( __dirname, 'data', 'result', name + '.json' ), 'utf-8' ) )
        
        require( 'getmac' ).getMac( function( error, macAddress ){
            if( error ) emitError( 'コンピュータを識別できませんした．' )
            
            result.user = {
                id          : userConfig.id,
                name        : userConfig.name,
                access_token: userConfig.twitter.access_token,
                os          : os.type(),
                macaddress  : macAddress,
                comment     : null,
                pcuser      : os.homedir()
            }
            
            request.post( {
                uri: serverAddress + '/report',//202.16.132.30
                form: JSON.stringify( result ),
                json: false
            }, function( err, res, body ){
                console.log( 'Uploadedasdasd' )
                if( err )
                    emitError( 'サーバとの接続に失敗しました．接続状態，また設定を確認してください．' )
                else {
                    
                    console.log( 'Uploaded' )
                    
                    if( body )
                        emitError( JSON.parse( body ).error )
                    else
                        emitResult( 'complate', true )
                    
                }
            } )
            
        } )
        
    } )
    
    
    socket.on( 'openVote', function( vote ){
        vote.good = 0
        vote.bad  = 0
        voteStatus = vote
    } )
    
    socket.on( 'vote',function( think ){
        if( think == 'good' ) voteStatus.good++
        else voteStatus.bad++
    } )
    
    socket.on( 'closeVote', function(){
        emitResult( 'resultVote', voteStatus )
    } )
    
    socket.on( 'pullVote', function(){
        emitResult( 'pulledVote', voteStatus.text )
    } )
    
    socket.on( 'advancedSearch', function( data ){
        
        if( data.think == '-' ) delete data.think
        twitter.fn.search( data ).then( function( tweet ){
            emitResult( 'searchResult', tweet )
        } )
        
    } )
    
    
    // Create new user
    socket.on( 'createUser', function( data ){

        var output
        
        if( !data.name || !data.organization ){
            emitError( '未入力の項目が存在します' )
            return false
        }

        data.name         = data.name.replace( /\'/g, "\'" )
        data.organization = data.organization.replace( /\'/g, "\'" )
        
        request.get( {
            uri: serverAddress + '/user?name=' + data.name
        }, function( error, response, body ){
            
            if( error )
                emitError( 'サーバに接続できませんでした．接続状態を確認してください．' )
            else {
                
                body = JSON.parse( body )
                
                if( body.response.exist )
                    emitError( '既にユーザが存在しています．別の名前をお使いください．' )
                else {
                    
                    data.id                 = express.profile.id
                    data.screen_name        = express.profile.username
                    data.twitter = {
                        access_token       : express.access_token,
                        access_token_secret: express.access_token_secret
                    }
                    
                    // Server
                    data.accesstoken        = express.access_token
                    data.accesstoken_secret = express.access_token_secret
                    
                    request.post( {
                        uri: serverAddress + '/user',
                        form: JSON.stringify( data ),
                        json: false
                    }, function( error, response, body ){
                        
                        body = JSON.parse( body )
                        
                        if( body.response.result ){
                            
                            delete data.accesstoken
                            delete data.accesstoken_secret
                            
                            output = 'exports.config = '
                            output += JSON.stringify( data )

                            fs.writeFile( fixPath( __dirname, 'config', 'user.js' ), output, function( error ){
                                if( error ) emitError( error )
                                else {
                                    emitResult( 'userCreated', true )
                                    userConfig = require( './config/user' ).config
                                    twitter    = require( './library/twitter' )
                                    client     = twitter.client
                                }
                            } )
                            
                        }
                        
                    } )
                    
                }
                
            }
            
        } )

    } )
    
} )

require( './library/electron' ).run( server.port )