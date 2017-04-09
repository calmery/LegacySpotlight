document.addEventListener( 'DOMContentLoaded', () => {
    loading.hide()
}, false )

const loading = {
    e: document.getElementById( 'loading' ),
    show: () => {
        loading.e.className = 'show fadeIn' 
    },
    hide: () => {
        loading.e.className = 'fadeOut'
        setTimeout( () => { loading.e.className = 'hide' }, 1000 )
    }
}

socket.emit( 'getMyProfile' )

socket.on( 'myProfile', ( profile ) => {
    document.getElementById( 'profile-icon' ).src = profile.icon
    document.getElementById( 'user_name' ).innerHTML = profile.name
    document.getElementById( 'screen_name' ).innerHTML = '@' + profile.screen_name
    document.getElementById( 'profile-area' ).className = 'fadeIn'
} )