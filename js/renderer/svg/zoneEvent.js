var Abstract = require('../../utils/Abstract')
  , dom = require('../../utils/domHelper')

var relayEvent = function( event ){

    // only consider main button ( button == 0 )
    if( event.which !== 1 )
        return

    var classes = event.target.getAttribute('class').split(' ')

    var o = dom.offset( event.target )
    var screenX = event.pageX - o.left
    var screenY = event.pageY - o.top

    var p = this.model.camera.unproject({x:screenX, y:screenY})


    var backPrimaryTarget = true

    if( classes.indexOf('control-tic')>=0 && event.type != 'wheel' ) {
        this.ed.dispatch( 'ui-tic-'+event.type, {
            mouseEvent: event,
            pool  : event.target.getAttribute('data-pool'),
            chunk : event.target.getAttribute('data-chunk'),
            i     : event.target.getAttribute('data-i'),
            x     : p.x,
            y     : p.y,
            screenY     : screenY,
            screenX     : screenX,
            primaryTarget : true
        })
        backPrimaryTarget = false
    }
    else if( classes.indexOf('control-width-tic')>=0 && event.type != 'wheel' ) {
        this.ed.dispatch( 'ui-width-tic-'+event.type, {
            mouseEvent: event,
            chunk : event.target.getAttribute('data-chunk'),
            i     : event.target.getAttribute('data-i'),
            x     : p.x,
            y     : p.y,
            screenY     : screenY,
            screenX     : screenX,
            primaryTarget : true
        })
        backPrimaryTarget = false
    }
    else if( classes.indexOf('control-sharpness-tic')>=0 && event.type != 'wheel' ) {
        this.ed.dispatch( 'ui-sharpness-tic-'+event.type, {
            mouseEvent: event,
            chunk : event.target.getAttribute('data-chunk'),
            i     : event.target.getAttribute('data-i'),
            sens  : event.target.getAttribute('data-sens'),
            x     : p.x,
            y     : p.y,
            screenY     : screenY,
            screenX     : screenX,
            primaryTarget : true
        })
        backPrimaryTarget = false
    }

    this.ed.dispatch( 'ui-zone-'+event.type, {
        mouseEvent: event,
        x     : p.x,
        y     : p.y,
        screenY     : screenY,
        screenX     : screenX,
        primaryTarget : backPrimaryTarget
    })

    if( event.type == 'wheel' && this.ed.hasListener( 'ui-zone-wheel' )) {
        event.stopPropagation()
        event.preventDefault()
    }
}


var init = function( modelBall, ed, domSvg ){

    this.model = {
        camera: modelBall.camera,
    }

    var relay = relayEvent.bind( this )

    domSvg.addEventListener( 'mousedown', relay , false )
    domSvg.addEventListener( 'mousemove', relay, false )
    domSvg.addEventListener( 'mouseup', relay, false )

    domSvg.addEventListener( 'wheel', relay, false )

    this.ed = ed

    this.domSvg = domSvg

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init
})
