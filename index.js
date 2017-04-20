const yacona = require( 'yacona' )

// Setting
yacona.setPrefix( 'spotlight' )
yacona.chdir( __dirname )

// Resources
yacona.addClientModule( 'base', 'resources/css/base.css' )
yacona.addClientModule( 'fonts', 'resources/css/font.css' )

yacona.addClientModule( 'quicksand', 'resources/css/fonts/Quicksand-Regular.ttf' )
yacona.addClientModule( 'condense', 'resources/css/fonts/CONDENSEicon.otf' )
yacona.addClientModule( 'fonts', 'resources/css/font.css' )

yacona.addClientModule( 'init', 'resources/js/init.js' )

yacona.addClientModule( 'loading', 'resources/img/loading.gif' )
yacona.addClientModule( 'icon', 'resources/img/icon.ico' )

// Launch
yacona.localAppLoader( 'applications/api' )
yacona.localAppLoader( 'applications/controller' )
