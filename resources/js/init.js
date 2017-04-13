const socket = io()

socket.emit( 'connection', true )

let loading
if( document.getElementById( 'loading' ) !== null ){
    loading = {
        e: document.getElementById( 'loading' ),
        show: () => {
            loading.e.className = 'show fadeIn' 
        },
        hide: () => {
            loading.e.className = 'fadeOut'
            setTimeout( () => { loading.e.className = 'hide' }, 500 )
        }
    }

    document.addEventListener( 'DOMContentLoaded', () => {
        loading.hide()
    }, false )
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

let operationBlocker
if( document.getElementById( 'operationBlocker' ) !== null ){
    operationBlocker = {
        e: document.getElementById( 'operationBlocker' ),
        show: () => { operationBlocker.e.className = 'show fadeIn' },
        hide: () => {
            operationBlocker.e.className = 'fadeOut'
            setTimeout( () => operationBlocker.e.className = 'hide', 500 )
        }
    }
}

const fadeIn = e => {
    if( typeof e === 'string' ) e = document.getElementById( e )
    e.className = 'fadeIn show'
    e.style.display = 'block'
}

const fadeOut = e => {
    if( typeof e === 'string' ) e = document.getElementById( e )
    e.className = 'fadeOut'
    setTimeout( () => {
        e.className = 'hide'
        e.style.display = 'none'
    }, 500 )
}