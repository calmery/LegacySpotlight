function search(){
    let word = document.getElementById( 'word' ).value
    if( word === '' ) return false
    
    document.getElementById( 'operationBlocker' ).className = 'fadeIn show'
    socket.emit( 'search', word )
}

let raw = []
let meta = []
let statuses = []
let flag = []

let archive = document.getElementById( 'archive' )
let count = -1

socket.on( 'result', ( result ) => {
    raw.push( result )
    document.getElementById( 'result' ).style.display = 'block'

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
        count++
        flag.push( 'danger' )
        statuses.push( result.statuses[i] )
        archive.innerHTML = '<div class="content clearfix" id="n' + count + '" onclick="change( ' + count + ', ' + result.statuses[i].id + ' )" flag="danger"><div class="left float_l"><img src="' + result.statuses[i].user.profile_image_url + '"></div><div class="right float_r"><div class="name">' + result.statuses[i].user.name + '</div><div class="screen_name">@' + result.statuses[i].user.screen_name+'</div><div class="text">' + result.statuses[i].text + '</div></div></div>' + archive.innerHTML
    }
    archive.innerHTML = '<div class="title">' + decodeURIComponent( result.search_metadata.query ).replace( /\+/g, ' ' ) + '</div>' + archive.innerHTML
    document.getElementById( 'operationBlocker' ).className = 'fadeOut'
    setTimeout( () => document.getElementById( 'operationBlocker' ).className = 'hide', 1000 )
} )

function saveToggle(){
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

function change( num, id ){
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

socket.on( 'saved', () => alert( 'Saved' ) )
socket.on( 'reject', () => alert( 'Already exist' ) )

function save(){
    
    let name = document.getElementById( 'list_name' ).value
    if( name === '' || name.indexOf( '/' ) !== -1 ) return false
    
    socket.emit( 'save', {
        name: name,
        raw: raw,
        flag: flag,
        meta: meta,
        statuses: statuses
    } )
    
}

if( document.getElementById( 'profile' ) !== null ){
    socket.emit( 'getMyProfile' )
    socket.on( 'myProfile', profile => {
        document.getElementById( 'profile-icon' ).src = profile.icon
        document.getElementById( 'user_name' ).innerHTML = profile.name
        document.getElementById( 'screen_name' ).innerHTML = '@' + profile.screen_name
        document.getElementById( 'profile-area' ).className = 'fadeIn'
    } )
}