var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')

var init = function( modelBall ){

    this.model = {
        timeLineState: modelBall.timeLineState,
    }

    this.CurDown = CurDown.bind( this )
    this.CurMove = CurMove.bind( this )
    this.CurUp = CurUp.bind( this )

    return this
}

var enable = function(){
    this.disable()
    ed.listen( 'ui-tlCursor-mousedown', this.CurDown, this )
}
var disable = function(){
    ed.unlisten( 'ui-tlCursor-mousedown', this )
    ed.unlisten( 'ui-tl-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
}

var CurDown = function( event ){

    if ( !event.primaryTarget )
        return

    ed.unlisten( 'ui-tl-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
    ed.listen( 'ui-tl-mousemove', this.CurMove, this )
    ed.listen( 'ui-mouseup', this.CurUp, this )
}
var CurMove = function( event ){

    this.model.timeLineState.cursor = event.date

    ed.dispatch( 'change:timeLineState-cursor', {
        wip: true
    })
}
var CurUp = function( event ){

    var tls = this.model.timeLineState

    tls.cursor = tls.quantify( tls.cursor )

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
