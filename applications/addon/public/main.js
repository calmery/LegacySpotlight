socket.on( 'myProfile', profile => {
  document.getElementById( 'my_icon' ).style.background = 'url(' + profile.profile_image_url + ')'
  document.getElementById( 'my_icon' ).style.backgroundSize = 'cover'
  document.getElementById( 'my_name' ).innerHTML = profile.name
  document.getElementById( 'my_screen_name' ).innerHTML = '@' + profile.screen_name
  document.getElementById( 'fader' ).className = '_show fadeIn'
} )

let el
socket.on( 'addons', addons => {

  let list = {}

  for( let i=0; i<addons.apps.length; i++ )
    list[addons.apps[i]] = { name: addons.apps[i], auto: false }

  for( let name in addons.auto )
    if( list[name] ) list[name].auto = true

  if( el === undefined ){
    el = new Vue( {
      el: '#addons',
      data: {
        addons: list
      },
      methods: {
        remove: name => {
          if( confirm( '削除しますか？' ) )
            socket.emit( 'remove', name )
          el.$delete( list, name )
        },
        enable: name => {
          socket.emit( 'setAutoStartup', name )
          el.$set( list[name], 'auto', true )
        },
        disable: name => {
          socket.emit( 'releaseAutoStartup', name )
          el.$set( list[name], 'auto', false )
        }
      }
    } )
  } else {
    for( let key in list )
      el.$set( el.addons, key, list[key] )
  }

} )

const dialog = document.getElementById( 'dialog' )

const showDialog = () => {
  dialog.className = '_support fadeIn'
}

const hideDialog = () => {
  dialog.className = '_support fadeOut'
  setTimeout( () => {
    dialog.className = '_support _hide'
  }, 500 )
}

const add = () => {
  let path = document.getElementById( 'url' ).value
  if( path === '' ){
    alert( 'パスを入力してください' )
    return
  }

  socket.emit( 'add', path )
}

socket.on( 'refresh', () => window.location.reload() )
