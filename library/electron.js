var electron = require( 'electron' ),
    app      = electron.app,
    window   = electron.BrowserWindow,
    main

var config = require( '../config/config' ).config

/* ----- Application events ----- */

app.on( 'ready', function(){
    
    var option       = config.electron.app,
        maxListeners = config.electron.maxListeners,
        port         = config.express.port
    
    main = new window( option )
    
    main.setResizable( false )
    main.setMaxListeners( maxListeners )
    
    main.loadURL( 'http://127.0.0.1:' + 3000 )
    
    // development option.
    // main.webContents.openDevTools()
    
    main.on( 'closed', function(){
        main = null
    } )
    
    /* ----- App events ----- */
    
    app.on( 'window-all-closed', function(){
        if( process.platform != 'darwin' )
            app.quit()
    } )
    
    // Ready
    main.show()
    
} )

/* ----- Exports ----- */

exports.app  = app
exports.main = main