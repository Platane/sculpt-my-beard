var Abstract = require('../../utils/Abstract')
, ed = require('../../system/eventDispatcher')

var init = function( modelBall ){

    this.model = {
        camera: modelBall.camera
    }

    this.mouseMove = mouseMove.bind( this )
    this.mouseUp = mouseUp.bind( this )
    this.mouseDown = mouseDown.bind( this )
    this.wheel = wheel.bind( this )

    return this
}

var enable = function(){
    this.disable()
    ed.listen( 'ui-zone-mousedown', this.mouseDown, this )
    ed.listen( 'ui-zone-wheel', this.wheel, this )
}
var disable = function(){
    ed.unlisten( 'ui-tic-mousedown', this )
    ed.unlisten( 'ui-zone-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
}

var wheel = function( event ){

    if( this.model.camera.setZoom(
        this.model.camera.zoom + ( event.mouseEvent.deltaY<0 ? 1 : -1 ),
        event.x,
        event.y )
    )
        ed.dispatch( 'change:camera', {
            wip: false
        })

}
var mouseDown = function( event ){

    if ( !event.primaryTarget )
        return

    this._origin = {
        x: this.model.camera.origin.x,
        y: this.model.camera.origin.y
    }
    this._anchor = {
        x: event.x,
        y: event.y
    }

    ed.listen( 'ui-zone-mousemove', this.mouseMove, this )
    ed.listen( 'ui-mouseup', this.mouseUp, this )
}

var mouseMove = function( event ){

    this.model.camera.origin.x = this._origin.x + ( this._anchor.x - event.x ) / this.model.camera._zoom
    this.model.camera.origin.y = this._origin.y + ( this._anchor.y - event.y ) / this.model.camera._zoom

    ed.dispatch( 'change:camera', {
        wip: true
    })
}

var mouseUp = function( event ){

    ed.dispatch( 'change:camera', {
        wip: false
    })

    ed.unlisten( 'ui-zone-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
}


module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
