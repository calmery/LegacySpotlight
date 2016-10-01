window.onload = function(){
    bind.hide( 'tweet' )
    var data = JSON.parse( sessionStorage.getItem( 'editList' ) )
    document.getElementById('rank').innerHTML = 'Rank ' + sessionStorage.getItem( 'editName' )
    sessionStorage.removeItem( 'editName' )
    bind.binding( 'tweet', data.response )

    bind.view( 'tweet' )

    document.getElementById( 'profileClose' ).addEventListener( 'click', function(){
        document.getElementById( 'profileBackground' ).style.display = 'none'
    } )
}

function getUserProfile( user ){
    console.log( user )
    socketio.emit( 'getUserProfile', {
        value: user
    } )
}

var $ = function( e ){
    return document.getElementById( e )
}

socketio.on( 'gotUserProfile', function( profile ){

    profile = profile.value

    console.log( profile )
    $( 'profileBackground' ).style.display = 'block'
    $( 'profileImage' ).src = profile.profile_image_url
    $( 'profileName' ).innerHTML = profile.name
    $( 'profileScreenName' ).innerHTML = '@' + profile.screen_name
    $( 'profileId' ).innerHTML = profile.id
    $( 'profileDescription' ).innerHTML = profile.description
    $( 'profileFriends' ).innerHTML = 'Friends : ' + profile.friends_count + ' / Followers : ' + profile.followers_count
    $( 'profileCreatedAt' ).innerHTML = profile.created_at

} )