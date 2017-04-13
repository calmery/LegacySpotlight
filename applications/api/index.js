const twitter = require( 'twitter' )
const requestKey = require( './requestKey' )

const getClient = ( access_token_key, access_token_secret ) => {
    if( access_token_key === undefined || access_token_secret === undefined ) return false
    let client = new twitter( {
        consumer_key       : requestKey.consumer_key,
        consumer_secret    : requestKey.consumer_secret,
        access_token_key   : access_token_key,
        access_token_secret: access_token_secret
    } )
    return client
}
const makeOption = condition => {
    var option = {}
    if( typeof( condition ) === 'number' )
        option.user_id = condition
    else
        option.screen_name = condition
    return option
}

// Status
// Ready -> Available

// Ready
// isReady === true

// Available
// isAuthorized === true
// isAvailable === true

const appInstaller = require( 'yacona' ).appInstaller
const appRemover   = require( 'yacona' ).appRemover

module.exports = yacona => {
    
    const yaml = yacona.moduleLoader( 'yaml' )
    
    let userSetting
    let userProfile
    let client
    
    let isReady      = false
    let isAuthorized = false
    let isAvailable  = false
    
    let isReadyCallbackTargets = []
    let isAvailableCallbackTargets = []
    
    yacona.on( 'ready', callback => {
        if( isReady === true ) callback()
        else isReadyCallbackTargets.push( callback )
    } )
    yacona.on( 'available', callback => {
        if( isAvailable === true ) callback()
        else isAvailableCallbackTargets.push( callback )
    } )
    yacona.on( 'isAuthorized', () => isAuthorized )
    
    const emitIsReady = () => {
        isReady = true
        for( ;isReadyCallbackTargets.length; ) isReadyCallbackTargets.shift()()
    }
    const emitIsAvailable = () => {
        isAvailable = true
        for( ;isAvailableCallbackTargets.length; ) isAvailableCallbackTargets.shift()()
    }
    
    /* ----- Check ----- */
    
    if( yacona.config.check( 'twitter/authorization.yaml' ) === true ) isAuthorized = true
    

    const getProfile = id => {
        if( id === undefined ) return false
        return new Promise( ( resolve, reject ) => {
            client.get( 'users/show', makeOption( id ), ( error, profile, response ) => {
                if( error === null ) resolve( profile )
                else reject( error )
            } )
        } )
    }
    
    const load = () => {
        userSetting = yaml.parser( yacona.config.load( 'twitter/authorization.yaml' ) )
        client      = getClient( userSetting.access_token, userSetting.access_token_secret )
        isAvailable = true
        emitIsAvailable()
    }
    
    yacona.on( 'twitter/me', () => {
        return {
            id: userSetting.id,
            screen_name: userSetting.screen_name
        }
    } )
    
    yacona.on( 'twitter/key', () => requestKey )
    yacona.on( 'twitter/authorized', data => {
        data.id = Number( data.id )
        yacona.config.save( 'twitter/authorization.yaml', yaml.dump( data ) )
        load()
        return true
    } )
    
    yacona.on( 'twitter/profile', ( id, callback ) => {
        if( isAvailable === false ) return false
        if( typeof id === 'function' ){
            callback = id
            id = userSetting.id
            if( userProfile !== undefined ) callback( userProfile )
        }
        return getProfile( id ).then( profile => {
            userProfile = profile
            callback( userProfile )
        } )
    } )
    yacona.on( 'twitter/search', query => {
        return new Promise( function( resolve, reject ){
            client.get( 'search/tweets', {
                q: query.query,
                count: query.count
            }, function( error, tweet, response ){
                if( error === null ) resolve( tweet )
                else reject( error )
            } )
        } )
    } )
    
    
    yacona.on( 'addons', () => yacona.getInstalledAppList() )
    yacona.on( 'app/launch', ( appName ) => {
        let installed = yacona.getInstalledAppList()
        if( installed.indexOf( appName ) !== -1 ){
            return yacona.appLoader( appName )
        } else {
            return yacona.localAppLoader( '../' + appName ) 
        }
    } )
    yacona.on( 'app/install', ( options, callback ) => {
        if( options.overwrite === true ){
            console.log( options.url )
            appRemover( options.url.split( '/' ).pop().replace( RegExp( '.zip' ), '' ), ( status ) => {
                console.log( status )
                appInstaller( options.url, callback )
            } )
        } else {
            appInstaller( options.url, callback )
        }
    } )
    yacona.on( 'app/uninstall', ( appName, callback ) => {
        return appRemover( appName, callback )
    } )
    
    yacona.on( 'data/load', name => {
        let dumps = yacona.documents.list( 'log', name + '/dump' )
        let dump = []
        for( let i=0; i<dumps.length; i++ )
            if( dumps[i].match( /d\d+.json/ ) ) 
                dump.push( JSON.parse( yacona.documents.share.load( 'log', name + '/dump/' + dumps[i] ) ) )
        return {
            raw : dump,
            flag: JSON.parse( yacona.documents.share.load( 'log', name + '/flag.json' ) ),
            meta: JSON.parse( yacona.documents.share.load( 'log', name + '/meta.json' ) ),
            statuses: JSON.parse( yacona.documents.share.load( 'log', name + '/statuses.json' ) ),
        }
    } )
    
    yacona.on( 'data/remove', name => {
        if( yacona.documents.check( 'log', name ) === true ){
            yacona.documents.share.rmdir( 'log', name )
            return true
        }
        return false
    } )
    
    yacona.on( 'data/save', data => {
        
        let name     = data.name,
            raw      = data.raw,
            flag     = data.flag,
            meta     = data.meta,
            statuses = data.statuses
        
        if( name === undefined || raw === undefined || flag === undefined || meta === undefined || statuses === undefined )
            return false

        if( yacona.documents.check( 'log', name ) === true )
            yacona.documents.share.rmdir( 'log', name )

        for( let i=0; i<raw.length; i++ )
            yacona.documents.share.save( 'log', name + '/dump/d' + i + '.json', JSON.stringify( raw[i] ) )

        yacona.documents.share.save( 'log', name + '/flag.json', JSON.stringify( flag ) )
        yacona.documents.share.save( 'log', name + '/meta.json', JSON.stringify( meta ) )

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

        yacona.documents.share.save( 'log', name + '/statuses.json', JSON.stringify( s ) )
        
        return true
        
    } )
    
    emitIsReady()
    
    if( isAuthorized === true ) load()
    
}