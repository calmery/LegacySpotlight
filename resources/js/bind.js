var bind = {
    
    // Set constant
    constant: {
        
        INDEX: function( element, objects, config, index, args ){
            this.COUNTER++
            return index + 1
        },
        
        INDEX_ALIGN: function( element, objects, config, index, args ){
            var numCount   = objects.length.toString().length,
                indexCount = ( index + 1 ).toString().length
            index = index + 1
            for( var i=0; i<numCount-indexCount; i++ ){
                index = '0' + index
            }
            return index
        },
        
        COUNTER: 0
        
    },
    
    hide: function( element ){
        if( !element ) return false
        if( typeof element === 'string' ){
            element = document.getElementById( element )
        }
        element.style.display = 'none'
        return true
    },
    
    view: function( element ){
        if( !element ) return false
        if( typeof element === 'string' ){
            element = document.getElementById( element )
        }
        element.style.display = 'block'
        return true
    },
    
    // Hold template
    bound: {},
    
    // binding : (Element, Object) => Bool
    // binding : (Element, Object, Object) => Bool
    // binding( (DOM Element or DOM Element ID), (Array or Object) [, Config] )
    binding: function( element, objects, config ){
        
        // Missing essential argument
        if( element === undefined || objects === undefined )
            return false
        
        // Missing argument 
        if( config === undefined )
            config = {}
        
        // Using array object 
        if( !Array.isArray( objects ) )
            objects = [objects]
        
        // Get DOM Element
        if( typeof element === 'string' )
            element = document.getElementById( element )
        
        // Set DOM Element id
        var elementId = element.getAttribute( 'id' )
        var template
        
        /***** Config *****/
        
        // Template
        if( element.innerHTML )
            template = element.innerHTML
        if( this.bound[elementId] )
            template = this.bound[elementId]
        if( config.template )
            template = config.template
        
        if( config.rewrite !== false )
            element.innerHTML = ''
        
        // Extraction of key ({{KEY}} => KEY) and assignment to args
        var args = template.match( /{+[a-zA-Z0-9|.|-|_]+}+/g )
        args = args.filter( function( element, index, self ){
            return self.indexOf( element ) === index
        } ).map( function( element, index, self ){
            element = element.replace( /{+|}+/g, '' )
            if( element.indexOf( '.' ) !== -1 )
                return element.split( '.' )
            else
                return element
        } )
        
        // Replace according to args
        var temp, argTemp, value
        for( var object=0; object<objects.length; object++ ){
            
            temp = template
            
            for( var key in this.constant )
                // argument constant( element, objects, config, index, args )
                if( typeof this.constant[key] === 'function' )
                    objects[object][key] = this.constant[key]( element, objects, config, object, args )
                else
                    objects[object][key] = this.constant[key]
            
            for( var arg=0; arg<args.length; arg++ ){
                // Value or Array
                if( Array.isArray( args[arg] ) ){
                    argTemp = args[arg].join( '.' )
                    // Get value in object hierarchized
                    value = ( function( val, args ){
                        if( args.length === 0 ) return val
                        return arguments.callee( val[args.shift()], args )
                    } )( objects[object], args[arg].concat() )
                } else {
                    argTemp = args[arg]
                    value = objects[object][args[arg]]
                }
                temp = temp.replace( RegExp( '{{' + argTemp + '}}', 'g' ), value )
            }
            
            // Write
            element.innerHTML += temp
            
        }
        
        if( !this.bound[elementId] )
            this.bound[elementId] = template

        return true
        
    }
    
}
