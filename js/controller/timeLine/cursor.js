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
}

var CurDown = function( event ){
    this._origin = this.model.timeLineState.project( event.date )
    this._anchor = event.mouseEvent.pageX

    ed.unlisten( 'ui-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
    ed.listen( 'ui-mousemove', this.CurMove, this )
    ed.listen( 'ui-mouseup', this.CurUp, this )
}
var CurMove = function( event ){
    var tls = this.model.timeLineState
    var newDate = tls.unproject( this._origin + event.mouseEvent.pageX - this._anchor )

    tls.cursor = newDate

    ed.dispatch( 'change:timeLineState', {
        wip: true
    })
}
var CurUp = function( event ){

    var tls = this.model.timeLineState

    tls.cursor = tls.quantify( tls.cursor )

    ed.unlisten( 'ui-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )

    ed.dispatch( 'change:timeLineState', {
        wip: false
    })
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
