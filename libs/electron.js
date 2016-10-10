const Electron = require( 'electron' )
const Config   = require( '../core/config' ).config

const run = function( port ){

    var app      = Electron.app,
        window   = Electron.BrowserWindow,
        main

    /***** Application events *****/

    app.on( 'ready', function(){

        const option       = Config.electron.app,
              maxListeners = Config.electron.maxListeners

        main = new window( option )

        main.setResizable( false )
        main.setMaxListeners( maxListeners )
        
        main.loadURL( 'http://127.0.0.1:' + port )

        // development option.
        main.webContents.openDevTools()

        main.on( 'closed', function(){
            main = null
        } )

        /***** App events *****/

        app.on( 'window-all-closed', function(){
            app.quit()
        } )

        // Ready
        main.show()

    } )

}

module.exports.run = run