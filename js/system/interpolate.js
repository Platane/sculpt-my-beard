/**
 *  Collection functions used to interpolate the face from a state to another one
 */


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
var bigarray = []
for(var i=0;i<256;i++)
    bigarray.push(i)
var lerpPack = function( apack, bpack , alpha ){
    var res = {}

    var aalpha = 1-alpha

    var aindex = apack.reindex || bigarray
    var bindex = bpack.reindex || bigarray

    var lerpfn, ap, bp, l, l2, k

    for( var i in apack ){
        switch( i ){
            case 'sharpness' :
                if( apack.line ){

                    lerpfn = lerpFn[ i ]
                    ap = apack[ i ]
                    bp = bpack[ i ]
                    l = apack.line.length
                    l2 = apack[ i ].length

                    var arr = []

                    // 0
                    arr.push( lerpfn( alpha, aalpha, ap[ l-2- aindex[ 0 ] ], bp[ l-2- bindex[ 0 ] ] )  )

                    // [ 1.. l-2 ]
                    for( k=1; k<l-1; k++ ){

                        arr.unshift( lerpfn(
                            alpha,
                            aalpha,
                            ap[ l-2-aindex[ k ] ],
                            bp[ l-2-bindex[ k ] ]
                        ))
                        arr.push( lerpfn(
                            alpha,
                            aalpha,
                            ap[ l-2+aindex[ k ] ],
                            bp[ l-2+bindex[ k ] ]
                        ))
                    }

                    // l-1
                    arr.push( lerpfn( alpha, aalpha, ap[ l-2+ aindex[ l-1 ] ], bp[ l-2+ bindex[ l-1 ] ] )  )

                    res[ i ] = arr

                    break
                } else
                    ; // pass to next case
            case 'vertex' :
            case 'width' :
            case 'line' :
                lerpfn = lerpFn[ i ]
                ap = apack[ i ]
                bp = bpack[ i ]
                l = ap.length

                var arr = []

                for( k=0; k<l; k++ )
                    arr.push( lerpfn( alpha, aalpha, ap[ aindex[ k ] ], bp[ bindex[ k ] ] )  )

                res[ i ] = arr
            break
        }
    }

    // reindex
    if ( alpha == 0 )
        res.reindex = apack.reindex ? apack.reindex.slice() : null
    else if ( alpha == 1 )
        res.reindex = bpack.reindex ? bpack.reindex.slice() : null

    return res
}

module.exports = {
    lerpPack: lerpPack
}
