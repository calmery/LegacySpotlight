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

module.exports = yacona => {
    
    const yaml = yacona.moduleLoader( 'yaml' )
    
    let client
    let user
    let userProfile
    const load = () => {
        if( yacona.config.check( 'twitter/authorization.yaml' ) === true ){
            user = yaml.parser( yacona.config.load( 'twitter/authorization.yaml' ) )
            client = getClient( user.access_token, user.access_token_secret )
            getProfile( user.id ).then( ( profile ) => myProfile = profile )
        }
    }
    
    yacona.on( 'requestKey', () => requestKey )
    yacona.on( 'config/save/oauth', data => {
        data.id = Number( data.id )
        yacona.config.save( 'twitter/authorization.yaml', yaml.dump( data ) )
        load()
    } )
    yacona.on( 'config/load/oauth', () => user )
    
    /* ----- Twitter Api ----- */
    
    const makeOption = function( condition ){
        var option = {}
        if( typeof( condition ) === 'number' )
            option.user_id = condition
        else
            option.screen_name = condition
        return option
    }
    
    const getProfile = ( id ) => {
        if( id === undefined ) id = Number( user.id )
        return new Promise( ( resolve, reject ) => {
            client.get( 'users/show', makeOption( id ), ( error, profile, response ) => {
                if( error === null ) resolve( profile )
                else reject( error )
            } )
        } )
    }
    
    yacona.on( 'getProfile', ( id ) => getProfile( id ) )
    
    let myProfile
    yacona.on( 'setMyProfile', ( profile ) => myProfile = profile )
    yacona.on( 'getMyProfile', () => myProfile )
    
    /* ----- Ready ----- */
    
    load()
    
} 