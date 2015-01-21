var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')
  , dom = require('../../utils/domHelper')

var handler = function( event ){
    ed.dispatch( 'ui-'+event.type, {
        mouseEvent: event
    })
}

var relayEvent = function( event ){

    // only consider main button ( button == 0 )
    if( event.which !== 1 )
        return

    var classes = event.target.getAttribute('class').split(' ')

    var o = dom.offset( event.target )
    var x = event.pageX - o.left
    var y = event.pageY - o.top


    var backPrimaryTarget = true

    if( classes.indexOf('control-tic')>=0 && event.type != 'wheel' ) {
        ed.dispatch( 'ui-tic-'+event.type, {
            mouseEvent: event,
            pool  : event.target.getAttribute('data-pool'),
            chunk : event.target.getAttribute('data-chunk'),
            i     : event.target.getAttribute('data-i'),
            x     : x,
            y     : y,
            primaryTarget : true
        })
        backPrimaryTarget = false
    }

    ed.dispatch( 'ui-zone-'+event.type, {
        mouseEvent: event,
        x     : x,
        y     : y,
        primaryTarget : backPrimaryTarget
    })

    if( event.type == 'wheel' ) {
        event.stopPropagation()
        event.preventDefault()
    }
}


var init = function( modelBall, domSvg ){

    domSvg.addEventListener( 'mousedown', relayEvent, false )
    domSvg.addEventListener( 'mousemove', relayEvent, false )
    domSvg.addEventListener( 'mouseup', relayEvent, false )

    domSvg.addEventListener( 'wheel', relayEvent, false )

    this.domSvg = domSvg

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init
})
