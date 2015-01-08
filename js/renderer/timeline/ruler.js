var Abstract = require('../../utils/Abstract')
, dom = require('../../utils/domHelper')
, ed = require('../../system/eventDispatcher')





var getDate = function( mouseEvent ){
    var o = this.domEl.querySelector('.tl-lines-viewport').offsetLeft
    var x = mouseEvent.pageX
    return this.model.timeLineState.unproject( x-o )
}
var relayEvent = function( event ){
/*
    return ed.dispatch( 'ui-tlKey-'+event.type, {

    })*/
}

var render = function( ){

}

var tpl = [
'<div class="tl-ruler">',
    '<div class="tl-cursor"></div>',
    '<div class="tl-ruler-grid"></div>',
'</div>',
].join('')

var build = function( ){

    this.domEl = dom.domify( tpl )

    this.domCursor = this.domEl.querySelector('.tl-cursor')
}

var init = function( modelBall, body ){

    this.model = {
        timeLineState: modelBall.timeLineState,
    }

    build.call( this )

    ed.listen( 'change:timeLineState' , render.bind( this ) , this )

    this.domEl.addEventListener('mousedown', relayEvent.bind(this), false )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
    render: render
})
