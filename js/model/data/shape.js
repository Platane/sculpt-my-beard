var Abstract = require('../../utils/Abstract')
  , historizable = require('../mixin/historizable')

  , pj = require('../../system/pathJob')
  , sc = require('../../system/structuralChangesMethods')
  , u = require('../../utils/point')

var init = function( ){

    // expose this
    this.vertex = []
    this.sharpness = []

    this.bezierPath = []

    this.structuralChanges = []

    return this
}

/**
 *
 * Structural changes spec
 *
 *  - will hold the add / remove that happend on the shape at this specific frame
 *
 *  { type: add|del, a: number index, b: number index,  k: number ( p = a*(k-1) + b*k ) }
 *
 */

var recompute = function(){
    this.bezierPath = pj.bezify( this.vertex, this.sharpness )
    return this
}

var pack = function(){
    return {
        vertex: historizable.deepCopy( this.vertex ),
        sharpness: historizable.deepCopy( this.sharpness ),
        structuralChanges: historizable.deepCopy( this.structuralChanges ),
    }
}

var addPoint = function( at, k ){

    // compute point position
    var p = u.lerp( this.vertex[ at ], this.vertex[ (at+1)%this.vertex.length ], k )

    // compute point sharpness
    var s = {after:0.5, before:0.5}

    this.vertex.splice( at+1, 0, p )
    this.sharpness.splice( at+1, 0, s )

    sc.add( this.structuralChanges, at+1, k )
}
var removePoint = function( at, k ){

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
