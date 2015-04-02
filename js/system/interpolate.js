/**
 *  Collection of functions used to interpolate the face from a state to another one
 */

var u = require('../utils/point')
  , sc = require('../system/structuralChangesMethods')


var lerpFn = {
    'point': function(alpha, aalpha, a, b){
        return {
            x: a.x * aalpha + b.x * alpha,
            y: a.y * aalpha + b.y * alpha
        }
    },
    'number': function(alpha, aalpha, a, b){
        return a * aalpha + b * alpha
    },
    'sharpness': function(alpha, aalpha, a, b){
        return {
            before: a.before * aalpha + b.before * alpha,
            after: a.after * aalpha + b.after * alpha
        }
    },
}

lerpFn['vertex'] = lerpFn['line'] = lerpFn['point']
lerpFn['width'] = lerpFn['number']


// a (1-alpha) + b alpha
// when alpha is low, the result is closer to a
var lerpPack = function( akey, bkey , alpha ){
    var res = {}

    var aalpha = 1-alpha

    var apack = sc.packOut( akey )
    var bpack = sc.packIn( bkey )
    var pool = apack.line ? 'line' : 'vertex'

    for( var i in apack )
        switch( i ){
            case 'sharpness' :
                if( pool == 'line' ){
                    res[ i ] = apack[ i ]
                    break
                }
            case 'vertex' :
            case 'line' :
            case 'width' :

                var lerpfn = lerpFn[ i ]
                var ap = apack[ i ]
                var bp = bpack[ i ]

                var arr = []


                for( var k=0; k<ap.length; k++ )
                    arr.push( lerpfn( alpha, aalpha, ap[ k ], bp[ k ] )  )

                res[ i ] = arr
        }

    return res
}

module.exports = {
    lerpPack: lerpPack,
    lerpFn: lerpFn,
}
