var u = require('../utils/point')


// a (1-alpha) + b alpha
var lerpPoints = function( apts, bpts, alpha ){

    // ensure that the array are same lengthed
    while( apts.length < bpts.length )
        apts.push( u.copy( bpts[bpts.length-1] ) )

    while( bpts.length < apts.length )
        bpts.push( u.copy( apts[apts.length-1] ) )


    var res = []

    for(var i=apts.length; i--;)
        res.push( u.lerp( apts[i], bpts[i], alpha ) )

    return res
}

// a (1-alpha) + b alpha
var lerpNumber = function( apts, bpts, alpha ){

    // ensure that the array are same lengthed
    while( apts.length < bpts.length )
        apts.push( u.copy( bpts[bpts.length-1] ) )

    while( bpts.length < apts.length )
        bpts.push( u.copy( apts[apts.length-1] ) )


    var res = []

    var aalpha = 1-alpha

    for(var i=apts.length; i--;)
        res.push( aalpha * apts[i] + alpha * bpts[i] )

    return res
}

// a (1-alpha) + b alpha
var lerpPack = function( apack, bpack , alpha ){
    var res = {}

    for( var i in apack )
        switch( i ){
            case 'line':
            case 'vertex':
                res[ i ] = lerpPoints( apack[i], bpack[i], alpha )
                break

            case 'width':
                res[ i ] = lerpNumber( apack[i], bpack[i], alpha )
                break
        }

    return res
}

module.exports = {
    lerpPack: lerpPack
}
