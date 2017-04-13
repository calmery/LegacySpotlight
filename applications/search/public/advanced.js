const add_and = value => {
    let form = document.createElement( 'textarea' )
    form.className = 'search_and'
    form.placeholder = 'And'
    if( value ) form.value = value
    document.getElementById( 'search_and_field' ).appendChild( form )
}

const add_or = value => {
    let form = document.createElement( 'textarea' )
    form.className = 'search_or'
    form.placeholder = 'Or'
    if( value ) form.value = value
    document.getElementById( 'search_or_field' ).appendChild( form )
}

const add_not = value => {
    let form = document.createElement( 'textarea' )
    form.className = 'search_not'
    form.placeholder = 'Not'
    if( value ) form.value = value
    document.getElementById( 'search_not_field' ).appendChild( form )
}

const saveWordToggle = () => {
    let e = document.getElementById( 'save_field' )
    let s = document.getElementById( 'search_field' )
    let m = document.getElementById( 'toggle' )
    let a = document.getElementById( 's' )
    if( e.style.display === 'block' ){
        m.className = 'menu'
        a.className = 'isRunning'
        e.style.display = 'none'
        s.style.display = 'block'
    } else if( e.style.display === 'none' ){
        m.className = 'menu selected'
        a.className = 'isRunning active'
        e.style.display = 'block'
        s.style.display = 'none'
    }
}

const saveWord = () => {
    let name = document.getElementById( 'word_name' ).value
    if( name === '' ) return false

    let e_and = document.getElementsByClassName( 'search_and' )
    let e_or  = document.getElementsByClassName( 'search_or' )
    let e_not = document.getElementsByClassName( 'search_not' )

    let from = document.getElementById( 'search_from' ).value
    let to   = document.getElementById( 'search_to' ).value

    let and = [],
        or  = [],
        not = []

    for( let i=0; i<e_and.length; i++ ) 
        if( e_and[i].value !== '' ) 
            and.push( e_and[i].value )

    for( let i=0; i<e_or.length; i++ )
        if( e_or[i].value !== '' )  
            or.push( e_or[i].value )

    for( let i=0; i<e_not.length; i++ ) 
        if( e_not[i].value !== '' ) 
            not.push( '-' + e_not[i].value )

    socket.emit( 'saveWord', {
        from: from, 
        to: to,
        and: and,
        or: or,
        not: not,
        name: name
    } )

    window.location.reload()
}

socket.emit( 'getWord' )
let wordList
socket.on( 'word', words => {
    let e = document.getElementById( 'words_list' )
    let count = 0
    for( let i in words ){
        count++
        e.innerHTML += '<div class="content clearfix">' +
            '<div class="list_name">' + i + '</div>' + 
            '<div class="btn float_r" onclick="loadWord(\'' + i + '\')">読み込み</div>' +
            '</div>'
    }
    wordList = words
    if( count === 0 )
        document.getElementById( 'words_list_tag' ).style.display = 'none'
        } )

const loadWord = ( word ) => {

    document.getElementById( 'search_and_field' ).innerHTML = ''
    document.getElementById( 'search_or_field' ).innerHTML = ''
    document.getElementById( 'search_not_field' ).innerHTML = ''

    add_and()
    add_or()
    add_not()

    let list = wordList[word]

    let and  = list.and,
        or   = list.or,
        not  = list.not,
        from = list.from,
        to   = list.to

    for( let i=0; i<and.length; i++ ){
        if( i === 0 ) document.getElementsByClassName( 'search_and' )[0].value = and[i]
        else if( i !== 0 ) add_and( and[i] )
            }

    for( let i=0; i<or.length; i++ ){
        if( i === 0 ) document.getElementsByClassName( 'search_or' )[0].value = or[i]
        else if( i !== 0 ) add_or( or[i] )
            }

    for( let i=0; i<not.length; i++ ){
        if( i === 0 ) document.getElementsByClassName( 'search_not' )[0].value = not[i]
        else if( i !== 0 ) add_not( not[i] )
            }

    if( from ) document.getElementById( 'search_from' ).value = from
    if( to ) document.getElementById( 'search_to' ).value = to

    alert( 'Loaded' )

}

const advanced_search = () => {

    operationBlocker.show()

    let e_and = document.getElementsByClassName( 'search_and' )
    let e_or  = document.getElementsByClassName( 'search_or' )
    let e_not = document.getElementsByClassName( 'search_not' )

    let from = document.getElementById( 'search_from' ).value
    let to   = document.getElementById( 'search_to' ).value

    let and = [],
        or  = [],
        not = []

    for( let i=0; i<e_and.length; i++ ) if( e_and[i].value !== '' ) and.push( e_and[i].value )
    for( let i=0; i<e_or.length; i++ )  if( e_or[i].value !== '' )  or.push( e_or[i].value )
    for( let i=0; i<e_not.length; i++ ) if( e_not[i].value !== '' ) not.push( '-' + e_not[i].value )

    let and_query  = and.join( ' AND ' ),
        or_query   = or.join( ' OR ' ),
        not_query  = not.join( ' ' )

    let from_query = 'from:' + from,
        to_query   = 'to:' + to

    let query = and_query + ' ' + or_query + ' ' + not_query
    if( from !== '' ) query += ' ' + from_query
    if( to !== '' ) query += ' ' + to_query

    socket.emit( 'search', query )

}
