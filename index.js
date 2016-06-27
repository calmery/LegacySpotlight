var electron = require( './library/electron' ),
    express  = require( './library/express' ),
    twitter  = require( './library/twitter' ).client,
    fs       = require( 'fs' ),
    config   = require( './config/config' ).config

//fs.writeFile( 'log.txt', __dirname )

var io = require( 'socket.io' )( express.http )

io.sockets.on( 'connection', function( socket ){
    
    var emitResult = function( type, data ){
        console.log( type )
        socket.emit( 'result', {
            type: type,
            value: data
        } )
    }
    
    socket.on( 'getMyProfile', function(){
        twitter.get( 'users/show', {
            user_id: config.user.twitter.id
        }, function(error, data, response){
            if( error ) emitResult( 'error', error )
            else emitResult( 'gotMyProfile', data )
        } )
    } )
    
    socket.on( 'getList', function(){
        fs.readdir( 'data/result', function(err, files){
            if (err) emitResult( 'error', err )
            var fileList = []
            files.filter(function(file){
                return file != '.DS_Store' && file.slice( file.length-9, file.length ) != '.raw.json'
            }).forEach(function (file) {
                fileList.push(file.slice(0, file.length-5))
            })
            emitResult( 'gotList', fileList )
        } )
    } )
    
    socket.on( 'getListData', function( data ){
        var error = ''
        var json, raw
        fs.readFile('data/result/' + data.value + '.json', 'utf8', function (err, text) {
            if( err ) error += err
            json = JSON.parse(unescape(text))
            fs.readFile('data/result/' + data.value + '.raw.json', 'utf8', function (err, text) {
                if( err ) error += err
                raw = JSON.parse(unescape(text))
                if(error) emitResult( 'error', error )
                else emitResult( 'gotListData', {
                    data: json,
                    raw : raw
                } )
            })
        })
    } )
    
    socket.on( 'search', function( data ){
        console.log( data.value )
        twitter.get( 'search/tweets', { 
            q: data.value,
            count: data.count ? data.count : 50
        }, function( error, tweets, response ){
            if( !error ) emitResult( 'searchResult', tweets )
            else emitResult( 'error', { value: error } )
        } )
    } )
    
    socket.on( 'postResult', function( data ){
        var error
        fs.writeFile('data/result/'+data.name+'.json', JSON.stringify(data.data), function (err) {
            if( err ) error = true
        })
        fs.writeFile('data/result/'+data.name+'.raw.json', JSON.stringify(data.raw), function (err) {
            if( err ) error = true
        })
        if( error ){
            emitResult( 'postedResult', {
                flg: false
            })
        }else{
            emitResult( 'postedResult', {
                flg: true,
                value: {
                    data: 'data/result/' + data.name + '.json',
                    raw : 'data/result/' + data.name + '.raw.json'
                }
            } )
        }
    } )  
    
} )