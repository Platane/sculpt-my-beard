var Abstract = require('../../utils/Abstract')
, ed = require('../../system/eventDispatcher')

var init = function( modelBall ){

    this.model = {
        timeLineState: modelBall.timeLineState,
    }

    this.mouseDown = mouseDown.bind( this )
    this.mouseMove = mouseMove.bind( this )
    this.mouseUp = mouseUp.bind( this )

    return this
}

var enable = function(){
    this.disable()
    ed.listen( 'ui-tl-mousedown', this.mouseDown, this )
}
var disable = function(){
    ed.unlisten( 'ui-tl-mousedown', this )
    ed.unlisten( 'ui-tl-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
}

var mouseDown = function( event ){

    if ( !event.primaryTarget )
        return

    this._anchor = event.xPer
    this._origin = this.model.timeLineState.origin

    ed.listen( 'ui-tl-mousemove', this.mouseMove, this )
    ed.listen( 'ui-mouseup', this.mouseUp, this )
}
var mouseMove = function( event ){

    var tls = this.model.timeLineState

    tls.origin = this._origin - ( event.xPer - this._anchor ) * tls.window

    ed.dispatch( 'change:timeLineState-viewport', {
        wip: true
    })
}
var mouseUp = function( event ){

    ed.unlisten( 'ui-tl-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )

    ed.dispatch( 'change:timeLineState-cursor', {
        wip: false
    })
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
