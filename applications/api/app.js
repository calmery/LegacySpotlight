const configJson        = './config.json'
const authorizationJson = './authorization.json'

const consumerKey = {
  consumer_key   : 'nDnk9b8WsPVE5hLoY44qNSevM',
  consumer_secret: 'hEesWDwCN6HTbkQ0YdIvgdHsgIhzEqcGwgKKtrerLbIz87BhS9'
}

let config
let authorization

module.exports.launch = app => {

  // --- Config --- //

  const loadConfig = () => {
    let f = app.loadAppData( configJson )
    return config = ( f !== null ) ? JSON.parse( f ) : {}
  }

  const saveConfig = config => {
    return app.saveAppData( configJson, JSON.stringify( config ) )
  }

  app.addListener( 'config/load', () => loadConfig() )

  app.addListener( 'config/save', ( key, value, enable ) => {
    let config = loadConfig()
    config[key] = {
      value : value,
      enable: enable
    }
    return saveConfig( config )
  } )

  app.addListener( 'config/delete', key => {
    let config = loadConfig()
    delete config[key]

    return saveConfig( config )
  } )

  app.addListener( 'config/enable', key => {
    let config = loadConfig()
    if( config[key] === undefined )
      return false

    config[key].enable = true
    return saveConfig( config )
  } )

  app.addListener( 'config/disable', key => {
    let config = loadConfig()
    if( config[key] === undefined )
      return false

    config[key].enable = false
    return saveConfig( config )
  } )

  // --- App Support --- //

  app.addListener( 'app/launch', name => {
    const alreadyRunning = app.getApp().getYacona().getApps()
    if( alreadyRunning[name] !== undefined ){
      if( alreadyRunning[name].getInstance().launch )
        alreadyRunning[name].getInstance().launch( alreadyRunning[name].getController() )
      return alreadyRunning[name]
    }

    const path = app.getAppPath( name )
    const instance = app.attachApp( path !== null ? path : ( '../' + name ) )

    instance.launch()

    return instance
  } )

  app.addListener( 'app/close', name => {
    const alreadyRunning = app.getApp().getYacona().getApps()
    if( alreadyRunning[name] !== undefined ){
      alreadyRunning[name].close()
      return true
    }

    return false
  } )

  // --- Twitter --- //

  app.addListener( 'twitter/key/consumer', () => consumerKey )

  app.addListener( 'twitter/key/register', data => {
    return app.saveAppData( authorizationJson, JSON.stringify( data ) )
  } )

}
