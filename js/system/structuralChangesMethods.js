

/**
 * add a point to a line
 * @private
 * @param    aPack     { pack }     the pack where the point should be
 * @param    i         { number }   the index where the point should be added ( in the pack, so not necessary the same as in the out pack )
 * @param    k         { number }   number so the point is p = ( 1-k ) * [i-1] +   k * [i]
 */
var pushPointLine = function( aPack, i, k ){

    var lerpFn = require('./interpolate').lerpFn

    var _i = (i+aPack.line.length-1) % aPack.line.length

    var _k = 1-k

    for( var p in aPack ){


        if( p == 'sharpness' ){

            // TODO
            aPack[ p ].push({after: 0.15, before: 0.15})
            aPack[ p ].push({after: 0.15, before: 0.15})

        } else {

            // lerp
            var el = lerpFn[ p ]( k, _k, aPack[ p ][ _i ], aPack[ p ][ i ] )

            // push element
            aPack[ p ].splice( i, 0, el )

        }
    }
}

/**
 * add a point to a shape
 * @private
 * @param    aPack     { pack }     the pack where the point should be
 * @param    i         { number }   the index where the point should be added ( in the pack, so not necessary the same as in the out pack )
 * @param    k         { number }   number so the point is p = ( 1-k ) * [i-1] +   k * [i]
 */
var pushPointShape = function( aPack, i, k ){

    var lerpFn = require('./interpolate').lerpFn

    var _i = (i+aPack.vertex.length-1) % aPack.vertex.length

    var _k = 1-k

    for( var p in aPack ){

        // lerp
        var el = lerpFn[ p ]( k, _k, aPack[ p ][ _i ], aPack[ p ][ i ] )

        // push element
        aPack[ p ].splice( i, 0, el )
    }
}


/**
 * add a point to a key, add the point to the pack and set the structuralChange
 * @param i   {Number}      is the index of the point in the aKey outpout !!! ( which is also the bKey input )
 * @param k   {Number}      point is located at a*(1-k) + b*k
 */
var add = function( aKey, bKey, i, k ){


    var pushPoint = aKey.pack.line ? pushPointLine : pushPointShape


        // before
    // handle the sctructural change
    var aSc = aKey.structuralChanges

    // find the index in the pack
    var ia
    var al = ( aKey.pack.line || aKey.pack.vertex ).length

    var indexA = indexOut( aSc, al )
    for( ia=0; indexA[ ia ] < i; ia++ );

    // keep consistancy
    for(var u=aSc.length; u--; )
        if( aSc[u].i >= ia )
        aSc[u].i ++

    // push the change
    aSc.push({type: 'add', i:ia, k:k})

    // push the new pack
    pushPoint( aKey.pack, ia, k )






        // after
    // is there event an after
    if( !bKey )
        return

    var bSc = bKey.structuralChanges

    // find the index in the pack
    var ib
    var bl = ( bKey.pack.line || bKey.pack.vertex ).length

    var indexB = indexIn( bSc, bl )
    for( ib=0; indexB[ ib ] < i; ib++ );

    // keep consistancy
    for(var u=bSc.length; u--; )
        if( bSc[u].i >= ib )
        bSc[u].i ++

    // push the change
    bSc.push({type: 'del', i:ib, k:k})

    // push the point
    pushPoint( bKey.pack, ib, k )

}

var del = function( beforePack, afterPack, i, k ){


}


var bigArray = []
for (var i=256; i--;)
    bigArray[i] = i
var indexOut = function( structuralChanges, l ){

    var i,k

    // build identity array
    var arr = []
    for ( i=l; i--; )
        arr[i] = i

    // alter
    for( i=0; i<structuralChanges.length; i++ )
        if( structuralChanges[i].type == 'add' ){
            // add
            // should out normally
            // ignore
        } else {
            // remove
            // should mask the removed point
            arr.splice(structuralChanges[i].i,1)
        }

    return arr
}
var indexIn = function( structuralChanges, l ){

    var i,k

    // build identity array
    var arr = []
    for ( i=l; i--; )
        arr[i] = i

    // alter
    for( i=0; i<structuralChanges.length; i++ )
        if( structuralChanges[i].type == 'add' ){
            // add
            // should in as the point dont exist
            arr.splice(structuralChanges[i].i,1)
        } else {
            // remove
            // should in normally
            // ignore
        }

    return arr
}



var shuffleLine = function( pack, index ){

    var s = []
    for( var i=index.length*2-2; i--; )
        s.push({after: 0.15, before: 0.15})

    return {
        line: index.map(function(x){ return pack.line[ x ] }),
        width: index.map(function(x){ return pack.width[ x ] }),
        sharpness: s
    }
}
var shuffleShape = function( pack, index ){
    return {
        vertex: index.map(function(x){ return pack.vertex[ x ] }),
        sharpness: index.map(function(x){ return (pack.sharpness || {x: 0 })[ x ] })
    }
}
var pack = function( indexFn, aKey ){

    var l = ( aKey.pack.line || aKey.pack.vertex ).length

    var shuffle = aKey.pack.line ? shuffleLine : shuffleShape

    return shuffle( aKey.pack, indexFn( aKey.structuralChanges, l  ) )
}
var packOut = pack.bind( null, indexOut )
var packIn = pack.bind( null, indexIn )


/**
 * @param i   {Number}      is the index of the point in the aKey outpout !!! ( which is also the bKey input )
 */
var isConstraint = function( aKey, i ){

    var aSc = aKey.structuralChanges

    // find the index in the pack
    var ia
    var al = ( aKey.pack.line || aKey.pack.vertex ).length

    var indexA = indexOut( aSc, al )
    for( ia=0; indexA[ ia ] < i; ia++ );

    // check if the point is added or remove at this frame
    for( var k=aSc.length; k-- && aSc[k].i != ia ; );

    return k>= 0 ? aSc[k] : false
}

module.exports = {
    add: add,
    del: del,

    packOut: packOut,
    packIn: packIn,

    isConstraint: isConstraint,
}
