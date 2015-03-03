var Abstract = require('../../utils/Abstract')
  , historizable = require('../mixin/historizable')

  , pj = require('../../system/pathJob')
  , u = require('../../utils/point')

var init = function( ){

    // expose this
    this.vertex = []
    this.sharpness = []
    this.reindexOut
    this.reindexIn

    this.bezierPath = []

    return this
}

var recompute = function(){
    this.bezierPath = pj.bezify( this.vertex, this.sharpness )
    return this
}

var pack = function(){
    return {
        vertex: historizable.deepCopy( this.vertex ),
        sharpness: historizable.deepCopy( this.sharpness ),
        reindex: this.reindex ? this.reindex.slice() : null
    }
}


var _flat = function( p, x, i ){
    return p && x == i
}
var isFlat = function( arr ){
    return arr.reduce( _flat, true )
}


/**
 * add a point which spawn from the from point, after or before it
 */
var addPoint = function( from, after, point ){

    point = point || {}

    var i = after ? from + 1 : from

    // instanciate the reindex if needed
    if ( !this.reindexOut )
        this.reindexOut = this.vertex.map(function( _ , i ){ return i })

    if ( !this.reindexIn )
        this.reindexIn = this.vertex.map(function( _ , i ){ return i })

    // alter the reindex out
    // the out vector should show that the new point is at the same position as the origin
    this.reindexOut.splice( i, 0, from )
    for( var k = after ? i+1 : from; k<this.reindexOut.length; k++ )
        this.reindexOut[ k ] ++

    // alter the reindex in
    // the in vector should not show the new point
    for( var k = i; k<this.reindexIn.length; k++ )
        this.reindexIn[ k ] ++

    // set the reindex to null if possible
    if( isFlat( this.reindexOut ) )
        this.reindexOut = null

    if( isFlat( this.reindexIn ) )
        this.reindexIn = null



    this.vertex.splice( i, 0, point.vertex || {x:0, y:0} )
    this.sharpness.splice( i, 0, point.vertex || {after:0, before:0} )

    return this
}



/**
 * remove a point which is at the at index and is absorbed by the one after or before
 */
var removePoint = function( at, after ){

    // instanciate the reindex if needed
    if ( !this.reindexIn )
        this.reindexIn = this.vertex.map(function( _ , i ){ return i })

    if ( !this.reindexOut )
        this.reindexOut = this.vertex.map(function( _ , i ){ return i })

    // alter the reindex out
    // the out vector should not show the removed point
    this.reindexOut.splice( at, 1 )
    for( var k = at ; k<this.reindexOut.length; k++ )
        this.reindexOut[ k ] --

    // alter the reindex in
    // the in vector should show the removed ponit as merger with after / before
    this.reindexIn[ at ] = ( after ? at+1 : at+this.reindexIn.length-1 ) % this.reindexIn.length
    for( var k = at ; k<this.reindexIn.length; k++ )
        this.reindexIn[ k ] --

    // set the reindex to null if possible
    if( isFlat( this.reindexOut ) )
        this.reindexOut = null

    if( isFlat( this.reindexIn ) )
        this.reindexIn = null

    this.vertex.splice( at, 1 )
    this.sharpness.splice( at, 1 )

    return this
}

module.exports = Object.create( Abstract )
.extend( historizable )
.extend({
    init: init,
    recompute: recompute,
    pack: pack,
    addPoint: addPoint,
    removePoint: removePoint,
})
