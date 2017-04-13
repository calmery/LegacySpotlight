socket.emit( 'getList' )
socket.on( 'list', list => {
    let e = document.getElementById( 'list' )
    let output = ''
    list.forEach( name => {
        output += '<div class="content clearfix">' +
            '<div class="list_name float_l">' + name + '</div>' + 
            '<div class="btn float_r" style="margin-left:10px;background:rgba(255,96,96,1)" onclick="remove(\'' + name + '\')">消去</div>' +
            '<div class="btn float_r" onclick="edit(\'' + name + '\')">編集</div>' + 
            '</div>'
    } )
    e.innerHTML = output
} )

const edit = name => {
    operationBlocker.show()
    console.log('as')
    fadeOut( 'list' )
    socket.emit( 'edit', name )
}

let raw,
    meta     = [],
    statuses = [],
    flag

let area = document.getElementById( 'edit' )
let count = -1

socket.on( 'edit', data => {
    document.getElementById( 'list_name' ).value = data.name
    raw = data.raw
    flag = data.flag

    raw.forEach( d => {
        meta.push( d.search_metadata )

        let isOverlap

        d.statuses.forEach( t => {
            isOverlap = false
            statuses.forEach( o => {
                if( o.id === t.id )
                    isOverlap = true
            } )
            if( isOverlap === true ) return false
            
            console.log( flag[count] )

            count++
            statuses.push( t )
            area.innerHTML = '<div class="content clearfix" style="' + ( flag[count] === 'clean' ? 'border-color: rgba( 126, 211, 33, 1 )' : '' ) + '" id="n' + count + '" onclick="change( ' + count + ', ' + t.id + ' )" flag="' + flag[count] + '">' +
                '<div class="left float_l">' + 
                '<img src="' + t.user.profile_image_url + '">' +
                '</div>' + 
                '<div class="right float_r">' +
                '<div class="name">' + t.user.name + '</div>' + 
                '<div class="screen_name">@' + t.user.screen_name+'</div>' +
                '<div class="text">' + t.text + '</div>' +
                '</div>' +
                '</div>' + area.innerHTML
        } )

        area.innerHTML = '<div class="title">' + 
            decodeURIComponent( d.search_metadata.query ).replace( /\+/g, ' ' ) + 
            '</div>' + area.innerHTML
    } )

    operationBlocker.hide()
    fadeIn( 'edit_field' ) 
} )

const change = ( num, id ) => {
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

socket.on( 'saved', () => { operationBlocker.hide(); alert( 'Saved' ) } )
socket.on( 'reject', () => { operationBlocker.hide(); alert( 'Rejected' ) } )

const save = () => {

    let name = document.getElementById( 'list_name' ).value
    if( name === '' || name.indexOf( '/' ) !== -1 ) return false

    operationBlocker.show();

    socket.emit( 'save', {
        name: name,
        raw: raw,
        flag: flag,
        meta: meta,
        statuses: statuses
    } )

}

const remove = listName => {
    if( confirm( 'Can I delete it ?' ) ){
        operationBlocker.show()
        socket.emit( 'remove', listName )
    }
}

socket.on( 'removed', () => {
    operationBlocker.hide()
    alert( 'Removed' )
    window.location.reload()
} )