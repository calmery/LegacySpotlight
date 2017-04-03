module.exports = yacona => {
    
    yacona.addRoute( './public' )
    yacona.createWindow( { setMenu: null, setResizable: false, openDevTools: true } )
    
    yacona.setSocket( 'getMyProfile', ( socket, value ) => {
        socket.emit( 'myProfile', yacona.emit( { app: 'controller', event: 'myProfile' } ) )
    } )
    
    let isSearch = false
    yacona.setSocket( 'search', ( socket, value ) => {
        if( isSearch === false ){
            isSearch = true
            yacona.emit( { app: 'api', event: 'search' }, { query: value, count: 15 } ).then( ( tweet ) => {
                yacona.notifier( '検索が終了しました' )
                isSearch = false
                socket.emit( 'result', tweet )
            } )
        }
    } )
    
}