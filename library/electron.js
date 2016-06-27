var config   = require( '../config/config' ).config,
    electron = require( 'electron' ),
    app      = electron.app,
    window   = electron.BrowserWindow

var main

app.on( 'ready', function(){
    
    // jQuery
    config.electron.app['node-integration'] = false
    
    main = new window( config.electron.app )
    
    main.setResizable( false )
    main.setMaxListeners( config.electron.maxListeners )
    main.loadURL( 'http://localhost:' + config.express.port )
    
    // development option
    main.webContents.openDevTools()
    
    // events
    main.on( 'closed', function(){
        main = null
    } )
    
    main.show()
    
} )

exports.app  = app
exports.main = main