var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')

var init = function( modelBall ){

    this.model = {
        timeLineState: modelBall.timeLineState,
    }

    this.click = click.bind( this )

    return this
}

var enable = function(){
    this.disable()
    ed.listen( 'ui-tl-shortclick', this.click, this )
}
var disable = function(){
    ed.unlisten( 'ui-tl-shortclick', this )
}

var click = function( event ){

    if ( !event.primaryTarget )
        return

    var tls = this.model.timeLineState

    tls.cursor = tls.quantify( event.date )

    ed.dispatch( 'change:timeLineState-cursor', {
        wip: false
    })
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
