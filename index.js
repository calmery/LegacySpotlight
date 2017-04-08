const yacona = require( 'yacona' )

yacona.setPrefix( 'spotlight' )
yacona.chdir( __dirname )

yacona.addClientModule( 'base', 'resources/css/base.css' )
yacona.addClientModule( 'init', 'resources/js/init.js' )
yacona.addClientModule( 'loading', 'resources/img/loading.gif' )

yacona.localAppLoader( 'applications/api' )
yacona.localAppLoader( 'applications/controller' )