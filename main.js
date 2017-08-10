const Yacona = require( 'yacona' ).Yacona

const server = new Yacona( {
  prefix: 'spotlight',
  chdir : __dirname
} )

// Static

server.addClientModule( 'css/common', './resources/css/common.css' )

server.addClientModule( 'js/vue', './resources/js/vue.js' )

server.addClientModule( 'img/icon', './resources/img/icon.png' )

server.addClientModule( 'font/quicksand', './resources/css/fonts/quicksand.woff' )
server.addClientModule( 'font/condense', './resources/css/fonts/condenseicon.woff' )

// Apps

const api        = server.attachApp( './applications/api/' )
const controller = server.attachApp( './applications/controller/' )

api.launch()
controller.launch()
