socketio.on( 'postedResult', function( data ){
    alert( '保存しました．\n' + data.value.value.data + '\n' + data.value.value.raw )
} )

var historys = []

var fstWrite     = false,
    dataObject   = [],
    resultObject = [],    // Shaping data
    loaded       = []     // Added tweets

function save(){
    var error = ''
    if( !fstWrite )
        error += '検索結果が存在しないため保存ができません．'
    if( !document.getElementById( 'dataName' ).value )
        error += '名前を付けづに保存はできません．'
    // Not search or haven't name
    if( error ){
        alert( '以下のエラーを確認してください．' + error )
        return false
    }
    var tweets = []
    for( var i=0; i<historys.length; i++ ){
        for( var j=0; j<historys[i].statuses.length; j++ )
            tweets.push( historys[i].statuses[j] )
    }
    var elem
    for( var i=0; i<tweets.length; i++ ){
        elem = document.getElementById( 'n' + tweets[i].id )
        tweets[i].flg = elem.getAttribute( 'flg' )
    }
    console.log( tweets )
    var meta = []
    for( var i=0; i<historys.length; i++ ){
        meta.push( historys[i].search_metadata )
    }
    socketio.emit( 'postResult', {
        name: document.getElementById('dataName').value,
        data: {
            search_metadata: meta,
            statuses: tweets
        },
        raw: historys
    } )
    return true
}

function parser( data ){
    
    var tweets = data
    var meta   = tweets.search_metadata,
        tweets = tweets.statuses
    var data = [], now, time
    
    for( var i=0; i<tweets.length; i++ ){
        now = tweets[i]
        time = now.created_at.split( /\s+/ )
        time.splice( 4, 1 ) // Wed Jun 22 18:53:22 +0000 2016
        // This tweet already loaded
        if( loaded.indexOf( now.id ) >= 0 )
            console.log( 'exist : ' + now.id )
        // New tweet
        else {
            loaded.push( now.id )
            // Shaping
            data.push( {
                retweet_count: now.retweet_count,
                created_at: time.join( ' ' ),
                id: now.id_str,
                in_reply_to_screen_name: now.in_reply_to_screen_name,
                in_reply_to_status_id: now.in_reply_to_status_id_str,
                in_reply_to_user_id: now.in_reply_to_user_id_str,
                text: now.text,
                id: now.id,
                flg: now.flg,
                user: {
                    name: now.user.name,
                    created_at: now.user.created_at,
                    description: now.user.description,
                    followers_count: now.user.followers_count,
                    friends_count: now.user.friends_count,
                    id: now.user.id_str,
                    lang: now.user.lang,
                    screen_name: now.user.screen_name,
                    statuses_count: now.user.statuses_count,
                    profile_image_url: now.user.profile_image_url
                }
            } )
        }
    }
    
    // Max element length is 150.
    if( bind.constant.COUNTER <= 150 ){
        if( !fstWrite ) bind.binding( 'tweet', data )
        else bind.binding( 'tweet', data, {
            rewrite: false
        } )
        bind.view( 'tweet' )
        fstWrite = true
    }

    var element = document.getElementsByClassName( 'elem' )
    for( var i=0; i<element.length; i++ ){
        element[i].addEventListener( 'click', function(){
            if( this.getAttribute( 'flg' ) == 'none' ){
                this.style.opacity = '0.5'
                this.style.borderLeft = '5px solid rgba(126,211,33,1)'
                this.setAttribute( 'flg', 'safe' )
            } else {
                this.style.opacity = '1'
                this.style.borderLeft = '5px solid rgba( 2, 159, 218, 1 )'
                this.setAttribute( 'flg', 'none' )
            }
        } )
        // Bind color
        element[i].click()
        element[i].click()
    }
}

window.onload = function(){
    bind.hide( 'tweet' )
    var data = JSON.parse( sessionStorage.getItem( 'editList' ) )
    
    document.getElementById('dataName').value = sessionStorage.getItem( 'editName' )
    sessionStorage.removeItem( 'editName' )
    var raw = []

    for( var i=0; i<data.search_metadata.length; i++ ){
        raw.push( {
            search_metadata: data.search_metadata[i],
            statuses: data.statuses.splice( 0, data.search_metadata[i].count )
        } )
    }

    for( var i=0; i<raw.length; i++ ){
        historys.push( raw[i] )
        parser( raw[i] )
    }
    
    socketio.emit( 'isPairing', {} )

    socketio.on( 'hidePairing', function( value ){
        if( !value.value )
            document.getElementById( 'pairingBtn' ).style.display = 'none' 
            console.log(value)
    } )

}