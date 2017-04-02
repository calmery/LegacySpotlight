const yacona = require( 'yacona' )
const utility = yacona.moduleLoader( 'utility' )

yacona.addClientModule( 'base', './resources/css/base.css' )
yacona.addClientModule( 'fonts', './resources/css/fonts.css' )
yacona.addClientModule( 'quicksand', './resources/css/fonts/Quicksand/Quicksand-Regular.ttf' )

yacona.addClientModule( 'preload', './resources/js/preload.js' )

yacona.localAppLoader( utility.fixPath( __dirname, 'controller' ) )