var Abstract = require('../../utils/Abstract')
  , dom = require('../../utils/domHelper')
  , ed = require('../../system/eventDispatcher')


var toolBar_tpl = [

].join('')


var key_tpl = [
'<div class="tl-key">',
'</div>',
].join('')

var label_tpl = [
'<div class="tl-row">',
    '<svg class="tl-icon" viewBox="0 0 100 100"><path d="M50 0L93.3 25L93.3 75L50 100L6.7 75L6.7 25z"></path></svg>',
    '<span class="tl-label"></span>',
    '<div class="tl-toolBar"></div>',
'</div>',
].join('')

var row_tpl = [
'<div class="tl-row">',
'</div>',
].join('')

var tpl = [
'<div class="tl">',
    '<div class="tl-left">',
        '<div class="tl-global-label"></div>',
        '<div class="tl-block-label"></div>',
    '</div>',
    '<div class="tl-right">',
        '<div class="tl-right-push"></div>',
        '<div class="tl-block-lines"></div>',
        '<div class="tl-cursor"></div>',
    '</div>',
'</div>',
].join('')


var getDate = function( mouseEvent ){
    var o = dom.offset( this.domBlockLines ).left
    var x = mouseEvent.pageX
    return this.model.timeLineState.unproject( (x-o)/this.domBlockLines.offsetWidth )
}
var relayEvent = function( event ){

    // only consider main button
    if( event.which !== 1 )
        return

    var o = dom.offset( this.domBlockLines )
    var x = event.pageX - o.left
    var y = event.pageY - o.top
    var xPer = x/this.domBlockLines.offsetWidth
    var date = this.model.timeLineState.unproject( xPer )

    var key, line
    var primaryTarget = true
    if( dom.getParent( event.target, 'tl-cursor' ) ){
        ed.dispatch( 'ui-tlCursor-'+event.type, {
            date: date,
            y: y,
            x: x,
            xPer: xPer,
            mouseEvent: event,
            primaryTarget: primaryTarget
        })
        primaryTarget = false
    }

    if( key = dom.getParent( event.target, 'tl-key' ) ) {
        ed.dispatch( 'ui-tlKey-'+event.type, {
            mouseEvent: event,
            chunk: dom.getParent( key, 'tl-row' ).getAttribute('data-chunk'),
            i: key.getAttribute('data-i'),
            date: date,
            y: y,
            x: x,
            xPer: xPer,
            primaryTarget: primaryTarget
        })
        primaryTarget = false
    }

    if( line = dom.getParent( event.target, 'tl-row' ) ) {
        ed.dispatch( 'ui-tlLine-'+event.type, {
            mouseEvent: event,
            chunk: line.getAttribute('data-chunk'),
            date: date,
            y: y,
            x: x,
            xPer: xPer,
            primaryTarget: primaryTarget
        })
        //primaryTarget = false
    }

    ed.dispatch( 'ui-tl-'+event.type, {
        mouseEvent: event,
        date: date,
        y: y,
        x: x,
        xPer: xPer,
        primaryTarget: primaryTarget
    })


    event.preventDefault()
}

var renderKeys = function( ){
    var timeLine = this.model.timeLine
    var proj = this.model.timeLineState.project

    // for each chunk
    for( var k in this.domLines ){

        // clean up
        var c = this.domLines[ k ].children;
        for( var i=c.length; i--; )
            c[ i ].remove()

        // for each key
        for( var i=(timeLine.keys[ k ]||[]).length; i--; ){

            var x = proj( timeLine.keys[ k ][ i ].date )

            if (x<-0.01 || x>1.01)
                continue

            var dk = dom.domify( key_tpl )
            dk.setAttribute( 'data-i', i )
            dk.style.left = 'calc( '+(x*100)+'% - 5px )'

            this.domLines[ k ].appendChild( dk )

        }
    }
}
var renderCursor = function( ){
    var x = this.model.timeLineState.project( this.model.timeLineState.cursor )
    this.domCursor.style.left = 'calc( '+(x*100)+'% - 0.5px )'
    this.domCursor.style.display = x>0&&x<1 ? '' : 'none'
}

var build = function( ){
    var face = this.model.face

    this.domEl = dom.domify( tpl )

    var labels = this.domEl.querySelector('.tl-block-label'),
        lines = this.domEl.querySelector('.tl-block-lines')

    this.domCursor = this.domEl.querySelector('.tl-cursor')

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

    this.domBlockLines = lines
}

var init = function( modelBall, timeLineEL ){

    this.model = {
        face: modelBall.face,
        timeLineState: modelBall.timeLineState,
        timeLine: modelBall.timeLine,
    }

    build.call( this )

    timeLineEL.className += ' tl'
    for( var i = this.domEl.children.length; i--; )
        timeLineEL.appendChild( this.domEl.children[i] )
    this.domEl = timeLineEL


    ed.listen( 'change:timeLine' , renderKeys.bind( this ) , this )
    ed.listen( 'change:timeLineState-cursor' , renderCursor.bind( this ) , this )
    ed.listen( 'change:timeLineState-viewport' , renderCursor.bind( this ) , this )
    ed.listen( 'change:timeLineState-viewport' , renderKeys.bind( this ) , this )


    this.domEl.querySelector('.tl-right').addEventListener('mousedown', relayEvent.bind(this), false )
    this.domEl.querySelector('.tl-right').addEventListener('mouseup', relayEvent.bind(this), false )
    this.domEl.querySelector('.tl-right').addEventListener('mousemove', relayEvent.bind(this), false )
    this.domEl.querySelector('.tl-right').addEventListener('wheel', relayEvent.bind(this), false )
    this.domEl.querySelector('.tl-right').addEventListener('shortclick', relayEvent.bind(this), false )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init
})
