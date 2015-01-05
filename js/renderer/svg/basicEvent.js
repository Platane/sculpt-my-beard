var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')

var handler = function( event ){
    ed.dispatch( 'ui-'+event.type, {
        mouseEvent: event
    })
}

var init = function( modelBall, domSvg ){

    domSvg.addEventListener( 'mousedown', handler, false )
    domSvg.addEventListener( 'mousemove', handler, false )
    domSvg.addEventListener( 'mouseup', handler, false )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init
})
