var express = require( 'express' )(),
    http    = require( 'http' ).Server( express ),
    config  = require( '../config/config' ).config,
    path    = require( 'path' )

var path = [
    {
        url: /resources\/[a-zA-Z0-9|.|\/|-]+/,
        fn : function( request, response ){
            console.log(request._parsedUrl.pathname)
            response.sendfile( './view' + request._parsedUrl.pathname )
        }
    }, {
        url: '/',
        fn : function( request, response ){
            console.log(request._parsedUrl.pathname)
            response.sendfile( './view/index.html' )
        }
    }, {
        url: '/search',
        fn : function( request, response ){
            console.log(request._parsedUrl.pathname)
            response.sendfile( './view/search.html' )
        }
    }, {
        url: '/list',
        fn : function( request, response ){
            response.sendfile( './view/list.html' )
        }
    }, {
        url: '/setting',
        fn : function( request, response ){
            response.sendfile( './view/setting.html' )
        }
    }, {
        url: '/edit',
        fn : function( request, response ){
            response.sendfile( './view/edit.html' )
        }
    }, {
        url: '/update',
        fn : function( request, response ){
            response.sendfile( './view/update.html' )
        }
    }
]

console.log(__dirname)

for( var i=0; i<path.length; i++ ){
    express.get( path[i].url, path[i].fn )
}

http.listen( config.express.port )

exports.express = express
exports.http    = http