var Abstract = require('../../utils/Abstract')

var init = function( modelBall, ed ){

    this.model = {
        camera: modelBall.camera
    }

    this.ed = ed

    this.wheel = wheel.bind( this )

    return this
}

var enable = function(){
    this.disable()
    this.ed.listen( 'ui-zone-wheel', this.wheel )
}
var disable = function(){
    this.ed.unlisten( 'ui-zone-wheel', this.wheel )
}

var wheel = function( event ){

    if( this.model.camera.setZoom(
        this.model.camera.zoom + ( event.mouseEvent.deltaY<0 ? 1 : -1 ),
        event.screenX,
        event.screenY )
    )
        this.ed.dispatch( 'change:camera', {
            wip: false
        })
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
