module.exports = ( yacona ) => {

    let utility = yacona.moduleLoader( 'utility' )
    
    let spotlight =  yacona.createOwnServer( {
        viewEngine: 'ejs'
    } )
    
    spotlight.addRoute( '/', ( request, response ) => {
        response.render( utility.fixPath( __dirname, 'public', 'index.ejs' ), {} )
    } )
    
    /* Ready */
    
    yacona.createWindow( spotlight.url )
    
}