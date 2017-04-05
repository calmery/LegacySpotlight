const yacona = require( 'yacona' )
const utility = yacona.moduleLoader( 'utility' )

let app = 'spotlight'

yacona.setPrefix( app )
yacona.addClientModule( 'logo', utility.fixPath( __dirname, './resources/img/icon.ico' ) )

yacona.addClientModule( 'base', utility.fixPath( __dirname, './resources/css/base.css' ) )
yacona.addClientModule( 'fonts', utility.fixPath( __dirname, './resources/css/fonts.css' ) )
yacona.addClientModule( 'quicksand', utility.fixPath( __dirname, './resources/css/fonts/Quicksand/Quicksand-Regular.ttf' ) )

yacona.addClientModule( 'preload', utility.fixPath( __dirname, './resources/js/preload.js' ) )
yacona.addClientModule( 'bind', utility.fixPath( __dirname, './resources/js/bind.js' ) )
yacona.addClientModule( 'common', utility.fixPath( __dirname, './resources/js/common.js' ) )

yacona.localAppLoader( utility.fixPath( __dirname, 'controller' ) )