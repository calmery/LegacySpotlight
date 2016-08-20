exports.config = {
    
    electron: {
        app: {
            width: 800,
            height: 600,
            center: true,
            fullscreen: false,
            fullscreenenable: false,
            show: false,
            title: 'Spotlight Beta'
        },
        maxListeners: 10
    },
    
    twitter: {
        name: 'SpotlightBeta-Patchworks',
        app: '12368503',
        consumer_key: '2aZzmhzrNsXqjQcDv0z3eB8cQ',
        consumer_secret: 'qBHKHCoaHOsfrzkTB5AchtWgpB1wCIuQBc6ZMQlylod5QdAdkk',
        defaultSearchResultCount: 15
    },
    
    server: {
        // Yoshilab
        uri: '202.16.132.30',
        port: 80,
        secure: false
    }
    
}