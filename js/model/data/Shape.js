var Abstract = require('../../utils/Abstract')
  , historizable = require('../mixin/historizable')

  , ed = require('../../system/eventDispatcher')
  , pj = require('../../system/pathJob')
  , u = require('../../utils/point')

var init = function( ){

    // expose this
    this.vertex = [];
    this.sharpness = [];

    this.bezierPath = [];

    // listen to change
    ed.listen( 'change:point' , changed.bind( this ), this )

    return this
}
var changed = function( event ){
    if( event.shape !== this )
        return

    this.recompute()
    ed.dispatch( 'change:shape', {
        shape: this
    })
}

var recompute = function(){
    this.bezierPath = pj.bezify( this.vertex, 0.15 )
    return this
}

var pack = function(){
    return {
        vertex: this.vertex.slice().map( u.copy ),
        // TODO deep copy this
        sharpness: this.sharpness.slice()
    }
}

var unpack = function( o ){
    this.vertex = o.vertex
    this.sharpness = o.sharpness

    ed.dispatch( 'change:shape', {
        shape: this
    })

    return this
}

module.exports = Object.create( Abstract )
.extend( historizable )
.extend({
    init: init,
    recompute: recompute,
    pack: pack,
    unpack: unpack,
})
