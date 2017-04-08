const yacona = require( 'yacona' )

yacona.setPrefix( 'spotlight' )

yacona.chdir( __dirname )
yacona.localAppLoader( 'applications/controller' )