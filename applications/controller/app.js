module.exports.launch = app => {

  app.callListener( 'api/app/launch', 'oauth' )

}
