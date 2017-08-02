socket.on( 'myProfile', profile => {
  document.getElementById( 'my_icon' ).style.background = 'url(' + profile.profile_image_url + ')'
  document.getElementById( 'my_icon' ).style.backgroundSize = 'cover'
  document.getElementById( 'my_name' ).innerHTML = profile.name
  document.getElementById( 'my_screen_name' ).innerHTML = '@' + profile.screen_name
  document.getElementById( 'fader' ).className = '_show fadeIn'
} )

let el
socket.on( 'config', configs => {
  if( el === undefined ){
    el = new Vue( {
      el: '#configs',
      data: {
        configs: configs
      },
      methods: {
        remove: key => {
          if( confirm( '削除しますか？' ) ){
            socket.emit( 'remove', { key: key } )
            el.$delete( el.configs, key )
          }
        },
        enable: key => {
          socket.emit( 'enable', { key: key } )
          el.$set( el.configs[key], 'active', true )
        },
        disable: key => {
          socket.emit( 'disable', { key: key } )
          el.$set( el.configs[key], 'active', false )
        }
      }
    } )
  } else {
    for( let key in configs )
      el.$set( el.configs, key, configs[key] )
  }
} )

// --- Dialog --- //

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

const save = () => {
  let key   = document.getElementById( 'key' ).value
  let value = document.getElementById( 'value' ).value

  if( key === '' || value === '' ){
    alert( 'プロパティ名と値を入力してください' )
    return
  }

  socket.emit( 'save', {
    key  : key,
    value: value
  } )

  hideDialog()
}
