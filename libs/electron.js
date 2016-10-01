exports.run = function( port ){

    var electron = require( 'electron' ),
        app      = electron.app,
        window   = electron.BrowserWindow,
        main

    var config = require( '../core/config' ).config

    /***** Application events *****/

    app.on( 'ready', function(){

        var option       = config.electron.app,
            maxListeners = config.electron.maxListeners

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