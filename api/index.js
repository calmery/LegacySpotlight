const twitter = require( 'twitter' )

module.exports = yacona => {
    
    const yaml = yacona.moduleLoader( 'yaml' )
    
    let key   = require( './config' )
    let token = yaml.parser( yacona.config.load( 'oauth', 'twitter/authorization.yaml' ) )
    
    let client = new twitter( {
        consumer_key       : key.consumer_key,
        consumer_secret    : key.consumer_secret,
        access_token_key   : token.access_token,
        access_token_secret: token.access_token_secret
    } )
    
    const myId = Number( token.id )
    
    const makeOption = function( condition ){
        var option = {}
        if( typeof( condition ) === 'number' )
            option.user_id = condition
        else
            option.screen_name = condition
        return option
    }
    
    yacona.on( 'getProfile', id => {
        if( id === undefined ) id = myId
        return new Promise( ( resolve, reject ) => {
            client.get( 'users/show', makeOption( id ), ( error, profile, response ) => {
                if( error === null ) resolve( profile )
                else reject( error )
            } )
        } )
    } )
    
}