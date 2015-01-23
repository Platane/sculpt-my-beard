var discretise = function( keys, w, offset ){

    w = w || 1
    offset = offset || 0

    var q=[]
    for( var k in keys )
        for( var i = keys[ k ].length; i--; ){
            var x = 0 | ( ( keys[ k ][ i ].date - offset ) / w )
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
