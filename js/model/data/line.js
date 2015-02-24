var Shape = require('./shape')
  , pj = require('../../system/pathJob')
  , u = require('../../utils/point')
  , h = require('../../model/mixin/historizable')

var init = function(){

    Shape.init.call( this )

    this.line = []
    this.width = []

    return this
}

var recompute = function(){

    this.vertex = pj.expandMustach( this.line, this.width )

    return Shape.recompute.call( this )
}

var pack = function(){
    return {
        line: h.deepCopy( this.line ),
        width: this.width.slice(),
        sharpness: h.deepCopy( this.sharpness )
    }
}

module.exports = Object.create( Shape ).extend({
    init: init,
    recompute: recompute,
    pack: pack,
})
