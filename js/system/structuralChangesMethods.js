var lerpFn = require('./interpolate').lerpFn


var pushPointShape = function( aPack, i, k ){

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
 * @param i   {Number}      is the index of the point in the aKey outpout !!! ( which is also the bKey input )
 * @param k   {Number}      point is located at a*(1-k) + b*k
 */
var add = function( aKey, bKey, i, k ){


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
    pushPointShape( aKey.pack, ia, k )



        // after
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
    pushPointShape( bKey.pack, ib, k )


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

    return {
        line: pack[ i ].line,
        width: pack[ i ].width,
        sharpness: pack[ i ].sharpness
    }
}
var shuffleShape = function( pack, index ){
    return {
        vertex: index.map(function(x){ return pack.vertex[ x ] }),
        sharpness: index.map(function(x){ return (pack.sharpness || {x: 0 })[ x ] })
    }
}
var packOut = function( aKey ){

    var l = ( aKey.pack.line || aKey.pack.vertex ).length

    return shuffleShape( aKey.pack, indexOut( aKey.structuralChanges, l  ) )
}
var packIn = function( aKey ){

    var l = ( aKey.pack.line || aKey.pack.vertex ).length

    return shuffleShape( aKey.pack, indexIn( aKey.structuralChanges, l  ) )
}



module.exports = {
    add: add,
    del: del,
    packOut: packOut,
    packIn: packIn,
}
