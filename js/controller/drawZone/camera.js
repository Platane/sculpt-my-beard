var Abstract = require('../../utils/Abstract')
, ed = require('../../system/eventDispatcher')

var init = function( modelBall ){

    this.model = {
        camera: modelBall.camera
    }

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
    ed.unlisten( 'ui-mousemove', this )
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
/*
    this._shape = this.model.face.chunk[ event.chunk ]
    this._point = this._shape[ event.pool ][ event.i ]
    this._origin = {
        x: this._point.x,
        y: this._point.y
    }
    this._anchor = {
        x: event.mouseEvent.pageX,
        y: event.mouseEvent.pageY
    }

    ed.listen( 'ui-mousemove', this.ticMove, this )
    ed.listen( 'ui-mouseup', this.ticUp, this )*/
}

var ticMove = function( event ){
    this._point.x = this._origin.x + event.mouseEvent.pageX - this._anchor.x
    this._point.y = this._origin.y + event.mouseEvent.pageY - this._anchor.y

    ed.dispatch( 'change:point', {
        point: this._point,
        shape: this._shape,
        wip: true
    })
}

var ticUp = function( event ){

    ed.dispatch( 'change:point', {
        point: this._point,
        shape: this._shape,
        wip: false
    })

    ed.unlisten( 'ui-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
}


module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
