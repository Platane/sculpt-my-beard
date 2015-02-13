var discretise = function( keys, w, _offset ){

    w = w || 1
    _offset = _offset || 0

    // compute min
    var offset = -_offset
    for( var k in keys )
        if( keys[ k ].length )
            offset = Math.max( offset, -Math.floor( keys[ k ][ 0 ].date/ w ) )
    offset *= -w

    // count key number in each intervalle
    var q=[]
    for( var k in keys )
        for( var i = keys[ k ].length; i--; ){
            var x = Math.floor( ( keys[ k ][ i ].date - offset ) / w )
            q[ x ] = ( 0 | q[ x ])  + 1
        }


    return {
        offset: offset,
        w: w,
        q: q
    }
}

module.exports = {
    discretise: discretise
}
