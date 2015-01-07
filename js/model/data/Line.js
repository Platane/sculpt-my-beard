var Shape = require('./Shape')
  , ed = require('../../system/eventDispatcher')
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

var unpack = function( o ){
    this.line = o.line
    this.width = o.width
    this.sharpness = o.sharpness

    ed.dispatch( 'change:shape', {
        shape: this
    })

    return this
}

module.exports = Object.create( Shape ).extend({
    init: init,
    recompute: recompute,
    pack: pack,
    unpack: unpack,
})
