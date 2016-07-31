var config = require( '../config/config' ).config,
    user   = require( '../config/user' ).config

var twitter = require( 'twitter' ),
    client = new twitter( {
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

        /* ----- User ----- */

        // Condition argument representing user_id or screen_name.
        userTweets: function( condition ){
            var option = {}
            if( typeof( condition ) === 'number' )
                option.user_id = condition
                else
                    option.screen_name = condition
                // Execute resolve function when search is successful.
                // Execute reject function when search is failed.
                return new Promise( function( resolve, reject ){
                    client.get( 'statuses/user_timeline', option, function( error, tweets, response ){
                        if( error ) reject( error )
                        else resolve( tweets )
                    } )
                } )
        },

        userProfile: function( condition ){
            var option = {}
            if( typeof( condition ) === 'number' )
                option.user_id = condition
            else
                option.screen_name = condition
            // Execute resolve function when search is successful.
            // Execute reject function when search is failed.
            return new Promise( function( resolve, reject ){
                client.get( 'users/show', option, function( error, profile, response ){
                    if( error ) reject( error )
                    else resolve( profile )
                } )
            } )
        }

    },

    /* ----- Search methods ----- */

    // Search querys
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
    search : function( options ){
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
        // Execute resolve function when search is successful.
        // Execute reject function when search is failed.
        return new Promise( function( resolve, reject ){
            client.get( 'search/tweets', {
                q: query,
                count: options.count ? options.count : 10
            }, function( error, tweets, response ){
                if( error ) reject( error )
                else resolve( tweets )
             } )
        } )
        return true
    }

}

exports.client = client
exports.fn     = fn