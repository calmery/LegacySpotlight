var path    = require( 'path' ),
    fs      = require( 'fs' )

exports.config = {

    electron: {
        app: {
            show: false,
            width: 800,
            height: 600,
            center: true,
            fullscreen: false,
            fullscreenenable: false,
            title : 'Spotlight Beta'
        },
        maxListeners: 5
    },

    twitter: {
        name: 'SpotlightBeta-Patchworks',
        app: '12368503',
        consumer_key: '2aZzmhzrNsXqjQcDv0z3eB8cQ',
        consumer_secret: 'qBHKHCoaHOsfrzkTB5AchtWgpB1wCIuQBc6ZMQlylod5QdAdkk'
    },

    server: {
        uri: 'localhost:3000',
        secure: false
    }

}