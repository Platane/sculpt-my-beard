var Shape = require('./shape')
  , pj = require('../../system/pathJob')
  , u = require('../../utils/point')

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
        line: this.line.slice().map( u.copy ),
        width: this.width.slice(),
        // TODO deep copy this
        sharpness: this.sharpness.slice()
    }
}

module.exports = Object.create( Shape ).extend({
    init: init,
    recompute: recompute,
    pack: pack,
})
