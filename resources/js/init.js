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
            setTimeout( () => { loading.e.className = 'hide' }, 1000 )
        }
    }

    document.addEventListener( 'DOMContentLoaded', () => {
        loading.hide()
    }, false )
}