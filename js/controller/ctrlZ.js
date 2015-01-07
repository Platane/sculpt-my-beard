var Abstract = require('../utils/Abstract')
  , ed = require('../system/eventDispatcher')

var init = function( modelBall ){

    this.model = {
        history: modelBall.history
    }

    this.keyDown = keyDown.bind( this )

    return this
}

var keyDown = function( event ){
    if ( !event.mouseEvent.ctrlKey )
        return

    switch( event.mouseEvent.which ){
        case 90 :  // z
            if ( this.model.history.undo() !== false )
                ed.dispatch( 'history:undo')
            else
                ed.dispatch( 'history:nothing-to-undo')
            break;

        case 89 :  // z
            if ( this.model.history.redo() !== false )
                ed.dispatch( 'history:redo')
            else
                ed.dispatch( 'history:nothing-to-redo')
            break;
    }
}

var enable = function(){
    this.disable()
    ed.listen( 'ui-keydown', this.keyDown, this )
}
var disable = function(){
    ed.unlisten( 'ui-keydown', this )
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
