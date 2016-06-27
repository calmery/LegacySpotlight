var user = require( './user' )

exports.config = {
    express : {
        port           : 3000
    },
    electron: {
        app            : {
            show          : false,
            width         : 800,
            height        : 600,
            center        : true,
            fullscreen    : false,
            fullscreenable: false,
            title         : 'Cyber'
        },
        maxListeners   : 5
    },
    twitter : {
        name           : 'Cyber2016',
        url            : 'apps.twitter.com/app/12368503',
        consumer_key   : '2aZzmhzrNsXqjQcDv0z3eB8cQ',
        consumer_secret: 'qBHKHCoaHOsfrzkTB5AchtWgpB1wCIuQBc6ZMQlylod5QdAdkk'
    },
    user    : user.config
}