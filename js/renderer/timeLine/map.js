var Abstract = require('../../utils/Abstract')
  , dom = require('../../utils/domHelper')
  , ed = require('../../system/eventDispatcher')


var computeBorne = function(){
    var tl = this.model.timeLine
    var tls = this.model.timeLineState


    // compute interal
    var end = tls.cursor
    var start = tls.cursor
    for ( var i in tl.keys )
        if ( tl.keys[ i ].length ){

            end = Math.max( end, tl.keys[ i ][ tl.keys[ i ].length-1 ].date )
            start = Math.min( start, tl.keys[ i ][ 0 ].date )

        }

    start = Math.min( start, tls.origin )
    end = Math.max( end, tls.origin + tls.window )

    end += 5
    start -= 5

    var hasChanged = this.end !== end || this.start !== start

    this.end = end
    this.start = start

    return hasChanged
}

var renderFrame = function( ){

    this.domFrame.style.width = ( this.model.timeLineState.window / ( this.end - this.start ) *100)+'%'
    this.domFrame.style.left = ( ( this.model.timeLineState.origin - this.start ) / ( this.end - this.start ) *100)+'%'
}
var renderCursor = function( ){

    this.domCursor.style.left = ( ( this.model.timeLineState.cursor - this.start ) / ( this.end - this.start ) *100)+'%'
}

var render = function(){
    computeBorne.call( this )
    renderFrame.call( this )
    renderCursor.call( this )
}

var tpl_frame = [
'<div class="tlm-frame">',
'</div>',
].join('')

var tpl_cursor = [
'<div class="tlm-cursor">',
'</div>',
].join('')

var build = function( container ){

    dom.addClass( container, 'tlm' )

    this.domFrame = dom.domify( tpl_frame )
    this.domCursor = dom.domify( tpl_cursor )

    container.appendChild( this.domFrame )
    container.appendChild( this.domCursor )
}

var init = function( modelBall, container ){

    this.model = {
        timeLineState: modelBall.timeLineState,
        timeLine: modelBall.timeLine
    }

    build.call( this, container )

    ed.listen( 'change:timeLineState-cursor' , render.bind( this ) , this )
    ed.listen( 'change:timeLineState-viewport' , render.bind( this ) , this )

    //this.domEl.addEventListener('mousedown', relayEvent.bind(this), false )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init
})
