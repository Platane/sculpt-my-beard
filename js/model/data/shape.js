var Abstract = require('../../utils/Abstract')
  , historizable = require('../mixin/historizable')

  , pj = require('../../system/pathJob')
  , u = require('../../utils/point')

var init = function( ){

    // expose this
    this.vertex = [];
    this.sharpness = [];

    this.bezierPath = [];

    return this
}

var recompute = function(){
    this.bezierPath = pj.bezify( this.vertex, this.sharpness )
    return this
}

var pack = function(){
    return {
        vertex: this.vertex.slice().map( u.copy ),
        sharpness: historizable.deepCopy( this.sharpness )
    }
}

module.exports = Object.create( Abstract )
.extend( historizable )
.extend({
    init: init,
    recompute: recompute,
    pack: pack,
})
