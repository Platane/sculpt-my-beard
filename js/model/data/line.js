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
        sharpness: h.deepCopy( this.sharpness ),
        reindex: this.reindex ? this.reindex.slice() : null
    }
}

var addPoint =  function(){}
var removePoint =  function(){}

module.exports = Object.create( Shape ).extend({
    init: init,
    recompute: recompute,
    pack: pack,
    addPoint: addPoint,
    removePoint: removePoint,
})
