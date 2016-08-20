onload = function(){
    
    if( !sessionStorage.getItem( 'myprofile' ) )
        socketio.emit( 'getMyProfile', { data: true } )
    else
        profileParser( JSON.parse( unescape( sessionStorage.getItem( 'myProfile' ) ) ) )

    // Return my profile on Twitter.
    socketio.on( 'returnMyProfile', function( profile ){
        sessionStorage.setItem( 'myProfile', escape( JSON.stringify( profile.value ) ) )
        profileParser( profile.value )
    } )

    function profileParser( profile ){
        bind.binding( 'profiles', [{
            name             : profile.name,
            created_at       : profile.created_at,
            followers_count  : profile.followers_count,
            friends_count    : profile.friends_count,
            id               : profile.id_str,
            lang             : profile.lang,
            description      : profile.description,
            screen_name      : profile.screen_name,
            statuses_count   : profile.statuses_count,
            profile_image_url: profile.profile_image_url
        }] )
    }
    
}