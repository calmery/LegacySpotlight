const fs = require( 'fs' ),
      os = require( 'os' )

const request       = require( 'request' ),
      sharedsession = require( 'express-socket.io-session' ),
      JsYaml        = require( 'js-yaml' )

var Express  = require( './libs/express' )

const Electron = require( './libs/electron' ),
      Util     = require( './libs/utility' ),
      Pairing  = require( './libs/pairing' )

var Twitter

if( Util.isExist( Util.fixPath( __dirname, 'core', 'config', 'user.yaml' ) ) )
    Twitter  = require( './libs/twitter' )

const _Config  = require( './core/config' )
const Config   = _Config.config

/* ***** ***** ***** */

// Execute express
const runtime = Express.run()

const io = require( 'socket.io' )( runtime.http )
io.use( sharedsession( runtime.session ) )

// Root user's session id
var root

var pairingDevices = {
    allowed: [],
    denied : [],
    during: [],
    duringObject: {},
    code: {}
}

var voteStatus = {},
    isVote     = false

var userConfig = Config.user ? Config.user : undefined

const serverAddress = 'http' + ( Config.server.secure ? 's' : '' ) + '://' + Config.server.uri + ':' + Config.server.port
console.log( 'Server address : ' + serverAddress )



io.sockets.on( 'connection', function( socket ){
    
    function emitResult( type, data, id ){
        io.sockets.to( id ? id : socket.id ).emit( type, {
            value: data
        } )
    }

    function emitError( data ){
        socket.emit( 'processError', {
            value: data
        } )
    }
    
    if( !root && Express.root === socket.handshake.sessionID ){

        root = Express.root
        console.log( 'Root user\'s session id of application is ' + root + '\n----- ----- ----- ----- -----' )

    }
    
    if( root === socket.handshake.sessionID || pairingDevices.allowed.indexOf( socket.handshake.sessionID ) != -1 ){
    
        // Check user name and user organization
        socket.on( 'init', function(){
            emitResult( 'onInit', _Config.update().user )
        } )
        
        socket.on( 'isPairing', function(){
            emitResult( 'hidePairing', Config.default.pairing )
        } )
        
        // getMyProfile => returnMyProfile
        socket.on( 'getMyProfile', function( data ){
            console.log( userConfig )
            Twitter.getUserProfile( Number( userConfig.id ) ).then( function( profile ){
                emitResult( 'returnMyProfile', profile )
            }, function( error ){
                emitError( error )
            } )
        } )
        
        // dataReset => complateDataReset
        socket.on( 'dataReset', function( data ){
            fs.readdir( __dirname + '/data/result/', function( err, files ){
                for( var i=0; i<files.length; i++ )
                    fs.unlink( __dirname + '/data/result/' + files[i], function( err ){
                        if( err ) emitError( err )
                    } )
                emitResult( 'complateDataReset', {
                    value: true
                } )
            } )
        } )
        
        /***** Search *****/

        socket.on( 'advancedSave', function( data ){
            var name = data.advancedName
            delete data.advancedName

            var history = fs.readFileSync( Util.fixPath( __dirname, 'data',  'querys.json' ), 'utf-8' )
            try {
                history = JSON.parse( history )
                history[name] = data
                
                console.log( Util.fixPath( __dirname, 'data',  'querys.json' ) )

                fs.writeFileSync( Util.fixPath( __dirname, 'data',  'querys.json' ), JSON.stringify( history ) )

                emitResult( 'advancedSaved', true )
            } catch( e ){
                emitError( e )
            }
        } )

        socket.on( 'pullQuery', function(){
            var history = fs.readFileSync( Util.fixPath( __dirname, 'data',  'querys.json' ), 'utf-8' )
            try {
                history = JSON.parse( history )
                emitResult( 'returnQuery', history )
            } catch( e ){
                emitError( e )
            }
        } )

        socket.on( 'deleteQuery', function( data ){
            var name = data.value

            var history = fs.readFileSync( Util.fixPath( __dirname, 'data',  'querys.json' ), 'utf-8' )
            try {
                history = JSON.parse( history )
                delete history[name]

                fs.writeFileSync( Util.fixPath( __dirname, 'data',  'querys.json' ), JSON.stringify( history ) )

                emitResult( 'deletedQuery', true )
            } catch( e ){
                emitError( e )
            }
        } )

        socket.on( 'advancedSearch', function( data ){
            if( data.think == '-' ) delete data.think
            Twitter.searchAdvanced( data ).then( function( tweets ){
                emitResult( 'searchResult', tweets )
            }, function( error ){
                emitError( error )
            } )
        } )

        socket.on( 'searchQuery', function( data ){
            Twitter.search( data.value, data.count ? data.count : Config.twitter.defaultSearchResultCount ).then( function( tweets ){
                emitResult( 'searchResult', tweets )
            }, function( error ){
                emitError( error ) 
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
            if( !isVote ){
                voteStatus.good = 0
                voteStatus.bad  = 0
                voteStatus.text = vote.text
                voteStatus.id   = vote.id
                console.log( voteStatus )
                isVote = true
                emitResult( 'openedVote', { 
                    value: vote.id + 'を公開しました．',
                    address: Util.getLocalAddressIpv4() + ':' + runtime.port + '/vote' 
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

        socket.on( 'getListData', function( data ){
            emitResult( 'gotListData', fs.readFileSync( Util.fixPath( __dirname, 'data', 'result', data.value + '.json' ), 'utf-8' ) )
        } )

        socket.on( 'share', function( name ){

            var result = JSON.parse( fs.readFileSync( Util.fixPath( __dirname, 'data', 'result', name + '.json' ), 'utf-8' ) )

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
console.log( body )
                        
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

            if( data.name !== 'guest' && data.organization !== 'guest' ){

                request.get( {
                    uri: serverAddress + '/user?name=' + data.name
                }, function( error, response, body ){

                    if( error )
                        emitError( 'サーバに接続できませんでした．接続状態を確認してください．' )
                    else {
                        
                        body = JSON.parse( body )

                        if( body.response.exist ){
                            console.log( 'Exist : ' + data.name )
                            emitError( '既にユーザが存在しています．別の名前をお使いください．' )
                        } else {

                            data.id                 = Express.profile.id
                            data.screen_name        = Express.profile.username
                            data.twitter = {
                                access_token       : Express.access_token,
                                access_token_secret: Express.access_token_secret
                            }

                            // Server
                            data.accesstoken        = Express.access_token
                            data.accesstoken_secret = Express.access_token_secret

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
                                    fs.writeFile( Util.fixPath( __dirname, 'core', 'config', 'user.yaml' ), JsYaml.safeDump( data ), function( error ){
                                        if( error ) emitError( error )
                                        else {
                                            emitResult( 'userCreated', true )
                                            userConfig = _Config.update().user
                                            Twitter  = require( './libs/twitter' )
                                            console.log( 'Welcome to Spotlight-Beta !' )
                                        }
                                    } )
                                }
                            } )
                        }
                        
                    }

                } )

            } else {

                data.name = 'guest'
                data.organization = 'guest'
                data.id                 = Express.profile.id
                data.screen_name        = Express.profile.username
                data.twitter = {
                    access_token       : Express.access_token,
                    access_token_secret: Express.access_token_secret
                }

                fs.writeFile( Util.fixPath( __dirname, 'core', 'config', 'user.yaml' ), JsYaml.safeDump( data ), function( error ){
                    if( error ) emitError( error )
                    else {
                        emitResult( 'userCreated', true )
                        userConfig = _Config.update().user
                        Twitter  = require( './libs/twitter' )
                        console.log( 'Welcome to Spotlight-Beta !' )
                    }
                } )
            }

        } )
        
        socket.on( 'recreateUser', function( data ){

            console.log( 'Re-Sign up process' )

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
                    
                    body = JSON.parse( body )

                    if( body.response.exist ){
                        emitError( '既にユーザが存在しています．別の名前をお使いください．' )
                        console.log( 'Exist : ' + body )
                    } else {

                        data.id                 = userConfig.id
                        data.screen_name        = userConfig.screen_name
                        data.twitter = {
                            access_token       : userConfig.twitter.access_token,
                            access_token_secret: userConfig.twitter.access_token_secret
                        }

                        // Server
                        data.accesstoken        = data.twitter.access_token
                        data.accesstoken_secret = data.twitter.access_token_secret

                        console.log( data )

                        request.post( {
                            uri: serverAddress + '/user',
                            form: JSON.stringify( data ),                                json: false
                        }, function( error, response, body ){

                            console.log( 'Sign up : ' + body )
                            body = JSON.parse( body )

                            if( body.response.result ){
                                delete data.accesstoken
                                delete data.accesstoken_secret

                                fs.writeFile( Util.fixPath( __dirname, 'core', 'config', 'user.yaml' ), JsYaml.safeDump( data ), function( error ){
                                    if( error ) emitError( error )
                                    else {
                                        emitResult( 'userCreated', true )
                                        userConfig = _Config.update().user
                                        console.log( 'Welcome to Spotlight-Beta !' )
                                    }
                                } )

                            }

                        } )

                    }

                }

            } )


        } )
        
        /* Pairing */
        
        socket.on( 'getPairingRequestList', function(){
            console.log( 'Send pairing request.' )
            emitResult( 'pairingRequestList', pairingDevices )
        } )

        socket.on( 'permitPairing', function( device ){
            if( pairingDevices.during.indexOf( device.device ) !== -1 ){
                console.log( 'Permit pairing device : ' + device.device )
                pairingDevices.code[device.device] = pairingDevices.duringObject[device.device].getPairingCode()
                emitResult( 'pairingCode', pairingDevices.code[device.device] )
                approvePairing( pairingDevices.duringObject[device.device].getId() )
            } else {
                console.log( 'Device not found (' + device.device + ')' )
                emitError( 'Pairing Code not found' )
            }
        } )

        socket.on( 'removePairing', function( device ){
            var index = pairingDevices.allowed.indexOf( device.device )
            if( index != -1 )
                pairingDevices.allowed.splice( index, 1 )
            var index2 = Express.semiRootUsers.indexOf( device.device )
            if( index2 != -1 )
                Express.semiRootUsers.splice( index2, 1 )
            emitResult( 'updateDevicePage', {} )
        } )  

    
    }
    
    // Non root access
    
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
    
    function approvePairing( id ){
        emitResult( 'inputYourPairingCode', {}, id )
    }

    socket.on( 'inputMyPairingCode', function( code ){
        if( pairingDevices.during.indexOf( socket.handshake.sessionID ) !== -1 && pairingDevices.duringObject[socket.handshake.sessionID].comparePairingCode( Number( code.code ) ) ){
            console.log( 'Welcome ! New device is ' + pairingDevices.duringObject[socket.handshake.sessionID].getName() )
            pairingDevices.allowed.push( socket.handshake.sessionID )
            pairingDevices.during.splice( pairingDevices.during.indexOf( socket.handshake.sessionID ), 1 )
            delete pairingDevices.duringObject[socket.handshake.sessionID]
            delete pairingDevices.code[socket.handshake.sessionID]
            console.log( pairingDevices )
            Express.semiRootUsers.push( socket.handshake.sessionID )
        }
    } )

    socket.on( 'pairingRequest', function( data ){
        console.log( 'New pairing request from "' + data.name + ' (' + socket.handshake.sessionID + ')"'  )
        pairingDevices.during.push( socket.handshake.sessionID )
        pairingDevices.duringObject[socket.handshake.sessionID] = new Pairing( data.name, socket.handshake.sessionID, socket.id )
        console.log( pairingDevices )
    } )
    
} )



// Execute electron
Electron.run( runtime.port )

/* ***** ***** ***** */