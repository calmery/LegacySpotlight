var express = require( './library/express' ),
    server  = express.run()

var sharedsession = require( 'express-socket.io-session' ),
    io            = require( 'socket.io' )( server.http )

var request = require( 'request' ),
    fs      = require( 'fs' ),
    os      = require( 'os' )

io.use( sharedsession( server.session ) )

// Root user's session id.
var root 

/***** Global variables *****/

var config = require( './config/config' ).config

var serverAddress = 'http' + ( config.server.secure ? 's' : '' ) + '://' + config.server.uri
console.log( 'Server address : ' + serverAddress )

var fn      = require( './library/fn' ).fn,
    fixPath = fn.fixPath,
    isExist = fn.isExist

var userConfig
var twitter
var client
var clientFn

if( isExist( fixPath( __dirname, 'config', 'user.js' ) ) ){
    userConfig = require( './config/user' ).config
    twitter    = require( './library/twitter' )
    client     = twitter.client
    clientFn   = twitter.fn
}

var voteStatus = {},
    isVote     = false

io.sockets.on( 'connection', function( socket ){
    
    if( !root && express.root == socket.handshake.sessionID ){
        
        root = express.root
        console.log( 'Root user\'s session id of application is ' + root )
        
        console.log( '----- ----- ----- ----- -----' )
        
    }
    
    /***** Global Functions *****/

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
    
    if( root && root == socket.handshake.sessionID ){
        
        // Socket.io events.
        
        /***** Index *****/
        
        socket.on( 'getMyProfile', function( data ){
            console.log( 'Get my profile' )
            console.log( userConfig )
            
            clientFn.get.userProfile( Number( userConfig.id ) ).then( function( profile ){
                emitResult( 'gotMyProfile', profile )
            }, function( error ){
                emitError( error )
            } )
            
        } )
        
        /***** Search *****/
        
        socket.on( 'advancedSave', function( data ){
            var name = data.advancedName
            delete data.advancedName
            
            var history = fs.readFileSync( fixPath( __dirname, 'data',  'query.json' ), 'utf-8' )
            try {
                history = JSON.parse( history )
                history[name] = data
                
                fs.writeFileSync( fixPath( __dirname, 'data',  'query.json' ), JSON.stringify( history ) )
                
                emitResult( 'advancedSaved', true )
                
            } catch( e ){
                emitError( e )
            }
        } )
        
        socket.on( 'pullQuery', function(){
            var history = fs.readFileSync( fixPath( __dirname, 'data',  'query.json' ), 'utf-8' )
            try {
                history = JSON.parse( history )
                emitResult( 'returnQuery', history )
            } catch( e ){
                emitError( e )
            }
        } )
        
        socket.on( 'deleteQuery', function( data ){
            var name = data.value

            var history = fs.readFileSync( fixPath( __dirname, 'data',  'query.json' ), 'utf-8' )
            try {
                history = JSON.parse( history )
                delete history[name]

                fs.writeFileSync( fixPath( __dirname, 'data',  'query.json' ), JSON.stringify( history ) )

                emitResult( 'deletedQuery', true )

            } catch( e ){
                emitError( e )
            }
        } )
        
        socket.on( 'advancedSearch', function( data ){

            if( data.think == '-' ) delete data.think
            clientFn.search( data ).then( function( tweet ){
                emitResult( 'searchResult', tweet )
            }, function( error ){
                emitError( error )
            } )

        } )
        
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
        
        socket.on( 'openVote', function( vote ){
            console.log( 'aa' )
            if( !isVote ){
                console.log( 'bb' )
                voteStatus.good = 0
                voteStatus.bad  = 0
                voteStatus.text = vote.text
                voteStatus.id   = vote.id
                console.log( voteStatus )
                isVote = true
                emitResult( 'openedVote', { 
                    value: vote.id + 'を公開しました．',
                    address: fn.getLocalAddress()['ipv4'][0]['address'] + ':' + server.port + '/vote' 
                } )
            } else
                emitError( '既に公開しているツイートがあります．' )
        } )
        
        socket.on( 'closeVote', function(){
            isVote = false
            var good = voteStatus.good,
                bad  = voteStatus.bad,
                id   = voteStatus.id
            voteStatus = {}
            emitResult( 'closedVote', {
                good: good,
                bad: bad,
                id : id
            } )
        } )
        
        /***** List *****/
        
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
        
        socket.on( 'getUserProfile', function( condition ){
            console.log( 'Request @' + condition.value + '\'s profile' )
            clientFn.get.userProfile( condition.value ).then( function( profile ){
                emitResult( 'gotUserProfile', profile )
            }, function( error ){
                emitError( error )
            } )
        } )
        
        socket.on( 'getListData', function( data ){
            emitResult( 'gotListData', fs.readFileSync( fixPath( __dirname, 'data', 'result', data.value + '.json' ), 'utf-8' ) )
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
                }, function( error, response, body ){
                    
                    console.log( body )
                    
                    if( error )
                        emitError( 'サーバとの接続に失敗しました．接続状態，また設定を確認してください．' )
                    else {

                        console.log( 'Uploaded' )

                        if( body )
                            emitError( JSON.parse( body ).error )
                        else {
                            console.log( 'Complate Share' )
                            emitResult( 'complateShare', true )
                        }

                    }
                } )

            } )

        } )
        
        /***** Setting *****/

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
        
        /***** Sign up *****/
        
        socket.on( 'createUser', function( data ){
            
            console.log( 'Sign up process' )

            var output

            if( !data.name || !data.organization ){
                emitError( '未入力の項目が存在します' )
                return false
            }

            data.name         = data.name.replace(/[\s+|\']+|/g, '')
            data.organization = data.organization.replace( /\'/g, "\'" )

            request.get( {
                uri: serverAddress + '/user?name=' + data.name
            }, function( error, response, body ){

                if( error )
                    emitError( 'サーバに接続できませんでした．接続状態を確認してください．' )
                else {
                    
                    console.log( 'Exist user : ' + body )

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
                            
                            console.log( 'Sign up : ' + body )

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
                                        clientFn   = twitter.fn
                                        console.log( 'Welcome to Spotlight-Beta !' )
                                    }
                                } )

                            }

                        } )

                    }

                }

            } )

        } )

        
        
    }
    
    socket.on( 'pullVote', function(){
        emitResult( 'voteData', voteStatus )
    } )
    
    socket.on( 'vote', function( opinion ){
        if( opinion.value == 1 )
            voteStatus.good += 1
        else
            voteStatus.bad += 1
        console.log( voteStatus )
    } )
    
} )

require( './library/electron' ).run( server.port )