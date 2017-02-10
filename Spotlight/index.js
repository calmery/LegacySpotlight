module.exports = ( yacona ) => {

    let utility = yacona.moduleLoader( 'utility' )
    
    let spotlight =  yacona.createOwnServer( {
        viewEngine: 'ejs'
    } )
    
    console.log( spotlight )
    
    spotlight.server.app.use( require( 'express' ).static( utility.fixPath( __dirname, 'static' ) ) )
    
    spotlight.addRoute( '/', ( request, response ) => {
        response.render( utility.fixPath( __dirname, 'public', 'index.ejs' ), {} )
    } )
    
    /* Ready */
    
    yacona.createWindow( spotlight.url, { openDevTools: true } )
    
}