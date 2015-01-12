var Abstract = require('../../utils/Abstract')
, ed = require('../../system/eventDispatcher')

var init = function( modelBall ){

    this.model = {
        face: modelBall.face,
        timeLine: modelBall.timeLine,
        timeLineState: modelBall.timeLineState,
    }

    this.lineClick = lineClick.bind( this )
    this.keyDown = keyDown.bind( this )
    this.keyMove = keyMove.bind( this )
    this.keyUp = keyUp.bind( this )

    return this
}

var enable = function(){
    this.disable()
    ed.listen( 'ui-tlLine-doubleclick', this.lineClick, this )
    ed.listen( 'ui-tlKey-mousedown', this.keyDown, this )
}
var disable = function(){
    ed.unlisten( 'ui-tlLine-doubleclick', this )
    ed.unlisten( 'ui-tlKey-doubleclick', this )
}

var lineClick = function( event ){
    var shape = this.model.face.chunk[ event.chunk ]
    var date = event.date
    var tls = this.model.timeLineState

    this.model.timeLine.addOrSetKey( event.chunk, tls.quantify(date), shape.pack() );

    ed.dispatch( 'change:timeLine', {
        wip: false
    })
}
var keyDown = function( event ){
    this._chunk = event.chunk
    this._origin = this.model.timeLineState.project( event.date )
    this.h = event.mouseEvent.pageY
    this._anchor = event.mouseEvent.pageX
    this._key = this.model.timeLine.keys[ event.chunk ][ event.i ]
    this._removed = false


    ed.unlisten( 'ui-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
    ed.listen( 'ui-mousemove', this.keyMove, this )
    ed.listen( 'ui-mouseup', this.keyUp, this )
}
var keyMove = function( event ){

    var tls = this.model.timeLineState

    if( Math.abs( this.h - event.mouseEvent.pageY ) > 50 ){

        if( !this._removed ) {

            this.model.timeLine.removeKey( this._chunk, this._key )

            this._removed = true

            ed.dispatch( 'change:timeLine', {
                wip: true
            })
        }

    } else {

        var newDate = tls.unproject( this._origin + event.mouseEvent.pageX - this._anchor )

        if( !this._removed ) {

            this.model.timeLine.setKeyDate( this._chunk, this._key, newDate )
        } else {
            this._key = this.model.timeLine.addOrSetKey( this._chunk, newDate, this._key.pack )

            this._removed = false
        }

        ed.dispatch( 'change:timeLine', {
            wip: true
        })
    }
}
var keyUp = function( event ){

    ed.unlisten( 'ui-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )

    var tls = this.model.timeLineState

    this.model.timeLine.setKeyDate( this._chunk, this._key, tls.quantify( this._key.date ) )

    ed.dispatch( 'change:timeLine', {
        wip: false
    })
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
