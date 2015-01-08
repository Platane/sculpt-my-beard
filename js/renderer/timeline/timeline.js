var Abstract = require('../../utils/Abstract')
  , dom = require('../../utils/domHelper')
  , ed = require('../../system/eventDispatcher')
  , Ruler = require('./ruler')


var key_tpl = [
'<div class="tl-key">',
'</div>',
].join('')

var label_tpl = [
'<div class="tl-row">',
    '<span class="tl-label"></span>',
'</div>',
].join('')

var row_tpl = [
'<div class="tl-row">',
'</div>',
].join('')

var tpl = [
'<div class="tl">',
    '<div class="tl-left">',
        '<div class="tl-block-label"></div>',
    '</div>',
    '<div class="tl-right">',
        '<div class="tl-block-lines"></div>',
    '</div>',
'</div>',
].join('')


var getDate = function( mouseEvent ){
    var o = dom.offset( this.domEl.querySelector('.tl-block-lines') ).left
    var x = mouseEvent.pageX
    return this.model.timeLineState.unproject( x-o )
}
var relayEvent = function( event ){

    // only consider main button ( button == 0 )
    if( event.button )
        return

    var key, line
    if( key = dom.getParent( event.target, 'tl-key' ) )
        return ed.dispatch( 'ui-tlKey-'+event.type, {
            mouseEvent: event,
            chunk: dom.getParent( key, 'tl-row' ).getAttribute('data-chunk'),
            i: key.getAttribute('data-i'),
            date: getDate.call( this, event )
        })

    if( line = dom.getParent( event.target, 'tl-row' ) )
        return ed.dispatch( 'ui-tlLine-'+event.type, {
            mouseEvent: event,
            chunk: line.getAttribute('data-chunk'),
            date: getDate.call( this, event )
        })
}

var render = function( ){
    var timeLine = this.model.timeLine
    var proj = this.model.timeLineState.unproject

    // for each chunk
    for( var k in this.domLines ){

        // clean up
        var c = this.domLines[ k ].children;
        for( var i=c.length; i--; )
            c[ i ].remove()

        // for each key
        for( var i=(timeLine.keys[ k ]||[]).length; i--; ){

            var dk = dom.domify( key_tpl )
            dk.setAttribute( 'data-i', i )
            dk.style.left = (proj( timeLine.keys[ k ][ i ].date ) -5)+'px'

            this.domLines[ k ].appendChild( dk )

        }
    }

}

var build = function( ){
    var face = this.model.face

    this.domEl = dom.domify( tpl )

    var labels = this.domEl.querySelector('.tl-block-label'),
        lines = this.domEl.querySelector('.tl-block-lines')

    this.domEl.querySelector('.tl-right').insertBefore( this.ruler.domEl, lines )

    this.domLines = {}

    var k=0
    for( var i in face.chunk ){
        var label = dom.domify( label_tpl )
        var row = dom.domify( row_tpl )

        label.querySelector('.tl-label').innerHTML = i.replace('_', ' ')

        row.setAttribute('data-chunk', i)

        labels.appendChild( label )
        lines.appendChild( row )

        this.domLines[ i ] = row
    }
}

var init = function( modelBall, body ){

    this.model = {
        face: modelBall.face,
        timeLineState: modelBall.timeLineState,
        timeLine: modelBall.timeLine,
    }

    this.ruler = Object.create( Ruler ).init( modelBall )

    build.call( this )

    body.appendChild( this.domEl )

    ed.listen( 'change:timeLine' , render.bind( this ) , this )
    ed.listen( 'render' , render.bind( this ) , this )

    this.domEl.querySelector('.tl-block-lines').addEventListener('mousedown', relayEvent.bind(this), false )
    this.domEl.querySelector('.tl-block-lines').addEventListener('doubleclick', relayEvent.bind(this), false )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
    render: render
})
