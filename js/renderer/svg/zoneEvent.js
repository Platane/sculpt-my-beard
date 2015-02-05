var Abstract = require('../../utils/Abstract')
  , dom = require('../../utils/domHelper')

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
        this.ed.dispatch( 'ui-tic-'+event.type, {
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

    this.ed.dispatch( 'ui-zone-'+event.type, {
        mouseEvent: event,
        x     : x,
        y     : y,
        primaryTarget : backPrimaryTarget
    })

    if( event.type == 'wheel' && this.ed.hasListener( 'ui-zone-wheel' )) {
        event.stopPropagation()
        event.preventDefault()
    }
}


var init = function( modelBall, ed, domSvg ){

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
