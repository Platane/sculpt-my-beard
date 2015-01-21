var Abstract = require('../utils/Abstract')
  , ed = require('../system/eventDispatcher')

var handler = function( event ){
    ed.dispatch( 'ui-'+event.type, {
        mouseEvent: event
    })
}

var init = function( modelBall ){

    document.addEventListener( 'mousedown', handler, false )
    document.addEventListener( 'mousemove', handler, false )
    document.addEventListener( 'mouseup', handler, false )

    document.addEventListener( 'keydown', handler, false )
    
    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init
})
