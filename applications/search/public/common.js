socket.on( 'saved', () => {
    alert( 'Saved' )
    operationBlocker.hide()
} )

socket.on( 'reject', () => {
    alert( 'Already in use' )
    operationBlocker.hide()
} )

const save = () => {

    let name = document.getElementById( 'list_name' ).value
    if( name === '' || name.indexOf( '/' ) !== -1 ) return false

    operationBlocker.show()
    socket.emit( 'save', {
        name: name,
        raw: raw,
        flag: flag,
        meta: meta,
        statuses: statuses
    } )

}

const saveToggle = () => {
    let e = document.getElementById( 'save_field' )
    let s = document.getElementById( 'search_field' )
    let m = document.getElementById( 'toggle' )
    let a = document.getElementById( 's' )
    if( e.style.display === 'block' ){
        m.className = 'menu'
        a.className = 'isRunning'
        e.style.display = 'none'
        s.style.display = 'block'
    } else if( e.style.display === 'none' ){
        m.className = 'menu selected'
        a.className = 'isRunning active'
        e.style.display = 'block'
        s.style.display = 'none'
    }
}

const imageShow = id => {
   fadeIn( document.getElementById( 'img' + id ) )
   document.getElementById( 'img' + id + 'Show' ).style.display = 'none'
   document.getElementById( 'img' + id + 'Hide' ).style.display = 'block'
   document.getElementById( 'n' + id ).click()
}

const imageHide = id => {
    fadeOut( document.getElementById( 'img' + id ) )
    document.getElementById( 'img' + id + 'Show' ).style.display = 'block'
    document.getElementById( 'img' + id + 'Hide' ).style.display = 'none'
    document.getElementById( 'n' + id ).click()
}

const change = ( num, id ) => {
    let e = document.getElementById( 'n' + num )
    let f = e.getAttribute( 'flag' )
    if( f === 'clean' ){
        flag[num] = 'danger'
        e.style.borderColor = 'rgba( 2, 159, 218, 1 )'
        e.setAttribute( 'flag', 'danger' )
    } else if( f === 'danger' ){
        flag[num] = 'clean'
        e.style.borderColor = 'rgba( 126, 211, 33, 1 )'
        e.setAttribute( 'flag', 'clean' )
    }
}

let raw      = [],
    meta     = [],
    statuses = [],
    flag     = []

let archive = document.getElementById( 'archive' )
let count = -1

let urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/g
let hashTagPattern = /[#＃][Ａ-Ｚａ-ｚA-Za-z一-鿆0-9０-９ぁ-ヶｦ-ﾟー]+/g

socket.on( 'result', result => {
    raw.push( result )

    let isOverlap
    meta.push( result.search_metadata )

    for( let i=0; i<result.statuses.length; i++ ){
        isOverlap = false
        for( let j=0; j<statuses.length; j++ ){
            if( result.statuses[i].id === statuses[j].id ){
                isOverlap = true
                meta[meta.length-1].count--
            }
        }

        if( isOverlap ) continue
        
        let image = ''
        if( result.statuses[i].entities.media ){
            result.statuses[i].entities.media.forEach( media => {
                console.log( media.type )
                if( media.type === 'photo' )
                    image += '<img src="' + media.media_url + '" class="media_image" width="100%"><br>'
                else if( media.type === 'video' )
                    image += '<video src="' + media.media_url + '" width="100%"><br>'
            } )
        }

        count++
        flag.push( 'danger' )
        statuses.push( result.statuses[i] )
        
        let text = result.statuses[i].text
        let urls = text.match( urlPattern )
        let hashTags = text.match( hashTagPattern )
        let users = text.match( /@\w+/g )
        
        if( urls !== null ){
            urls.forEach( url => {
                text = text.replace( url, '<span class="tweet_url">' + url + '</span>' )
            } )
        }
        
        if( users !== null ){
            users.forEach( user => {
                text = text.replace( user, '<span class="tweet_mention">' + user + '</span>' )
            } )
        }
        
        if( hashTags !== null ){
            hashTags.forEach( hashTag => {
                text = text.replace( hashTag, '<span class="tweet_hashTag">' + hashTag + '</span>' )
            } )
        }

        archive.innerHTML = '<div class="content clearfix" id="n' + count + '" onclick="change( ' + count + ', ' + result.statuses[i].id + ' )" flag="danger">' +
            '<div class="left float_l">' +
            '<img src="' + result.statuses[i].user.profile_image_url + '">' + 
            '</div>' + 
            '<div class="right float_r">' + 
            '<div class="name">' + result.statuses[i].user.name + '</div>' +
            '<div class="screen_name">@' + result.statuses[i].user.screen_name+'</div>' + 
            '<div class="text">' + text + '</div>' + 
            ( image !== '' ? ( 
                '<br>' + 
                '<a href="javascript: void( 0 )" id="img' + count + 'Show" onclick="imageShow( \'' + count + '\' )">画像を表示</a>' +
                '<a href="javascript: void( 0 )" style="display: none" id="img' + count + 'Hide" onclick="imageHide( \'' + count + '\' )">画像を非表示</a>' +
                '<div style="display: none;" id="img' + count + '"><br>' + image + '</div>' 
            ) : '' ) +
            '</div>' + 
            '</div>' + archive.innerHTML
    }

    archive.innerHTML = '<div class="title">' + decodeURIComponent( result.search_metadata.query ).replace( /\+/g, ' ' ) + '</div>' + archive.innerHTML
    document.getElementById( 'result' ).style.display = 'block'
    operationBlocker.hide()
} )