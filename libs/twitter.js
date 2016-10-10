const Twitter = require( 'twitter' )
const Config  = require( '../core/config' ).config

const client = new require( 'twitter' )( {
    consumer_key       : Config.twitter.consumer_key,
    consumer_secret    : Config.twitter.consumer_secret,
    access_token_key   : Config.twitter.access_token_key,
    access_token_secret: Config.twitter.access_token_secret
} )

// makeOption :: a -> Object
const makeOption = function( condition ){
    var option = {}
    if( typeof( condition ) === 'number' )
        option.user_id = condition
    else
        option.screen_name = condition
    return option
}

// It is used in the method.
const statements = {
    or      : 'OR',
    and     : 'AND',
    space   : ' ',
    not     : '-',
    from    : 'from:',
    to      : 'to:',
    near    : 'near:',
    since   : 'since:',
    until   : 'until:',
    within  : 'within:',
    question: '?',
    links   : 'filter:links',
    think   : {
        positive: ':)',
        negative: ':('
    }
}

// Execute resolve function when search is successful.
// Execute reject function when search is failed.
const api = {
    
    // getUserTweet :: a -> Promise
    getUserTweet: function( condition ){
        return new Promise( function( resolve, reject ){
            client.get( 'statuses/user_timeline', makeOption( condition ), function( error, tweet, response ){
                if( error === null ) resolve( tweet )
                else reject( error )
            } )
        } )
    },
    
    // getUserProfile :: a -> Promise
    getUserProfile: function( condition ){
        return new Promise( function( resolve, reject ){
            client.get( 'users/show', makeOption( condition ), function( error, profile, response ){
                if( error === null ) resolve( profile )
                else reject( error )
            } )
        } )
    },
    
    // getUserProfile :: String -> Int -> Promise
    search: function( query, count ){
        return new Promise( function( resolve, reject ){
            client.get( 'search/tweets', {
                q: query,
                count: count
            }, function( error, tweet, response ){
                if( error === null ) resolve( tweet )
                else reject( error )
            } )
        } )
    },
    
    // Option parameters
    // and      Array  : All of these words.
    // or       Array  : Any of these words.
    // not      Array  : None of these words.
    // from     String : From these account.
    // to       String : To these account.
    // until    String : From this date.
    // since    String : To this date.
    // think    String : Tweet condition. ( positive or negative )
    // question Bool   : Question.
    // links    Bool   : Include links. ( Image and Url )
    searchAdvanced : function( options, count ){
        if( !options ) return false
        
        var query = ''
        for( var option in options )
            switch( option ){
                case 'and'     :
                case 'or'      :
                    for( var i=0; i<options[option].length; i++ )
                        query += options[option][i] + ( i<options[option].length-1 ? ' ' + statements[option] : '' ) + ' '
                    break
                case 'not'     :
                    for( var i=0; i<options.not.length; i++ )
                        query += '-' + options.not[i] + ' '
                    break
                case 'from'    :
                case 'to'      :
                case 'since'   :
                case 'until'   :
                    if( options[option] )
                        query += statements[option] + options[option] + ' '
                    break
                case 'think'   :
                    if( options[option] === 'positive' || options[option] === 'negative' )
                        query += statements.think[options[option]] + ' '
                    break
                case 'question':
                case 'links'   :
                    query += statements[option] + ' '
            }
        
        console.log( 'Advanced : ' + query )
        
        // Execute resolve function when search is successful.
        // Execute reject function when search is failed.
        return new Promise( function( resolve, reject ){
            client.get( 'search/tweets', {
                q: query,
                count: count ? count : Config.twitter.defaultResultCount
            }, function( error, tweet, response ){
                if( error === null ) resolve( tweet )
                else reject( error )
            } )
        } )
    }
    
}

module.exports = api