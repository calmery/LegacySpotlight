bind.constant.NOW_INDEX = 0

socketio.on( 'postedResult', function( data ){
    alert( '保存しました．\n' + data.value.value.data + '\n' + data.value.value.raw )
} )

socketio.on( 'openedVote', function( value ){
    console.log( value )
    document.getElementById( 'voteClose' ).style.display = 'none'
    document.getElementById( 'voteBackground' ).style.display = 'block'
    document.getElementById( 'votetext' ).innerHTML = vote.text
    document.getElementById( 'ip' ).innerHTML = value.value.address
    alert( value.value.value )
} )

socketio.on( 'closedVote', function( value ){
    value = value.value
    console.log( value )
    document.getElementById( 'voteEnd' ).style.display = 'none'
    document.getElementById( 'voteResult' ).style.display = 'block'
    document.getElementById( 'votegood' ).innerHTML = value.good
    document.getElementById( 'votebad' ).innerHTML = value.bad
    alert( value.id + 'の公開を終了しました．' )
    document.getElementById( 'voteClose' ).style.display = 'block'
} )

var historys = []

var fstWrite     = false,
    dataObject   = [],
    resultObject = [],    // Shaping data
    loaded       = []     // Added tweets

function advancedOpen(){
    document.getElementById( 'advancedBackground' ).style.display = 'block'
}
function advancedClose(){
    document.getElementById( 'advancedBackground' ).style.display = 'none'
}

function advancedQuery(){

    document.getElementById( 'advancedBackground' ).style.display = 'none'

    var $ = function( e ){
        return document.getElementById( e )
    }

    var and      = $( 'and' ).value.split( /\s+/ ),
        or       = $( 'or' ).value.split( /\s+/ ),
        not      = $( 'not' ).value.split( /\s+/ ),
        from     = $( 'from' ).value,
        to       = $( 'to' ).value,
        think    = $( 'think' ).value

    if( and[0] == '' ) and = []
    if( or[0] == '' )  or  = []
    if( not[0] == '' ) not = []

    socketio.emit( 'advancedSearch', {
        and  : and,
        or   : or,
        not  : not,
        from : from,
        to   : to,
        think: think
    } )

}

function searchQuery(){

    var count = document.getElementById( 'searchCount' ).value,
        word  = document.getElementById( 'searchWord' ).value

    if( !word ){
        alert( '検索ワードが指定されていません' )
        return false
    }

    socketio.emit( 'searchQuery', {
        value: word,
        count: count
    } )

}

socketio.on( 'searchResult', function( data ){
    historys.push( data.value )

    var tweets = data.value

    alert( tweets.statuses.length + '件のツイートが見つかりました．' )

    var meta   = tweets.search_metadata,
        tweets = tweets.statuses
    var data = [], now, time

    console.log(tweets)
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
        if( bind.constant.COUNTER > 0 ) document.getElementById( 'tweet' ).innerHTML += '<div class="borderLine">' + meta.query + '</div>'
        if( !fstWrite ) bind.binding( 'tweet', data )
        else bind.binding( 'tweet', data, {
            rewrite: false
        } )
        bind.view( 'tweet' )
        fstWrite = true
    } else 
        alert( 'リストの最大数を超えてしまうため追加できません．一度保存し新しく検索を始めてください．' )
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
        }

} )

window.onload = function(){
    bind.hide( 'tweet' )

    // Confirm user action.
    var elems = document.getElementsByClassName( 'ml' )
    for( var i=0; i<elems.length; i++ )
        elems[i].addEventListener( 'click', function( e ){
            e.preventDefault()
            var flg = confirm( '保存していない情報は失われます．終了しますか？' )
            if( flg )
                window.location.href = this.parentNode.getAttribute( 'href')
        } )

    document.getElementById( 'voteClose' ).addEventListener( 'click', function( e ){
        document.getElementById( 'voteBackground' ).style.display = 'none'
    } )

    document.getElementById( 'voteEnd' ).addEventListener( 'click', function( e ){
        socketio.emit( 'closeVote', {
            value: true
        } )
    } )
}

var vote = {}

function openVote( id ){
    vote.id = id
    vote.text = document.getElementById( 'text' + id ).innerHTML
    socketio.emit( 'openVote', vote )
    document.getElementById( 'voteEnd' ).style.display = 'block'
    document.getElementById( 'voteResult' ).style.display = 'none'
    document.getElementById( 'votegood' ).innerHTML = 0
    document.getElementById( 'votebad' ).innerHTML = 0
}

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

function advancedSave(){
    var name = document.getElementById( 'advancedName' ).value.replace( /\n/g, '' )
    if( !name ){
        alert( '有効な名前ではありません．' )
        return
    }

    var $ = function( e ){
        return document.getElementById( e )
    }

    var and      = $( 'and' ).value.split( /\s+/ ),
        or       = $( 'or' ).value.split( /\s+/ ),
        not      = $( 'not' ).value.split( /\s+/ ),
        from     = $( 'from' ).value,
        to       = $( 'to' ).value,
        think    = $( 'think' ).value

    if( and[0] == '' ) and = []
    if( or[0] == '' )  or  = []
    if( not[0] == '' ) not = []

    socketio.emit( 'advancedSave', {
        advancedName: name,
        and  : and,
        or   : or,
        not  : not,
        from : from,
        to   : to,
        think: think
    } )

}

socketio.on( 'advancedSaved', function(){
    alert( '条件の保存が完了しました．' )
    advancedOpenSaved()
} )

function advancedOpenSaved(){
    socketio.emit( 'pullQuery', {
        value : true
    } )
}

var querys

socketio.on( 'returnQuery', function( data ){

    document.getElementById( 'querys' ).innerHTML = ''

    var query = data.value
    querys = query
    if( !query ){
        alert( '条件が保存されていません．' )
        return
    }
    document.getElementById( 'queryArea' ).style.display = 'block'
    for( var i in query )
        document.getElementById( 'querys' ).innerHTML += '<div class="clearfix" style="width:550px;margin: 0 auto;"><div class="deleteBtn" onclick="deleteQuery(\'' + i + '\')">消去</div><div class="queryBtn" onclick="openQuery(\'' + i + '\')">' + i + '</div></div>'
} )

function openQuery( key ){

    document.getElementById( 'advancedName' ).value = key

    alert( '高度な検索に' + key + 'の条件を読み込みました．')

    var $ = function( e ){
        return document.getElementById( e )
    }

    $( 'and' ).value = querys[key].and.join( ' ' )
    $( 'or' ).value = querys[key]['or'].join( ' ' )
    $( 'not' ).value = querys[key].not.join( ' ' )
    $( 'from' ).value = querys[key].from
    $( 'to' ).value = querys[key].to
    $( 'think' ).value = querys[key].think                

}

function deleteQuery( key ){
    socketio.emit( 'deleteQuery', {
        value: key
    } )
}

socketio.on( 'deletedQuery', function(){
    alert( '条件を消去しました．' )
    advancedOpenSaved()
} )
