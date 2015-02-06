var u = require('../utils/point')


var lerpArray = function( apts, bpts, lerFn ){
    // ensure that the array are same lengthed
    while( apts.length < bpts.length )
        apts.push( u.copy( bpts[bpts.length-1] ) )

    while( bpts.length < apts.length )
        bpts.push( u.copy( apts[apts.length-1] ) )


    var res = []

    for(var i=0; i<apts.length; i++)
        res.push( lerFn( apts[i], bpts[i] ) )

    return res
}

// a (1-alpha) + b alpha
var lerpPack = function( apack, bpack , alpha ){
    var res = {}

    var aalpha = 1-alpha

    for( var i in apack )
        switch( i ){
            case 'line':
            case 'vertex':
                res[ i ] = lerpArray( apack[i], bpack[i], function( a, b ){
                    return u.lerp( a, b, alpha )
                })
                break

            case 'width':
                res[ i ] = lerpArray( apack[i], bpack[i], function( a, b ){
                    return a* aalpha + b* alpha
                })
                break

            case 'sharpness':
                res[ i ] = lerpArray( apack[i], bpack[i], function( a, b ){
                    return {
                        before: a.before* aalpha + b.before* alpha,
                        after: a.after* aalpha + b.after* alpha
                    }
                })
                break
        }

    return res
}

module.exports = {
    lerpPack: lerpPack
}
