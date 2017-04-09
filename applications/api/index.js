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
    
    yacona.on( 'app/launch', ( appName ) => {
        yacona.localAppLoader( '../' + appName )
    } )
    
    emitIsReady()
    
    if( isAuthorized === true ) load()
    
}