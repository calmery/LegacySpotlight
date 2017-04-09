function saveToggle(){
    let e = document.getElementById( 'save_field' )
    let s = document.getElementById( 'search_field' )
    if( e.style.display === 'block' ){
        e.style.display = 'none'
        s.style.display = 'block'
    } else if( e.style.display === 'none' ){
        e.style.display = 'block'
        s.style.display = 'none'
    }
}

function change( num, id ){
    let e = document.getElementById( 'n' + num )
    let f = e.getAttribute( 'flag' )
    if( f === 'clean' ){
        flag[num] = 'danger'
        e.style.borderColor = 'rgba( 2, 159, 218, 1 )'
        e.setAttribute( 'flag', 'danger' )
    } else if( f === 'danger' ){
        flag[num] = 'clean'
        e.style.borderColor = 'rgba( 126, 211, 33, 1 )'
        e.setAttribute( 'flag', 'clean' )
    }
}

socket.on( 'saved', function(){ document.getElementById( 'loading' ).style.display = 'none'; alert( 'Saved' ) } )
socket.on( 'reject', function(){ document.getElementById( 'loading' ).style.display = 'none'; alert( 'Already use' ) } )

function save(){

    let name = document.getElementById( 'list_name' ).value
    if( name === '' || name.indexOf( '/' ) !== -1 ) return false

    document.getElementById( 'loading' ).style.display = 'block'

    socket.emit( 'save', {
        name: name,
        raw: raw,
        flag: flag,
        meta: meta,
        statuses: statuses
    } )

}