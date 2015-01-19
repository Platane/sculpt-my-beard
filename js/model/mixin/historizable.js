
var deepCopy = function( o ){
    if( typeof o !== 'object' )
        return o

    if( Array.isArray( o ) )
        return o.map(deepCopy)

    var res = {}
    for( var i in o )
        if( typeof o[ i ] !== 'function' )
            res[ i ] = deepCopy( o[ i ] )
    return res
}

var unpack = function( o ){
    for( var i in o )
        this[ i ] = deepCopy( o[ i ] )
    return this
}

module.exports = {
    pack: function(){ return deepCopy( this ) },
    unpack: unpack,
    deepCopy: deepCopy
}
