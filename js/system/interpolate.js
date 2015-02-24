/**
 *  Collection functions used to interpolate the face from a state to another one
 */

var u = require('../utils/point')


/**
 *  The a and b array may not have the same length, in case a point have been delete/added
 *  In that case, the added point should be considered to be the same as the one from where it spawn
 *
 *  @return {a:{Array of number}, b:{Array of number}} as indexes for building the comparable vector for a and b
 */
var diffArray = function( a, b ){
    var ia = []
    var ib = []

    var x = 0
    for( var i=0; i<a.length; i++ ){
        if( a[i].spawnFrom ){
            // this point just appear
            // no matter what its cordinates are, consider it's the same as the one from which its spawn

            // check if it's not delete right after
            // in this case don't it

            var k=i
            while( a[k].spawnFrom == 'before' ){
                k = ( k -1+a.length ) % a.length
            }
            while( a[k].spawnFrom == 'after' ){
                k = ( k +1 ) % a.length
            }
            ia.push( k )
        } else if ( a[i].absorbedBy ){
            // ignore it
        } else {
            ia.push( i )
        }
    }

    var x = 0
    for( var i=0; i<b.length; i++ ){
        if( b[i].spawnFrom ){
            // this point will appear
            // ignore it for this intervalle
        } else if ( b[i].absorbedBy ){
            var k=i
            while( b[k].absorbedBy == 'before' ){
                k = ( k -1+b.length ) % b.length
            }
            while( b[k].absorbedBy == 'after' ){
                k = ( k +1 ) % b.length
            }
            ib.push( k )
        } else {
            ib.push( i+x )
        }
    }


    return {
        a: ia,
        b: ib
    }
}

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
lerpFn['line'] = lerpFn['point']
lerpFn['vertex'] = lerpFn['point']
lerpFn['width'] = lerpFn['number']


// a (1-alpha) + b alpha
// when alpha is low, the result is closer to a
var lerpPack = function( apack, bpack , alpha ){
    var res = {}

    var aalpha = 1-alpha

    var pool = apack.line ? 'line' : 'vertex'
    var index = diffArray( apack[ pool ], bpack[ pool ] )

    for( var i in apack ){

        var lerpfn = lerpFn[ i ]
        var ap = apack[ i ]
        var bp = bpack[ i ]

        var arr = []

        for( var k=0; k<index.a.length; k++ )
            arr.push( lerpfn( alpha, aalpha, ap[ index.a[ k ] ], bp[ index.b[ k ] ] )  )

        res[ i ] = arr
    }

    return res
}

module.exports = {
    lerpPack: lerpPack,
    t:{
        diffArray: diffArray
    }
}
