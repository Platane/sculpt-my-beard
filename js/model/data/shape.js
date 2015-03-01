var Abstract = require('../../utils/Abstract')
  , historizable = require('../mixin/historizable')

  , pj = require('../../system/pathJob')
  , u = require('../../utils/point')

var init = function( ){

    // expose this
    this.vertex = []
    this.sharpness = []
    this.reindex

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

module.exports = Object.create( Abstract )
.extend( historizable )
.extend({
    init: init,
    recompute: recompute,
    pack: pack,
})
