var Abstract = require('../utils/Abstract')
, ed = require('../system/eventDispatcher')

var init = function( modelBall ){

    this.changePoint = changePoint.bind( this )

    return this
}

var enable = function(){
    this.disable()
    ed.listen( 'change:point', this.changePoint, this )
}
var disable = function(){
    ed.unlisten( 'change:point', this )
}

var changePoint = function( event ){

    event.shape.recompute();

    ed.dispatch( 'change:shape', {
        wip: event.wip,
        is_interpolation: event.is_interpolation,
        shape: event.shape
    })
}
module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
