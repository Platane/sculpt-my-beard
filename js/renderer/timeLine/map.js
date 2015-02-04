var Abstract = require('../../utils/Abstract')
  , dom = require('../../utils/domHelper')
  , ed = require('../../system/eventDispatcher')
  , hist = require('../../system/histogram')
  , svg = require('../svg/svg-util')


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

var renderHistogram = function( ){

    var d = hist.discretise( this.model.timeLine.keys, 2)

    // empty
    this.domHist.innerHTML = ''

    // compute start value
    var s = this.start + ( d.offset - this.start ) % d.w

    for ( var i=s; i<this.end; i+= d.w ) {

        var k = ( i-d.offset ) / d.w
        var y = k<0 || k>=d.q.length ? 0 : d.q[ k ]

        if (!y)
            continue

        var x = (i + d.w/2 - 0.5 - this.start )/( this.end - this.start )
        var r = y * 4
        var circle = document.createElement('div')
        circle.setAttribute( 'class', 'tlm-histogram-point' )
        circle.style.width = circle.style.height = r+'px'
        circle.style.left = 'calc('+ ( x*100 ) +'% - '+ (r/2) +'px )'
        circle.style.top = 'calc( 50% - '+ (r/2) +'px)'

        this.domHist.appendChild( circle )
    }


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
    renderHistogram.call( this )
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

    this.domSvg = svg.create('svg')
    this.domHist = document.createElement('div')
    //this.domHist = svg.create('g')
    this.domHist.setAttribute('class', 'tlm-histogram')

    container.appendChild( this.domHist )
    container.appendChild( this.domFrame )
    container.appendChild( this.domCursor )

}

var init = function( modelBall, ed, container ){

    this.model = {
        timeLineState: modelBall.timeLineState,
        timeLine: modelBall.timeLine
    }

    build.call( this, container )

    ed.listen( 'change:timeLineState-cursor' , render.bind( this ) , this )
    ed.listen( 'change:timeLineState-viewport' , render.bind( this ) , this )
    ed.listen( 'change:timeLine' , render.bind( this ) , this )

    //this.domEl.addEventListener('mousedown', relayEvent.bind(this), false )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init
})
