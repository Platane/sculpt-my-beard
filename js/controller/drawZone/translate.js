var Abstract = require('../../utils/Abstract')

var init = function( modelBall, ed ){

    this.model = {
        camera: modelBall.camera
    }

    this.ed = ed

    this.mouseMove = mouseMove.bind( this )
    this.mouseUp = mouseUp.bind( this )
    this.mouseDown = mouseDown.bind( this )

    return this
}

var enable = function(){
    this.disable()
    this.ed.listen( 'ui-zone-mousedown', this.mouseDown )
}
var disable = function(){
    this.ed.unlisten( 'ui-zone-mousedown', this.mouseDown )
    this.ed.unlisten( 'ui-zone-mousemove', this.mouseMove )
    this.ed.unlisten( 'ui-mouseup', this.mouseUp )
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

    this.ed.listen( 'ui-zone-mousemove', this.mouseMove )
    this.ed.listen( 'ui-mouseup', this.mouseUp )
}

var mouseMove = function( event ){

    this.model.camera.origin.x = this._origin.x + ( this._anchor.x - event.x ) / this.model.camera._zoom
    this.model.camera.origin.y = this._origin.y + ( this._anchor.y - event.y ) / this.model.camera._zoom

    this.ed.dispatch( 'change:camera', {
        wip: true
    })
}

var mouseUp = function( event ){

    this.ed.dispatch( 'change:camera', {
        wip: false
    })

    this.ed.unlisten( 'ui-zone-mousemove', this.mouseMove )
    this.ed.unlisten( 'ui-mouseup', this.mouseUp )
}


module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
