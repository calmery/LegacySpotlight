const yacona = require( 'yacona' )
const utility = yacona.moduleLoader( 'utility' )

yacona.localAppLoader( utility.fixPath( __dirname, 'Spotlight' ) )