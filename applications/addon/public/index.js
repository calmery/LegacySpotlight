socket.on( 'confirm', ( options ) => {
    if( confirm( options.message + '\nOverwrite ?' ) === true ){
        socket.emit( 'installRequest', { url: options.url, overwrite: true, auto: options.auto } )
        addLog( options.message )
        addLog( 'Overwrite ? : Yes' )
        addLog( 'Retrying...' )
    } else {
        addLog( options.message )
        addLog( 'Overwrite ? : No' )
        addLog( 'Canceled' )
        addLog( 'Rejected : ' + options.message )
    }
} )

socket.on( 'complete', () => {
    setTimeout( () => {
        if( confirm( 'Application was installed. Reflesh ?' ) === true ) window.location.reload()
    }, 1500 )
} )

socket.on( 'log', message => addLog( message ) )

let log = document.getElementById( 'log' )

let log_field = document.getElementById( 'log_field' )
let install_field = document.getElementById( 'install_field' )
log_field.className = 'hide'

const addLog = ( message ) => log.innerHTML += message + '<br>'

let isInstall = false

const install = () => {
    let appPath = document.getElementById( 'url' ).value
    let autostartup = document.getElementById( 'autostart' ).checked
    if( appPath === '' ) return false
    install_field.className = 'fadeOut'
    setTimeout( () => {
        install_field.className = 'hide'
        log_field.className = 'show fadeIn'
    }, 1500 )
    addLog( 'Request : ' + appPath )
    socket.emit( 'installRequest', { url: appPath, auto: autostartup } )
}