module.exports = yacona => {
    
    let controller
    
    yacona.addRoute( './public' )
    yacona.createWindow( {
        setMinimumSize: { 
            width: 200, 
            height: 200 
        }, 
        setMaximumSize: { 
            width: 200, 
            height: 600 
        }, 
        width:200, 
        setMenu: null, 
        setResizable: true 
    } ).then( window => controller = window )
    
}