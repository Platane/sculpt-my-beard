var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')

var init = function( modelBall ){

    this.model = {
        face: modelBall.face,
        timeLine: modelBall.timeLine,
        timeLineState: modelBall.timeLineState,
    }

    this.keyDown = keyDown.bind( this )
    this.keyMove = keyMove.bind( this )
    this.keyUp = keyUp.bind( this )

    return this
}

var enable = function(){
    this.disable()
    ed.listen( 'ui-tlKey-mousedown', this.keyDown, this )
}
var disable = function(){
    ed.unlisten( 'ui-tlKey-mousedown', this )
    ed.unlisten( 'ui-tl-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
}


var keyDown = function( event ){
    this._chunk = event.chunk
    this.h = event.y
    this._key = this.model.timeLine.keys[ event.chunk ][ event.i ]
    this._removed = false


    ed.unlisten( 'ui-tl-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
    ed.listen( 'ui-tl-mousemove', this.keyMove, this )
    ed.listen( 'ui-mouseup', this.keyUp, this )
}
var keyMove = function( event ){

    var tls = this.model.timeLineState

    if( Math.abs( this.h - event.y ) > 30 ){

        if( !this._removed ) {

            this.model.timeLine.removeKey( this._chunk, this._key )

            this._removed = true

            ed.dispatch( 'change:timeLine', {
                wip: true
            })
        }

    } else {

        if( !this._removed ) {

            this.model.timeLine.setKeyDate( this._chunk, this._key, event.date )
        } else {
            this._key = this.model.timeLine.addOrSetKey( this._chunk, event.date, this._key.pack )

            this._removed = false
        }

        ed.dispatch( 'change:timeLine', {
            wip: true
        })
    }
}
var keyUp = function( event ){

    ed.unlisten( 'ui-tl-mousemove', this )
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
