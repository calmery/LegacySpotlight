var config = require( '../core/config' ).config,
    user   = require( '../core/user' ).config

var twitter = require( 'twitter' ),
    client  = new twitter( {
        consumer_key       : config.twitter.consumer_key,
        consumer_secret    : config.twitter.consumer_secret,
        access_token_key   : user.twitter.access_token,
        access_token_secret: user.twitter.access_token_secret
    } )

// It is used in the fn.search method.
var statements = {
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

var fn = {
    
    get: {
        
        user: {
            
            tweet: function( condition ){
                // Execute resolve function when search is successful.
                // Execute reject function when search is failed.
                return new Promise( function( resolve, reject ){
                    client.get( 'statuses/user_timeline', fn.private.createOption( condition ), function( error, tweet, response ){
                        if( error ) 
                            reject( error )
                        else 
                            resolve( tweet )
                    } )
                } )
            },
            
            profile: function( condition ){
                // Execute resolve function when search is successful.
                // Execute reject function when search is failed.
                return new Promise( function( resolve, reject ){
                    client.get( 'users/show', fn.private.createOption( condition ), function( error, profile, response ){
                        if( error ) 
                            reject( error )
                        else 
                            resolve( profile )
                    } )
                } )
            }
            
        },
        
        search: {
            
            search: function( query, count ){
                return new Promise( function( resolve, reject ){
                    client.get( 'search/tweets', {
                        q: query,
                        count: count ? count : config.twitter.defaultSearchResultCount
                    }, function( error, tweet, response ){
                        if( error ) 
                            reject( error )
                        else 
                            resolve( tweet )
                    } )
                } )
            },
            
            // Advanced search querys
            history: [],

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
            advanced : function( options, count ){
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
                this.history.push( query )
                console.log( 'Advanced search query : ' + query )
                // Execute resolve function when search is successful.
                // Execute reject function when search is failed.
                return new Promise( function( resolve, reject ){
                    client.get( 'search/tweets', {
                        q: query,
                        count: count ? count : config.twitter.defaultSearchResultCount
                    }, function( error, tweet, response ){
                        if( error ) 
                            reject( error )
                        else 
                            resolve( tweet )
                    } )
                } )
            }
            
        }
        
    },
    
    private: {
        createOption: function( condition ){
            var option = {}
            if( typeof( condition ) === 'number' )
                option.user_id = condition
            else
                option.screen_name = condition
            return option
        }
    }
    
}

exports.client = client
exports.fn = fn