(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var faceRenderer = Object.create( require('./renderer/svg/face') )
  , pointControlRenderer = Object.create( require('./renderer/svg/pointControl') )
  , basicEvent = Object.create( require('./renderer/basicEvent') )
  , timeLineRenderer = Object.create( require('./renderer/timeLine/timeLine') )


  , face = Object.create( require('./model/data/Face') )
  , timeLine = Object.create( require('./model/data/TimeLine') )

  , camera = Object.create( require('./model/app-state/Camera') )
  , timeLineState = Object.create( require('./model/app-state/TimeLineState') )

  , history = Object.create( require('./model/history') )


  , dragPointCtrl = Object.create( require('./controller/dragPoint') )
  , timeLineKeyPointCtrl = Object.create( require('./controller/timeLine/key') )
  , timeLineCursorCtrl = Object.create( require('./controller/timeLine/cursor') )
  , ctrlZ = Object.create( require('./controller/ctrlZ') )

  , staticApplyCtrl = Object.create( require('./staticController/applyTimeLine') )
  , staticRecomputeCtrl = Object.create( require('./staticController/recompute') )


  , ed = require('./system/eventDispatcher')


  require('./layout')
  require('./utils/doubleClick')

// init model
face.init()
camera.init()
timeLineState.init()
timeLine.init()
history.init()

// init system
var modelBall = {
    face: face,
    camera: camera,
    timeLineState: timeLineState,
    timeLine: timeLine,
    history: history
}
window.modelBall = modelBall

// init renderer
var domSvg = document.querySelector('.app-draw-zone')
faceRenderer.init( modelBall, domSvg )
pointControlRenderer.init( modelBall, domSvg )

basicEvent.init( modelBall )

timeLineRenderer.init( modelBall, document.querySelector('.app-timeLine') )

// controller
dragPointCtrl.init( modelBall ).enable()
timeLineKeyPointCtrl.init( modelBall ).enable()
ctrlZ.init( modelBall ).enable()
timeLineCursorCtrl.init( modelBall ).enable()


staticApplyCtrl.init( modelBall ).enable()
staticRecomputeCtrl.init( modelBall ).enable()



// bootstrap
face.chunk.mustach_left.line = [
    {x: 50, y: 100},
    //{x: 150, y: 130},
    //{x: 270, y: 200}
]
face.chunk.mustach_left.width = [
    40,
    //20,
    //35
]
face.chunk.mustach_left.recompute()



// TODO put that on a static controller
// render

function render(){

    //ed.dispatch('pre-render')
    ed.dispatch('render')
    //ed.dispatch('post-render')

}

// TODO throttle this
ed.listen( 'please-render' , render.bind( this ) , this )

render()


var pl_render = function(){
    ed.dispatch( 'please-render' )
}
ed.listen( 'change:shape', pl_render )
ed.listen( 'change:camera:zoom', pl_render )
ed.listen( 'change:camera:origin', pl_render )


var pl_historize = function( event ){
    if( !event.wip && !event.no_history )
        history.save( timeLine )
}
history.save( timeLine )
ed.listen( 'change:shape', pl_historize )
ed.listen( 'change:timeLine', pl_historize )

},{"./controller/ctrlZ":2,"./controller/dragPoint":3,"./controller/timeLine/cursor":4,"./controller/timeLine/key":5,"./layout":6,"./model/app-state/Camera":7,"./model/app-state/TimeLineState":8,"./model/data/Face":9,"./model/data/TimeLine":12,"./model/history":13,"./renderer/basicEvent":15,"./renderer/svg/face":16,"./renderer/svg/pointControl":17,"./renderer/timeLine/timeLine":20,"./staticController/applyTimeLine":21,"./staticController/recompute":22,"./system/eventDispatcher":23,"./utils/doubleClick":28}],2:[function(require,module,exports){
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

},{"../system/eventDispatcher":23,"../utils/Abstract":26}],3:[function(require,module,exports){
var Abstract = require('../utils/Abstract')
, ed = require('../system/eventDispatcher')

var init = function( modelBall ){

    this.model = {
        face: modelBall.face
    }

    this.ticDown = ticDown.bind( this )
    this.ticMove = ticMove.bind( this )
    this.ticUp = ticUp.bind( this )

    return this
}

var enable = function(){
    this.disable()
    ed.listen( 'ui-tic-mousedown', this.ticDown, this )
}
var disable = function(){
    ed.unlisten( 'ui-tic-mousedown', this )
    ed.unlisten( 'ui-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
}

var ticDown = function( event ){
    this._shape = this.model.face.chunk[ event.chunk ]
    this._point = this._shape[ event.pool ][ event.i ]
    this._origin = {
        x: this._point.x,
        y: this._point.y
    }
    this._anchor = {
        x: event.mouseEvent.pageX,
        y: event.mouseEvent.pageY
    }

    ed.listen( 'ui-mousemove', this.ticMove, this )
    ed.listen( 'ui-mouseup', this.ticUp, this )
}

var ticMove = function( event ){
    this._point.x = this._origin.x + event.mouseEvent.pageX - this._anchor.x
    this._point.y = this._origin.y + event.mouseEvent.pageY - this._anchor.y

    ed.dispatch( 'change:point', {
        point: this._point,
        shape: this._shape,
        wip: true
    })
}

var ticUp = function( event ){

    ed.dispatch( 'change:point', {
        point: this._point,
        shape: this._shape,
        wip: false
    })

    ed.unlisten( 'ui-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
}


module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})

},{"../system/eventDispatcher":23,"../utils/Abstract":26}],4:[function(require,module,exports){
var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')

var init = function( modelBall ){

    this.model = {
        timeLineState: modelBall.timeLineState,
    }

    this.CurDown = CurDown.bind( this )
    this.CurMove = CurMove.bind( this )
    this.CurUp = CurUp.bind( this )

    return this
}

var enable = function(){
    this.disable()
    ed.listen( 'ui-tlCursor-mousedown', this.CurDown, this )
}
var disable = function(){
    ed.unlisten( 'ui-tlCursor-mousedown', this )
}

var CurDown = function( event ){
    this._origin = this.model.timeLineState.project( event.date )
    this._anchor = event.mouseEvent.pageX

    ed.unlisten( 'ui-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
    ed.listen( 'ui-mousemove', this.CurMove, this )
    ed.listen( 'ui-mouseup', this.CurUp, this )
}
var CurMove = function( event ){
    var tls = this.model.timeLineState
    var newDate = tls.unproject( this._origin + event.mouseEvent.pageX - this._anchor )

    tls.cursor = newDate

    ed.dispatch( 'change:timeLineState', {
        wip: true
    })
}
var CurUp = function( event ){

    var tls = this.model.timeLineState

    tls.cursor = tls.quantify( tls.cursor )

    ed.unlisten( 'ui-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )

    ed.dispatch( 'change:timeLineState', {
        wip: false
    })
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})

},{"../../system/eventDispatcher":23,"../../utils/Abstract":26}],5:[function(require,module,exports){
var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')

var init = function( modelBall ){

    this.model = {
        face: modelBall.face,
        timeLine: modelBall.timeLine,
        timeLineState: modelBall.timeLineState,
    }

    this.lineClick = lineClick.bind( this )
    this.keyDown = keyDown.bind( this )
    this.keyMove = keyMove.bind( this )
    this.keyUp = keyUp.bind( this )

    return this
}

var enable = function(){
    this.disable()
    ed.listen( 'ui-tlLine-doubleclick', this.lineClick, this )
    ed.listen( 'ui-tlKey-mousedown', this.keyDown, this )
}
var disable = function(){
    ed.unlisten( 'ui-tlLine-doubleclick', this )
    ed.unlisten( 'ui-tlKey-doubleclick', this )
}

var lineClick = function( event ){
    var shape = this.model.face.chunk[ event.chunk ]
    var date = event.date
    var tls = this.model.timeLineState

    this.model.timeLine.addOrSetKey( event.chunk, tls.quantify(date), shape.pack() );

    ed.dispatch( 'change:timeLine', {
        wip: false
    })
}
var keyDown = function( event ){
    this._chunk = event.chunk
    this._origin = this.model.timeLineState.project( event.date )
    this.h = event.mouseEvent.pageY
    this._anchor = event.mouseEvent.pageX
    this._key = this.model.timeLine.keys[ event.chunk ][ event.i ]
    this._removed = false


    ed.unlisten( 'ui-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )
    ed.listen( 'ui-mousemove', this.keyMove, this )
    ed.listen( 'ui-mouseup', this.keyUp, this )
}
var keyMove = function( event ){

    var tls = this.model.timeLineState

    if( Math.abs( this.h - event.mouseEvent.pageY ) > 50 ){

        if( !this._removed ) {

            this.model.timeLine.removeKey( this._chunk, this._key )

            this._removed = true

            ed.dispatch( 'change:timeLine', {
                wip: true
            })
        }

    } else {

        var newDate = tls.unproject( this._origin + event.mouseEvent.pageX - this._anchor )

        if( !this._removed ) {

            this.model.timeLine.setKeyDate( this._chunk, this._key, newDate )
        } else {
            this._key = this.model.timeLine.addOrSetKey( this._chunk, newDate, this._key.pack )

            this._removed = false
        }

        ed.dispatch( 'change:timeLine', {
            wip: true
        })
    }
}
var keyUp = function( event ){

    ed.unlisten( 'ui-mousemove', this )
    ed.unlisten( 'ui-mouseup', this )

    var tls = this.model.timeLineState

    this.model.timeLine.setKeyDate( this._chunk, this._key, tls.quantify( this._key.date ) )

    ed.dispatch( 'change:timeLine', {
        wip: false
    })
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})

},{"../../system/eventDispatcher":23,"../../utils/Abstract":26}],6:[function(require,module,exports){
var scrollTo=function(el,scrollx,scrolly){
    if(el.scrollTo){
        el.scrollTo(scrollx,scrolly);
        return;
    }
    if(el.scrollLeft !== null && el.scrollTop !== null){
        el.scrollLeft=scrollx;
        el.scrollTop=scrolly;
        return;
    }
    if(el.scrollX !== null && el.scrollY !== null){
        el.scrollX=scrollx;
        el.scrollY=scrolly;
        return;
    }
    throw 'unable to scroll';
};

var getSroll=function(el){
    if(el.scrollLeft !== null && el.scrollTop !== null)
        return {
            x:el.scrollLeft,
            y:el.scrollTop
        };
    if(el.scrollX !== null && el.scrollY !== null)
        return {
            x:el.scrollX,
            y:el.scrollY
        };
    if (el.pageXOffset !== null && el.pageYOffset !== null)
        return {
            x:el.pageXOffset,
            y:el.pageYOffset
        };
    throw 'unable to scroll';
};



var $main = document.querySelector('.app-draw-zone')
var $tl = document.querySelector('.app-timeLine')
var $cont = document.querySelector('.page-app')
var $body = document.body

var layouts_strategies = {}

layouts_strategies[0] = function( w, h ){

    var max_margin = 30
    var tl_min_h = 200

    h = Math.max(h, 550)

    // vertical

    var tlh = tl_min_h

    var mh = h - tlh - max_margin

    if ( mh > 400 )
        mh *= 0.95

    if ( mh > 600 )
        mh = 600

    var m = ( h - mh - tlh ) /4

    $main.style.top = m+'px'
    $main.style.height = mh+'px'

    $tl.style.top = (m*3+mh)+'px'
    $tl.style.height = tlh+'px'

    $cont.style.height = h+'px'

    // horizontal

    var mw = w*0.8
    if ( mw<500 )
        mw = w*0.95
    if ( mw>1000 )
        mw = 1000

    $main.style.left = $tl.style.left = ((w-mw)/2)+'px'
    $main.style.width = $tl.style.width = mw+'px'



    // css class for positionning

    $body.className = 'js-deferred-layout'
}

var renderLayout = function(){
    // /!\ hard reflow
    layouts_strategies[0]( document.body.offsetWidth, window.innerHeight );
}

var layoutTimeout = 0
var askRender = function(){
    window.clearTimeout(layoutTimeout)
    layoutTimeout = window.setTimeout( renderLayout, 200 )
}
renderLayout()

window.addEventListener('resize', askRender, false )






var $pageApp = document.querySelector('.page-app')
var autoScroll = false
var testScroll = function(){

    var scrollY = getSroll(document.body).y

    if ( Math.abs(scrollY - $pageApp.offsetTop) < 180 ) {
        autoScroll = true
        scrollTo(document.body, 0, $pageApp.offsetTop)
    }
}

var down = false
var pending = false

var scrollTimeout = 0
var askScroll = function(){
    if (autoScroll)
        return void ( autoScroll = false )

    window.clearTimeout(scrollTimeout)

    if ( down )
        pending = true
    else  {
        pending = false
        scrollTimeout = window.setTimeout( testScroll, 550 )
    }
}
var trackMouseDown = function( event ){
    if (event.type == 'mouseup') {
        if (pending) {
            pending = false
            window.clearTimeout(scrollTimeout)
            scrollTimeout = window.setTimeout( testScroll, 550 )
        }
        down = false
    } else if (event.type == 'mousedown' && event.which == 1 && event.currentTarget == document)
        down = true
}

window.addEventListener('scroll', askScroll, false )
window.addEventListener('resize', askScroll, false )

document.addEventListener('mousedown', trackMouseDown, false )
document.addEventListener('mouseup', trackMouseDown, false )

},{}],7:[function(require,module,exports){
var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')
  , u = require('../../utils/point')

var init = function( type ){

    this.origin = {x: 0, y: 0}
    this.zoom = 1

    this.project = project.bind( this )
    this.unproject = unproject.bind( this )

    return this
}

var project = function( p ){
    return {
        x: ( p.x - this.origin.x ) * this.zoom,
        y: ( p.y - this.origin.y ) * this.zoom
    }
}
var unproject = function( p ){
    return {
        x: ( p.x / this.zoom ) + this.origin.x,
        y: ( p.y / this.zoom ) + this.origin.y
    }
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
})

},{"../../system/eventDispatcher":23,"../../utils/Abstract":26,"../../utils/point":29}],8:[function(require,module,exports){
var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')

var init = function( type ){

    this.origin = 0
    this.zoom = 30

    this.cursor = 0

    this.project = project.bind( this )
    this.projectQ = projectQ.bind( this )
    this.unproject = unproject.bind( this )
    this.quantify = quantify.bind( this )

    return this
}

var project = function( x ){
    return ( x - this.origin ) * this.zoom
}
var projectQ = function( x ){
    return this.quantify( this.project( x ) )
}
var unproject = function( x ){
    return  x / this.zoom  + this.origin
}
var quantify = function( x ){
    return Math.round( x )
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
})

},{"../../system/eventDispatcher":23,"../../utils/Abstract":26}],9:[function(require,module,exports){
var Abstract = require('../../utils/Abstract')

  , historizable = require('../mixin/historizable')
  , Shape = require('./Shape')
  , Line = require('./Line')

var init = function( ){

    this.chunk = {
        mustach_left: Object.create( Line ).init(),
        mustach_right: Object.create( Line ).init(),

        beard_left: Object.create( Shape ).init(),
        beard_right: Object.create( Shape ).init(),
        beard_mid: Object.create( Shape ).init(),
    }

    return this
}

var pack = function(){
    var o = {}
    for( var i in this.chunk )
        o[ i ] = this.chunck[ i ].pack()
    return o
}

var unpack = function( o ){
    for( var i in this.chunk )
        this.chunck[ i ].unpack( o[ i ] )
    return this
}

module.exports = Object.create( Abstract )
.extend( historizable )
.extend({
    init: init,
    pack: pack,
    unpack: unpack,
})

},{"../../utils/Abstract":26,"../mixin/historizable":14,"./Line":10,"./Shape":11}],10:[function(require,module,exports){
var Shape = require('./Shape')
  , ed = require('../../system/eventDispatcher')
  , pj = require('../../system/pathJob')
  , u = require('../../utils/point')

var init = function(){

    Shape.init.call( this )

    this.line = []
    this.width = []

    return this
}

var recompute = function(){

    this.vertex = pj.expandMustach( this.line, this.width )

    return Shape.recompute.call( this )
}

var pack = function(){
    return {
        line: this.line.slice().map( u.copy ),
        width: this.width.slice(),
        // TODO deep copy this
        sharpness: this.sharpness.slice()
    }
}

module.exports = Object.create( Shape ).extend({
    init: init,
    recompute: recompute,
    pack: pack,
})

},{"../../system/eventDispatcher":23,"../../system/pathJob":25,"../../utils/point":29,"./Shape":11}],11:[function(require,module,exports){
var Abstract = require('../../utils/Abstract')
  , historizable = require('../mixin/historizable')

  , ed = require('../../system/eventDispatcher')
  , pj = require('../../system/pathJob')
  , u = require('../../utils/point')

var init = function( ){

    // expose this
    this.vertex = [];
    this.sharpness = [];

    this.bezierPath = [];

    return this
}

var recompute = function(){
    this.bezierPath = pj.bezify( this.vertex, 0.15 )
    return this
}

var pack = function(){
    return {
        vertex: this.vertex.slice().map( u.copy ),
        // TODO deep copy this
        sharpness: this.sharpness.slice()
    }
}

module.exports = Object.create( Abstract )
.extend( historizable )
.extend({
    init: init,
    recompute: recompute,
    pack: pack,
})

},{"../../system/eventDispatcher":23,"../../system/pathJob":25,"../../utils/Abstract":26,"../../utils/point":29,"../mixin/historizable":14}],12:[function(require,module,exports){
var Abstract = require('../../utils/Abstract')
  , historizable = require('../mixin/historizable')
  , ed = require('../../system/eventDispatcher')


/*
 * keys is a set labeld by chunk each item is a array containing { date, pack }
 *
 */
var init = function( type ){

    this.keys = {}

    return this
}

var sortFn = function(a, b){return a.date<b.date ? -1 : 1}

var addOrSetKey = function( chunk, date, pack ){

    // TODO smart thing

    if( !this.keys[ chunk ] )
        this.keys[ chunk ] = []

    for(var i=this.keys[ chunk ].length; i--;)
        if( this.keys[ chunk ][ i ].date == date )
            return void (this.keys[ chunk ][ i ].pack = pack)

    var k
    this.keys[ chunk ].push(k = {
        date: date,
        pack: pack
    })
    this.keys[ chunk ].sort( sortFn )

    return k
}
var removeKey = function( chunk, key ){
    var i
    if( !this.keys[ chunk ] || ( i=this.keys[ chunk ].indexOf( key ) ) <=-1 )
        return
    return this.keys[ chunk ].splice( i, 1 )[ 0 ]
}
var setKeyDate = function( chunk, key, date ){

    // TODO smart thing

    key.date = date
    this.keys[ chunk ].sort( sortFn )

    return key
}

module.exports = Object.create( Abstract )
.extend( historizable )
.extend({
    init: init,
    addOrSetKey: addOrSetKey,
    setKeyDate: setKeyDate,
    removeKey: removeKey,

})

},{"../../system/eventDispatcher":23,"../../utils/Abstract":26,"../mixin/historizable":14}],13:[function(require,module,exports){
var Abstract = require('../utils/Abstract')
  , h = require('./mixin/historizable')
  , ed = require('../system/eventDispatcher')


var init = function( type ){

    this.stack = []
    this.undo_stack = []

    return this
}

var save = function( model ){
    this.stack.push({ model: model, pack: model.pack() })

    this.undo_stack.length = 0

    while ( this.stack.length > 50 )
        this.stack.shift()
}

var dispatch = function( model ){
    ed.dispatch( 'change:timeLine', {
        no_history: true
    })
}

var undo = function( o ){
    if ( this.stack.length<=1 )
        return false

    var o = this.stack.pop()

    var last = this.stack[ this.stack.length-1 ]

    o.model.unpack( h.deepCopy( last.pack ) )

    dispatch( o.model )


    this.undo_stack.push( o )
}

var redo = function( o ){

    if ( !this.undo_stack.length )
        return false

    var o = this.undo_stack.pop()

    o.model.unpack( h.deepCopy( o.pack ) )

    this.stack.push( o )

    dispatch( o.model )
}

module.exports = Object.create( Abstract )
.extend( h )
.extend({
    init: init,
    undo: undo,
    redo: redo,
    save: save,
})

},{"../system/eventDispatcher":23,"../utils/Abstract":26,"./mixin/historizable":14}],14:[function(require,module,exports){

var deepCopy = function( o ){
    if( typeof o !== 'object' )
        return o

    if( Array.isArray( o ) )
        return o.map(deepCopy)

    var res = {}
    for( var i in o )
        if( typeof o[ i ] !== 'function' )
            res[ i ] = deepCopy( o[ i ] )
    return res
}

var unpack = function( o ){
    for( var i in o )
        this[ i ] = deepCopy( o[ i ] )
    return this
}

module.exports = {
    pack: function(){ return deepCopy( this ) },
    unpack: unpack,
    deepCopy: deepCopy
}

},{}],15:[function(require,module,exports){
var Abstract = require('../utils/Abstract')
  , ed = require('../system/eventDispatcher')

var handler = function( event ){
    ed.dispatch( 'ui-'+event.type, {
        mouseEvent: event
    })
}

var init = function( modelBall, domSvg ){

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

},{"../system/eventDispatcher":23,"../utils/Abstract":26}],16:[function(require,module,exports){
var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')
  , svg = require('./svg-util')


var render = function( ){
    var face = this.model.face
    var camera = this.model.camera
    var proj = function( p ){
        var pp = camera.project( p )
        pp.type = p.type
        return pp
    }

    for( var i in face.chunk ) {
        face.chunk[ i ].recompute()
        this.dom[ i ].setAttribute( 'd',
            svg.renderBezier( face.chunk[ i ].bezierPath.map( proj ) )
        )
    }
}

var build = function( domSvg ){
    var face = this.model.face

    this.dom = {}

    for( var i in face.chunk ){
        this.dom[ i ] = svg.create('path')
        this.dom[ i ].setAttribute('class', 'hair-chunk '+i)
        domSvg.appendChild( this.dom[ i ] )
    }
}

var init = function( modelBall, domSvg ){

    this.model = {
        face: modelBall.face,
        camera: modelBall.camera
    }

    build.call( this, domSvg )

    ed.listen( 'render' , render.bind( this ) , this )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
    render: render
})

},{"../../system/eventDispatcher":23,"../../utils/Abstract":26,"./svg-util":18}],17:[function(require,module,exports){
var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')
  , svg = require('./svg-util')

var tic = function( x, y ){
    var t = svg.create('circle')
    t.setAttribute( 'cx', x )
    t.setAttribute( 'cy', y )
    t.setAttribute( 'r', 5 )
    t.setAttribute( 'class', 'control-tic' )
    return t
}

var render = function( ){
    var face = this.model.face
    var proj = this.model.camera.project

    for( var i in face.chunk ){

        var container = this.dom[ i ]
        var shape = face.chunk[ i ]

        container.innerHTML = ''

        var pts, c, d

        if( shape.line ){
            // is a line
            pts = shape.line
            c = 'control-line'
            d = 'line'
        } else {
            // is a path
            pts = shape.vertex
            c = 'control-path'
            d = 'vertex'
        }

        pts.map( proj ).forEach(function( p, index ){
            var t = tic( p.x, p.y )
            t.setAttribute( 'class', 'control-tic '+c )
            t.setAttribute( 'data-i', index )
            t.setAttribute( 'data-chunk', i )
            t.setAttribute( 'data-pool', d )
            container.appendChild( t )
        })
    }
}

var build = function( domSvg ){
    var face = this.model.face

    this.dom = {}

    for( var i in face.chunk ){
        this.dom[ i ] = svg.create('g')
        this.dom[ i ].className = 'control control-'+i
        this.dom[ i ].setAttribute( 'data-chunk', i )
        domSvg.appendChild( this.dom[ i ] )
    }
}

var down = function( event ){
    if( !event.target.getAttribute( 'data-pool' ) )
        return

    var i = event.target.getAttribute( 'data-i' ),
        chunk = event.target.getAttribute( 'data-chunk' ),
        pool = event.target.getAttribute( 'data-pool' )

    ed.dispatch( 'ui-tic-mousedown' , {
        i: i,
        chunk: chunk,
        pool: pool,
        mouseEvent: event
    })
}

var init = function( modelBall, domSvg ){

    this.model = {
        face: modelBall.face,
        camera: modelBall.camera,
    }

    build.call( this, domSvg )


    domSvg.addEventListener( 'mousedown', down, false )


    ed.listen( 'render' , render.bind( this ) , this )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
    render: render
})

},{"../../system/eventDispatcher":23,"../../utils/Abstract":26,"./svg-util":18}],18:[function(require,module,exports){

var floor = function( x ){
    return (0|(x*100))/100;
}
var point = function( p ){
   return floor(p.x)+' '+floor(p.y)
}
var renderBezier = function( pts ){
    if( !pts.length )
        return ''
    var d='M'+point( pts[0] )
    for( var i = 1; i<pts.length ; i++ )
        switch( pts[i].type ){
            case 'F': d+='L'+point( pts[i] ); break
            case 'C': d+='Q'+point( pts[i++] )+' '+point( pts[i] ); break
        }
    return d+'z'
}
var renderLine = function( pts, close ){
    return 'M'+pts.reduce(function(p, c){
        return p+'L'+point(c)
    },'').slice(1)+( close ? 'z' : '' )
}


var svgNS = "http://www.w3.org/2000/svg";
var create = function( type ){
    return document.createElementNS( svgNS, type )
}

module.exports = {
    renderBezier : renderBezier,
    renderLine: renderLine,
    create: create,

    svgNS: svgNS
}

},{}],19:[function(require,module,exports){
var Abstract = require('../../utils/Abstract')
  , dom = require('../../utils/domHelper')
  , ed = require('../../system/eventDispatcher')





var getDate = function( mouseEvent ){
    var o = dom.offset( this.domEl ).left
    var x = mouseEvent.pageX
    return this.model.timeLineState.unproject( x-o )
}
var relayEvent = function( event ){
    return ed.dispatch( 'ui-tlCursor-'+event.type, {
        date: getDate.call(this, event ),
        mouseEvent: event
    })
}

var render = function( ){
    var timeLineState = this.model.timeLineState
    this.domCursor.style.left = (timeLineState.project( timeLineState.cursor ) -2)+'px'
}

var tpl = [
'<div class="tl-ruler">',
    '<div class="tl-cursor">',
    '</div>',
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

},{"../../system/eventDispatcher":23,"../../utils/Abstract":26,"../../utils/domHelper":27}],20:[function(require,module,exports){
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
    var proj = this.model.timeLineState.project

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

var init = function( modelBall, timeLineEL ){

    this.model = {
        face: modelBall.face,
        timeLineState: modelBall.timeLineState,
        timeLine: modelBall.timeLine,
    }

    this.ruler = Object.create( Ruler ).init( modelBall )

    build.call( this )

    timeLineEL.className += ' tl'
    for( var i = this.domEl.children.length; i--; )
        timeLineEL.appendChild( this.domEl.children[i] )
    this.domEl = timeLineEL


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

},{"../../system/eventDispatcher":23,"../../utils/Abstract":26,"../../utils/domHelper":27,"./ruler":19}],21:[function(require,module,exports){
var Abstract = require('../utils/Abstract')
  , ed = require('../system/eventDispatcher')
  , interpolate = require('../system/interpolate')

 var init = function( modelBall ){

     this.model = {
         face: modelBall.face,
         timeLine: modelBall.timeLine,
         timeLineState: modelBall.timeLineState
     }

     this.changeShape = changeShape.bind( this )
     this.changeCursor = changeCursor.bind( this )

     return this
 }

 var enable = function(){
     this.disable()
     ed.listen( 'change:shape', this.changeShape, this )
     ed.listen( 'change:timeLineState', this.changeCursor, this )
 }
 var disable = function(){
     ed.unlisten( 'change:shape', this )
     ed.unlisten( 'change:timeLineState', this )
 }

 var changeShape = function( event ){

     if(event.wip || event.is_interpolation)
         return

     for( var chunk in this.model.face.chunk )
         if( this.model.face.chunk[chunk] == event.shape )
             break

     this.model.timeLine.addOrSetKey( chunk, this.model.timeLineState.cursor, event.shape.pack() )

     ed.dispatch( 'change:timeLine', {
         wip: false
     })
 }
 var changeCursor = function( event ){

     var fchunk = this.model.face.chunk,
         date = this.model.timeLineState.cursor,
         keys = this.model.timeLine.keys

     if( this._cursor == date )
         return

     for( var chunk in keys ){
         var k = keys[ chunk ]


         // TODO detect when the shape does not change, dont ask for redraw then


         if( date <= k[ 0 ].date )
             fchunk[ chunk ].unpack( k[ 0 ].pack )

         else if( date >= k[ k.length-1 ].date )
             fchunk[ chunk ].unpack( k[ k.length-1 ].pack )

         else {

             for( var i=1; i<k.length && k[i].date<date; i++ );

             var a = k[i-1],
                 b = k[i]

             var alpha = ( date - a.date )/( b.date - a.date )

             fchunk[ chunk ].unpack( interpolate.lerpPack( a.pack, b.pack , alpha ) )
         }

         ed.dispatch( 'change:point', {
             wip: event.wip,
             shape: fchunk[ chunk ],
             is_interpolation: true
         })
     }
 }



 module.exports = Object.create( Abstract ).extend({
     init: init,
     enable: enable,
     disable: disable,
 })

},{"../system/eventDispatcher":23,"../system/interpolate":24,"../utils/Abstract":26}],22:[function(require,module,exports){
var Abstract = require('../utils/Abstract')
  , ed = require('../system/eventDispatcher')

var init = function( modelBall ){

    this.changePoint = changePoint.bind( this )

    return this
}

var enable = function(){
    this.disable()
    ed.listen( 'change:point', this.changePoint, this )
}
var disable = function(){
    ed.unlisten( 'change:point', this )
}

var changePoint = function( event ){

    event.shape.recompute();

    ed.dispatch( 'change:shape', {
        wip: event.wip,
        is_interpolation: event.is_interpolation,
        shape: event.shape
    })
}
module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})

},{"../system/eventDispatcher":23,"../utils/Abstract":26}],23:[function(require,module,exports){
var Abstract = require('../utils/Abstract')

var listener = {};

var dispatch = function( eventName, data ){



    if(true)
        switch(eventName){
            case 'ui-mousemove':
            case 'render3D-camera-change':
                break;
            default:
                console.log(eventName, data)
        }

    this._lock = true

    var l = listener[ eventName ] || []
    for( var i = 0; i<l.length; i++)
        l[i].fn(data, eventName)

    this._lock = false
    while( (this._stack||[]).length ){
        var o = this._stack.shift()
        this[ o.fn ].apply( this, o.args)
    }

    return this
}
var listen = function( eventName, fn , key ){

    if ( this._lock )
        return void ( this._stack = this._stack || [] ).push({ fn:'listen', args: arguments })

    ;( listener[ eventName ] = listener[ eventName ] || [] ).push({
        fn: fn,
        key: key
    })
    return this
}
var unlisten = function( eventName, key ){

    if ( this._lock )
        return void ( this._stack = this._stack || [] ).push({ fn:'unlisten', args: arguments })

    var l = ( listener[ eventName ] = listener[ eventName ] || [] )
    for( var i = l.length; i--;)
        if( l[i].key == key )
            l.splice(i,1)
    return this
}
var hasListener = function( eventName, key ){
    return !!( listener[ eventName ] || [] ).length
}
var reset = function( eventName, key ){
    listener = {}
}

module.exports = Object.create( Abstract )
.extend({
    dispatch: dispatch,
    listen: listen,
    unlisten: unlisten,
    hasListener: hasListener,
    reset: reset
})

},{"../utils/Abstract":26}],24:[function(require,module,exports){
var u = require('../utils/point')


// a (1-alpha) + b alpha
var lerpPoints = function( apts, bpts, alpha ){

    // ensure that the array are same lengthed
    while( apts.length < bpts.length )
        apts.push( u.copy( bpts[bpts.length-1] ) )

    while( bpts.length < apts.length )
        bpts.push( u.copy( apts[apts.length-1] ) )


    var res = []

    for(var i=0; i<apts.length; i++)
        res.push( u.lerp( apts[i], bpts[i], alpha ) )

    return res
}

// a (1-alpha) + b alpha
var lerpNumber = function( apts, bpts, alpha ){

    // ensure that the array are same lengthed
    while( apts.length < bpts.length )
        apts.push( u.copy( bpts[bpts.length-1] ) )

    while( bpts.length < apts.length )
        bpts.push( u.copy( apts[apts.length-1] ) )


    var res = []

    var aalpha = 1-alpha

    for(var i=0; i<apts.length; i++)
        res.push( aalpha * apts[i] + alpha * bpts[i] )

    return res
}

// a (1-alpha) + b alpha
var lerpPack = function( apack, bpack , alpha ){
    var res = {}

    for( var i in apack )
        switch( i ){
            case 'line':
            case 'vertex':
                res[ i ] = lerpPoints( apack[i], bpack[i], alpha )
                break

            case 'width':
                res[ i ] = lerpNumber( apack[i], bpack[i], alpha )
                break
        }

    return res
}

module.exports = {
    lerpPack: lerpPack
}

},{"../utils/point":29}],25:[function(require,module,exports){
var u = require('../utils/point')


var resolveUncapSharpness = function( sharpness ){

    var _a = sharpness[ 0 ],
         a,
         t

    for( var i = sharpness.length; i--; ){
        a  = _a
        _a = sharpness[ i ]

        // _a a
        // -1 0

        if( t = ( _a.next + a.before ) > 1 ){
            _a.next /= t
            a.before /= t
        }
    }

    return sharpness
}
var bezify = function( pts, sharpness ){

    var default_sharpness

    if( pts.length<2 )
        return []

    if( !sharpness || typeof sharpness == 'number' )
        default_sharpness = sharpness || 0.25
    else
        resolveUncapSharpness( sharpness )


    var _a = pts[ 0 ],
         a = pts[ 1 ],
        a_, e_, _e,
        s_, _s


    var bezierPath = []
    for( var i=pts.length; i--; ){

        // _a a a_ is a vertex
        // -1 0 +1
        a_ =  a
        a  = _a
        _a = pts[ i ]

        // compute fixed point ( depends on sharpness )

        _s = default_sharpness || sharpness[ i ].before
        s_ = default_sharpness || sharpness[ i ].after

        e_ = u.lerp( a, _a, _s )
        _e = u.lerp( a, a_, s_ )

        e_.type = 'F'
        _e.type = 'F'

        a.type = 'C'

        bezierPath.push( _e, a, e_ )
    }

    return bezierPath
}

var expandMustach = function( pts, hs ){
    return pts.reduce( function( p, a, i ){
        if( i==0 || i==pts.length-1 ){
            p.push( a )
            return p
        }
        var a_ = u.normalize( u.diff( pts[i-1], a ) ),
            _a = u.normalize( u.diff( a, pts[i+1] ) )

        var n = a_

        n.x = _a.x + a_.x
        n.y = _a.y + a_.y

        u.normalize( n )

        var tmp = n.x
        n.x = n.y
        n.y = -tmp

        p.unshift({
            x: a.x + n.x * hs[i],
            y: a.y + n.y * hs[i]
        })
        p.push({
            x: a.x - n.x * hs[i],
            y: a.y - n.y * hs[i]
        })

        return p
    }, [])
}


module.exports = {
    expandMustach: expandMustach,
    bezify: bezify
}

},{"../utils/point":29}],26:[function(require,module,exports){
module.exports = {
    init:function(){ return this},
    extend:function(o){
        for(var i in o ){
            this[i] = o[i]
        }
        return this
    }
}

},{}],27:[function(require,module,exports){
module.exports = {
    hasClass : function( el , c ){
		return el.classList.contains(c)
	},
	addClass : function( el , c ){
		el.className += ' '+c
	},
	removeClass : function( el , c ){
		var nc=""
		for(var i=el.classList.length;i--; )
			if( c != el.classList[i] )
				nc += ' '+el.classList[i]
		el.className = nc
	},
	getParent : function( el , c ){
		while(true)
			if( el && !this.hasClass( el , c ) )
				el = el.parentElement
			else
				break;
		return el
	},
    offset : function( el ){
        // TODO consider scroll
        var o = {
            left:0,
            top:0
        }
        while( el && el.offsetLeft !== null){
            o.left += el.offsetLeft
            o.top += el.offsetTop

            el = el.parentElement
        }
        return o
    },
	bind : function( el , eventName , fn ){

		var l = eventName.split(' ')
		if( l.length>1 ){
			for(var i=l.length;i--;)
				this.bind( el , l[i] , fn )
			return
		}


		el._bindHandlers = el._bindHandlers || {}

		this.unbind( el , eventName )

		el.addEventListener( eventName.split('.')[0] , fn , false )
		el._bindHandlers[ eventName ] = fn
	},
	unbind : function( el , eventName ){

		var l = eventName.split(' ')
		if( l.length>1 ){
			for(var i=l.length;i--;)
				this.unbind( el , l[i] )
			return
		}

		if( !el._bindHandlers || !el._bindHandlers[ eventName ] )
			return

		el.removeEventListener( eventName.split('.')[0] , el._bindHandlers[ eventName ] , false )
		el._bindHandlers[ eventName ] = null
	},
    domify : (function(){
        if( typeof document != 'object' )
            return function(){}
        var tank = document.createElement('div')
        return function( tpl ){
            tank.innerHTML = tpl
            var domEl = tank.children[ 0 ]
            tank.innerHTML = ''
            return domEl
        }
    })()
}

},{}],28:[function(require,module,exports){
;(function(){

var startTime,
    startElement,
    startPos = {},
    phase = 0

document.addEventListener('mousedown',function(event){
    if ( phase == 0 || event.timeStamp - startTime > 400 ){

        startTime = event.timeStamp
        startElement = event.target
        startPos.x = event.pageX
        startPos.y = event.pageY
        phase=1

    } else {
        phase++
    }
})

document.addEventListener('mouseup',function(event){

    if( startElement!=event.target
        || event.timeStamp - startTime > 400
        || Math.abs(startPos.x - event.pageX) > 25
        || Math.abs(startPos.y - event.pageY) > 25
    )
        return void ( phase = 0 )

    if( phase >= 2 ){
        var clickevent = new MouseEvent('doubleclick',event);

        event.target.dispatchEvent(clickevent);

        phase = 0;
    }
})

})()

},{}],29:[function(require,module,exports){
var u = {}

u.scalaire = function( a, b ){
    return a.x*b.x + a.y*b.y
}
u.norme = function( a ){
    return Math.sqrt( u.scalaire( a, a ) )
}
u.normalize = function( a ){
    var n = u.norme( a )
    a.x /= n
    a.y /= n
    return a
}
u.diff = function( a, b ){
    return {
        x: a.x - b.x,
        y: a.y - b.y
    }
}
u.lerp = function( a, b, alpha ){
    var aalpha = 1-alpha
    return {
        x: a.x*aalpha + b.x*alpha,
        y: a.y*aalpha + b.y*alpha
    }
}
u.copy = function( a ){
    return {
        x: a.x,
        y: a.y
    }
}

module.exports = u

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwianNcXGFwcC5qcyIsImpzXFxjb250cm9sbGVyXFxjdHJsWi5qcyIsImpzXFxjb250cm9sbGVyXFxkcmFnUG9pbnQuanMiLCJqc1xcY29udHJvbGxlclxcdGltZUxpbmVcXGN1cnNvci5qcyIsImpzXFxjb250cm9sbGVyXFx0aW1lTGluZVxca2V5LmpzIiwianNcXGxheW91dC5qcyIsImpzXFxtb2RlbFxcYXBwLXN0YXRlXFxDYW1lcmEuanMiLCJqc1xcbW9kZWxcXGFwcC1zdGF0ZVxcVGltZUxpbmVTdGF0ZS5qcyIsImpzXFxtb2RlbFxcZGF0YVxcRmFjZS5qcyIsImpzXFxtb2RlbFxcZGF0YVxcTGluZS5qcyIsImpzXFxtb2RlbFxcZGF0YVxcU2hhcGUuanMiLCJqc1xcbW9kZWxcXGRhdGFcXFRpbWVMaW5lLmpzIiwianNcXG1vZGVsXFxoaXN0b3J5LmpzIiwianNcXG1vZGVsXFxtaXhpblxcaGlzdG9yaXphYmxlLmpzIiwianNcXHJlbmRlcmVyXFxiYXNpY0V2ZW50LmpzIiwianNcXHJlbmRlcmVyXFxzdmdcXGZhY2UuanMiLCJqc1xccmVuZGVyZXJcXHN2Z1xccG9pbnRDb250cm9sLmpzIiwianNcXHJlbmRlcmVyXFxzdmdcXHN2Zy11dGlsLmpzIiwianNcXHJlbmRlcmVyXFx0aW1lTGluZVxccnVsZXIuanMiLCJqc1xccmVuZGVyZXJcXHRpbWVMaW5lXFx0aW1lTGluZS5qcyIsImpzXFxzdGF0aWNDb250cm9sbGVyXFxhcHBseVRpbWVMaW5lLmpzIiwianNcXHN0YXRpY0NvbnRyb2xsZXJcXHJlY29tcHV0ZS5qcyIsImpzXFxzeXN0ZW1cXGV2ZW50RGlzcGF0Y2hlci5qcyIsImpzXFxzeXN0ZW1cXGludGVycG9sYXRlLmpzIiwianNcXHN5c3RlbVxccGF0aEpvYi5qcyIsImpzXFx1dGlsc1xcQWJzdHJhY3QuanMiLCJqc1xcdXRpbHNcXGRvbUhlbHBlci5qcyIsImpzXFx1dGlsc1xcZG91YmxlQ2xpY2suanMiLCJqc1xcdXRpbHNcXHBvaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgZmFjZVJlbmRlcmVyID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9yZW5kZXJlci9zdmcvZmFjZScpIClcclxuICAsIHBvaW50Q29udHJvbFJlbmRlcmVyID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9yZW5kZXJlci9zdmcvcG9pbnRDb250cm9sJykgKVxyXG4gICwgYmFzaWNFdmVudCA9IE9iamVjdC5jcmVhdGUoIHJlcXVpcmUoJy4vcmVuZGVyZXIvYmFzaWNFdmVudCcpIClcclxuICAsIHRpbWVMaW5lUmVuZGVyZXIgPSBPYmplY3QuY3JlYXRlKCByZXF1aXJlKCcuL3JlbmRlcmVyL3RpbWVMaW5lL3RpbWVMaW5lJykgKVxyXG5cclxuXHJcbiAgLCBmYWNlID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9tb2RlbC9kYXRhL0ZhY2UnKSApXHJcbiAgLCB0aW1lTGluZSA9IE9iamVjdC5jcmVhdGUoIHJlcXVpcmUoJy4vbW9kZWwvZGF0YS9UaW1lTGluZScpIClcclxuXHJcbiAgLCBjYW1lcmEgPSBPYmplY3QuY3JlYXRlKCByZXF1aXJlKCcuL21vZGVsL2FwcC1zdGF0ZS9DYW1lcmEnKSApXHJcbiAgLCB0aW1lTGluZVN0YXRlID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9tb2RlbC9hcHAtc3RhdGUvVGltZUxpbmVTdGF0ZScpIClcclxuXHJcbiAgLCBoaXN0b3J5ID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9tb2RlbC9oaXN0b3J5JykgKVxyXG5cclxuXHJcbiAgLCBkcmFnUG9pbnRDdHJsID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9jb250cm9sbGVyL2RyYWdQb2ludCcpIClcclxuICAsIHRpbWVMaW5lS2V5UG9pbnRDdHJsID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9jb250cm9sbGVyL3RpbWVMaW5lL2tleScpIClcclxuICAsIHRpbWVMaW5lQ3Vyc29yQ3RybCA9IE9iamVjdC5jcmVhdGUoIHJlcXVpcmUoJy4vY29udHJvbGxlci90aW1lTGluZS9jdXJzb3InKSApXHJcbiAgLCBjdHJsWiA9IE9iamVjdC5jcmVhdGUoIHJlcXVpcmUoJy4vY29udHJvbGxlci9jdHJsWicpIClcclxuXHJcbiAgLCBzdGF0aWNBcHBseUN0cmwgPSBPYmplY3QuY3JlYXRlKCByZXF1aXJlKCcuL3N0YXRpY0NvbnRyb2xsZXIvYXBwbHlUaW1lTGluZScpIClcclxuICAsIHN0YXRpY1JlY29tcHV0ZUN0cmwgPSBPYmplY3QuY3JlYXRlKCByZXF1aXJlKCcuL3N0YXRpY0NvbnRyb2xsZXIvcmVjb21wdXRlJykgKVxyXG5cclxuXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcblxyXG5cclxuICByZXF1aXJlKCcuL2xheW91dCcpXHJcbiAgcmVxdWlyZSgnLi91dGlscy9kb3VibGVDbGljaycpXHJcblxyXG4vLyBpbml0IG1vZGVsXHJcbmZhY2UuaW5pdCgpXHJcbmNhbWVyYS5pbml0KClcclxudGltZUxpbmVTdGF0ZS5pbml0KClcclxudGltZUxpbmUuaW5pdCgpXHJcbmhpc3RvcnkuaW5pdCgpXHJcblxyXG4vLyBpbml0IHN5c3RlbVxyXG52YXIgbW9kZWxCYWxsID0ge1xyXG4gICAgZmFjZTogZmFjZSxcclxuICAgIGNhbWVyYTogY2FtZXJhLFxyXG4gICAgdGltZUxpbmVTdGF0ZTogdGltZUxpbmVTdGF0ZSxcclxuICAgIHRpbWVMaW5lOiB0aW1lTGluZSxcclxuICAgIGhpc3Rvcnk6IGhpc3RvcnlcclxufVxyXG53aW5kb3cubW9kZWxCYWxsID0gbW9kZWxCYWxsXHJcblxyXG4vLyBpbml0IHJlbmRlcmVyXHJcbnZhciBkb21TdmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYXBwLWRyYXctem9uZScpXHJcbmZhY2VSZW5kZXJlci5pbml0KCBtb2RlbEJhbGwsIGRvbVN2ZyApXHJcbnBvaW50Q29udHJvbFJlbmRlcmVyLmluaXQoIG1vZGVsQmFsbCwgZG9tU3ZnIClcclxuXHJcbmJhc2ljRXZlbnQuaW5pdCggbW9kZWxCYWxsIClcclxuXHJcbnRpbWVMaW5lUmVuZGVyZXIuaW5pdCggbW9kZWxCYWxsLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYXBwLXRpbWVMaW5lJykgKVxyXG5cclxuLy8gY29udHJvbGxlclxyXG5kcmFnUG9pbnRDdHJsLmluaXQoIG1vZGVsQmFsbCApLmVuYWJsZSgpXHJcbnRpbWVMaW5lS2V5UG9pbnRDdHJsLmluaXQoIG1vZGVsQmFsbCApLmVuYWJsZSgpXHJcbmN0cmxaLmluaXQoIG1vZGVsQmFsbCApLmVuYWJsZSgpXHJcbnRpbWVMaW5lQ3Vyc29yQ3RybC5pbml0KCBtb2RlbEJhbGwgKS5lbmFibGUoKVxyXG5cclxuXHJcbnN0YXRpY0FwcGx5Q3RybC5pbml0KCBtb2RlbEJhbGwgKS5lbmFibGUoKVxyXG5zdGF0aWNSZWNvbXB1dGVDdHJsLmluaXQoIG1vZGVsQmFsbCApLmVuYWJsZSgpXHJcblxyXG5cclxuXHJcbi8vIGJvb3RzdHJhcFxyXG5mYWNlLmNodW5rLm11c3RhY2hfbGVmdC5saW5lID0gW1xyXG4gICAge3g6IDUwLCB5OiAxMDB9LFxyXG4gICAgLy97eDogMTUwLCB5OiAxMzB9LFxyXG4gICAgLy97eDogMjcwLCB5OiAyMDB9XHJcbl1cclxuZmFjZS5jaHVuay5tdXN0YWNoX2xlZnQud2lkdGggPSBbXHJcbiAgICA0MCxcclxuICAgIC8vMjAsXHJcbiAgICAvLzM1XHJcbl1cclxuZmFjZS5jaHVuay5tdXN0YWNoX2xlZnQucmVjb21wdXRlKClcclxuXHJcblxyXG5cclxuLy8gVE9ETyBwdXQgdGhhdCBvbiBhIHN0YXRpYyBjb250cm9sbGVyXHJcbi8vIHJlbmRlclxyXG5cclxuZnVuY3Rpb24gcmVuZGVyKCl7XHJcblxyXG4gICAgLy9lZC5kaXNwYXRjaCgncHJlLXJlbmRlcicpXHJcbiAgICBlZC5kaXNwYXRjaCgncmVuZGVyJylcclxuICAgIC8vZWQuZGlzcGF0Y2goJ3Bvc3QtcmVuZGVyJylcclxuXHJcbn1cclxuXHJcbi8vIFRPRE8gdGhyb3R0bGUgdGhpc1xyXG5lZC5saXN0ZW4oICdwbGVhc2UtcmVuZGVyJyAsIHJlbmRlci5iaW5kKCB0aGlzICkgLCB0aGlzIClcclxuXHJcbnJlbmRlcigpXHJcblxyXG5cclxudmFyIHBsX3JlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICBlZC5kaXNwYXRjaCggJ3BsZWFzZS1yZW5kZXInIClcclxufVxyXG5lZC5saXN0ZW4oICdjaGFuZ2U6c2hhcGUnLCBwbF9yZW5kZXIgKVxyXG5lZC5saXN0ZW4oICdjaGFuZ2U6Y2FtZXJhOnpvb20nLCBwbF9yZW5kZXIgKVxyXG5lZC5saXN0ZW4oICdjaGFuZ2U6Y2FtZXJhOm9yaWdpbicsIHBsX3JlbmRlciApXHJcblxyXG5cclxudmFyIHBsX2hpc3Rvcml6ZSA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG4gICAgaWYoICFldmVudC53aXAgJiYgIWV2ZW50Lm5vX2hpc3RvcnkgKVxyXG4gICAgICAgIGhpc3Rvcnkuc2F2ZSggdGltZUxpbmUgKVxyXG59XHJcbmhpc3Rvcnkuc2F2ZSggdGltZUxpbmUgKVxyXG5lZC5saXN0ZW4oICdjaGFuZ2U6c2hhcGUnLCBwbF9oaXN0b3JpemUgKVxyXG5lZC5saXN0ZW4oICdjaGFuZ2U6dGltZUxpbmUnLCBwbF9oaXN0b3JpemUgKVxyXG4iLCJ2YXIgQWJzdHJhY3QgPSByZXF1aXJlKCcuLi91dGlscy9BYnN0cmFjdCcpXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4uL3N5c3RlbS9ldmVudERpc3BhdGNoZXInKVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggbW9kZWxCYWxsICl7XHJcblxyXG4gICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICBoaXN0b3J5OiBtb2RlbEJhbGwuaGlzdG9yeVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMua2V5RG93biA9IGtleURvd24uYmluZCggdGhpcyApXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxudmFyIGtleURvd24gPSBmdW5jdGlvbiggZXZlbnQgKXtcclxuICAgIGlmICggIWV2ZW50Lm1vdXNlRXZlbnQuY3RybEtleSApXHJcbiAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgc3dpdGNoKCBldmVudC5tb3VzZUV2ZW50LndoaWNoICl7XHJcbiAgICAgICAgY2FzZSA5MCA6ICAvLyB6XHJcbiAgICAgICAgICAgIGlmICggdGhpcy5tb2RlbC5oaXN0b3J5LnVuZG8oKSAhPT0gZmFsc2UgKVxyXG4gICAgICAgICAgICAgICAgZWQuZGlzcGF0Y2goICdoaXN0b3J5OnVuZG8nKVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBlZC5kaXNwYXRjaCggJ2hpc3Rvcnk6bm90aGluZy10by11bmRvJylcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgODkgOiAgLy8gelxyXG4gICAgICAgICAgICBpZiAoIHRoaXMubW9kZWwuaGlzdG9yeS5yZWRvKCkgIT09IGZhbHNlIClcclxuICAgICAgICAgICAgICAgIGVkLmRpc3BhdGNoKCAnaGlzdG9yeTpyZWRvJylcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgZWQuZGlzcGF0Y2goICdoaXN0b3J5Om5vdGhpbmctdG8tcmVkbycpXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG59XHJcblxyXG52YXIgZW5hYmxlID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuZGlzYWJsZSgpXHJcbiAgICBlZC5saXN0ZW4oICd1aS1rZXlkb3duJywgdGhpcy5rZXlEb3duLCB0aGlzIClcclxufVxyXG52YXIgZGlzYWJsZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICBlZC51bmxpc3RlbiggJ3VpLWtleWRvd24nLCB0aGlzIClcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApLmV4dGVuZCh7XHJcbiAgICBpbml0OiBpbml0LFxyXG4gICAgZW5hYmxlOiBlbmFibGUsXHJcbiAgICBkaXNhYmxlOiBkaXNhYmxlLFxyXG59KVxyXG4iLCJ2YXIgQWJzdHJhY3QgPSByZXF1aXJlKCcuLi91dGlscy9BYnN0cmFjdCcpXHJcbiwgZWQgPSByZXF1aXJlKCcuLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oIG1vZGVsQmFsbCApe1xyXG5cclxuICAgIHRoaXMubW9kZWwgPSB7XHJcbiAgICAgICAgZmFjZTogbW9kZWxCYWxsLmZhY2VcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnRpY0Rvd24gPSB0aWNEb3duLmJpbmQoIHRoaXMgKVxyXG4gICAgdGhpcy50aWNNb3ZlID0gdGljTW92ZS5iaW5kKCB0aGlzIClcclxuICAgIHRoaXMudGljVXAgPSB0aWNVcC5iaW5kKCB0aGlzIClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG52YXIgZW5hYmxlID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuZGlzYWJsZSgpXHJcbiAgICBlZC5saXN0ZW4oICd1aS10aWMtbW91c2Vkb3duJywgdGhpcy50aWNEb3duLCB0aGlzIClcclxufVxyXG52YXIgZGlzYWJsZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICBlZC51bmxpc3RlbiggJ3VpLXRpYy1tb3VzZWRvd24nLCB0aGlzIClcclxuICAgIGVkLnVubGlzdGVuKCAndWktbW91c2Vtb3ZlJywgdGhpcyApXHJcbiAgICBlZC51bmxpc3RlbiggJ3VpLW1vdXNldXAnLCB0aGlzIClcclxufVxyXG5cclxudmFyIHRpY0Rvd24gPSBmdW5jdGlvbiggZXZlbnQgKXtcclxuICAgIHRoaXMuX3NoYXBlID0gdGhpcy5tb2RlbC5mYWNlLmNodW5rWyBldmVudC5jaHVuayBdXHJcbiAgICB0aGlzLl9wb2ludCA9IHRoaXMuX3NoYXBlWyBldmVudC5wb29sIF1bIGV2ZW50LmkgXVxyXG4gICAgdGhpcy5fb3JpZ2luID0ge1xyXG4gICAgICAgIHg6IHRoaXMuX3BvaW50LngsXHJcbiAgICAgICAgeTogdGhpcy5fcG9pbnQueVxyXG4gICAgfVxyXG4gICAgdGhpcy5fYW5jaG9yID0ge1xyXG4gICAgICAgIHg6IGV2ZW50Lm1vdXNlRXZlbnQucGFnZVgsXHJcbiAgICAgICAgeTogZXZlbnQubW91c2VFdmVudC5wYWdlWVxyXG4gICAgfVxyXG5cclxuICAgIGVkLmxpc3RlbiggJ3VpLW1vdXNlbW92ZScsIHRoaXMudGljTW92ZSwgdGhpcyApXHJcbiAgICBlZC5saXN0ZW4oICd1aS1tb3VzZXVwJywgdGhpcy50aWNVcCwgdGhpcyApXHJcbn1cclxuXHJcbnZhciB0aWNNb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcbiAgICB0aGlzLl9wb2ludC54ID0gdGhpcy5fb3JpZ2luLnggKyBldmVudC5tb3VzZUV2ZW50LnBhZ2VYIC0gdGhpcy5fYW5jaG9yLnhcclxuICAgIHRoaXMuX3BvaW50LnkgPSB0aGlzLl9vcmlnaW4ueSArIGV2ZW50Lm1vdXNlRXZlbnQucGFnZVkgLSB0aGlzLl9hbmNob3IueVxyXG5cclxuICAgIGVkLmRpc3BhdGNoKCAnY2hhbmdlOnBvaW50Jywge1xyXG4gICAgICAgIHBvaW50OiB0aGlzLl9wb2ludCxcclxuICAgICAgICBzaGFwZTogdGhpcy5fc2hhcGUsXHJcbiAgICAgICAgd2lwOiB0cnVlXHJcbiAgICB9KVxyXG59XHJcblxyXG52YXIgdGljVXAgPSBmdW5jdGlvbiggZXZlbnQgKXtcclxuXHJcbiAgICBlZC5kaXNwYXRjaCggJ2NoYW5nZTpwb2ludCcsIHtcclxuICAgICAgICBwb2ludDogdGhpcy5fcG9pbnQsXHJcbiAgICAgICAgc2hhcGU6IHRoaXMuX3NoYXBlLFxyXG4gICAgICAgIHdpcDogZmFsc2VcclxuICAgIH0pXHJcblxyXG4gICAgZWQudW5saXN0ZW4oICd1aS1tb3VzZW1vdmUnLCB0aGlzIClcclxuICAgIGVkLnVubGlzdGVuKCAndWktbW91c2V1cCcsIHRoaXMgKVxyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApLmV4dGVuZCh7XHJcbiAgICBpbml0OiBpbml0LFxyXG4gICAgZW5hYmxlOiBlbmFibGUsXHJcbiAgICBkaXNhYmxlOiBkaXNhYmxlLFxyXG59KVxyXG4iLCJ2YXIgQWJzdHJhY3QgPSByZXF1aXJlKCcuLi8uLi91dGlscy9BYnN0cmFjdCcpXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4uLy4uL3N5c3RlbS9ldmVudERpc3BhdGNoZXInKVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggbW9kZWxCYWxsICl7XHJcblxyXG4gICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICB0aW1lTGluZVN0YXRlOiBtb2RlbEJhbGwudGltZUxpbmVTdGF0ZSxcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLkN1ckRvd24gPSBDdXJEb3duLmJpbmQoIHRoaXMgKVxyXG4gICAgdGhpcy5DdXJNb3ZlID0gQ3VyTW92ZS5iaW5kKCB0aGlzIClcclxuICAgIHRoaXMuQ3VyVXAgPSBDdXJVcC5iaW5kKCB0aGlzIClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG52YXIgZW5hYmxlID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuZGlzYWJsZSgpXHJcbiAgICBlZC5saXN0ZW4oICd1aS10bEN1cnNvci1tb3VzZWRvd24nLCB0aGlzLkN1ckRvd24sIHRoaXMgKVxyXG59XHJcbnZhciBkaXNhYmxlID0gZnVuY3Rpb24oKXtcclxuICAgIGVkLnVubGlzdGVuKCAndWktdGxDdXJzb3ItbW91c2Vkb3duJywgdGhpcyApXHJcbn1cclxuXHJcbnZhciBDdXJEb3duID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcbiAgICB0aGlzLl9vcmlnaW4gPSB0aGlzLm1vZGVsLnRpbWVMaW5lU3RhdGUucHJvamVjdCggZXZlbnQuZGF0ZSApXHJcbiAgICB0aGlzLl9hbmNob3IgPSBldmVudC5tb3VzZUV2ZW50LnBhZ2VYXHJcblxyXG4gICAgZWQudW5saXN0ZW4oICd1aS1tb3VzZW1vdmUnLCB0aGlzIClcclxuICAgIGVkLnVubGlzdGVuKCAndWktbW91c2V1cCcsIHRoaXMgKVxyXG4gICAgZWQubGlzdGVuKCAndWktbW91c2Vtb3ZlJywgdGhpcy5DdXJNb3ZlLCB0aGlzIClcclxuICAgIGVkLmxpc3RlbiggJ3VpLW1vdXNldXAnLCB0aGlzLkN1clVwLCB0aGlzIClcclxufVxyXG52YXIgQ3VyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG4gICAgdmFyIHRscyA9IHRoaXMubW9kZWwudGltZUxpbmVTdGF0ZVxyXG4gICAgdmFyIG5ld0RhdGUgPSB0bHMudW5wcm9qZWN0KCB0aGlzLl9vcmlnaW4gKyBldmVudC5tb3VzZUV2ZW50LnBhZ2VYIC0gdGhpcy5fYW5jaG9yIClcclxuXHJcbiAgICB0bHMuY3Vyc29yID0gbmV3RGF0ZVxyXG5cclxuICAgIGVkLmRpc3BhdGNoKCAnY2hhbmdlOnRpbWVMaW5lU3RhdGUnLCB7XHJcbiAgICAgICAgd2lwOiB0cnVlXHJcbiAgICB9KVxyXG59XHJcbnZhciBDdXJVcCA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG5cclxuICAgIHZhciB0bHMgPSB0aGlzLm1vZGVsLnRpbWVMaW5lU3RhdGVcclxuXHJcbiAgICB0bHMuY3Vyc29yID0gdGxzLnF1YW50aWZ5KCB0bHMuY3Vyc29yIClcclxuXHJcbiAgICBlZC51bmxpc3RlbiggJ3VpLW1vdXNlbW92ZScsIHRoaXMgKVxyXG4gICAgZWQudW5saXN0ZW4oICd1aS1tb3VzZXVwJywgdGhpcyApXHJcblxyXG4gICAgZWQuZGlzcGF0Y2goICdjaGFuZ2U6dGltZUxpbmVTdGF0ZScsIHtcclxuICAgICAgICB3aXA6IGZhbHNlXHJcbiAgICB9KVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0ICkuZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXQsXHJcbiAgICBlbmFibGU6IGVuYWJsZSxcclxuICAgIGRpc2FibGU6IGRpc2FibGUsXHJcbn0pXHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0Fic3RyYWN0JylcclxuICAsIGVkID0gcmVxdWlyZSgnLi4vLi4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcblxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCBtb2RlbEJhbGwgKXtcclxuXHJcbiAgICB0aGlzLm1vZGVsID0ge1xyXG4gICAgICAgIGZhY2U6IG1vZGVsQmFsbC5mYWNlLFxyXG4gICAgICAgIHRpbWVMaW5lOiBtb2RlbEJhbGwudGltZUxpbmUsXHJcbiAgICAgICAgdGltZUxpbmVTdGF0ZTogbW9kZWxCYWxsLnRpbWVMaW5lU3RhdGUsXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5saW5lQ2xpY2sgPSBsaW5lQ2xpY2suYmluZCggdGhpcyApXHJcbiAgICB0aGlzLmtleURvd24gPSBrZXlEb3duLmJpbmQoIHRoaXMgKVxyXG4gICAgdGhpcy5rZXlNb3ZlID0ga2V5TW92ZS5iaW5kKCB0aGlzIClcclxuICAgIHRoaXMua2V5VXAgPSBrZXlVcC5iaW5kKCB0aGlzIClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG52YXIgZW5hYmxlID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuZGlzYWJsZSgpXHJcbiAgICBlZC5saXN0ZW4oICd1aS10bExpbmUtZG91YmxlY2xpY2snLCB0aGlzLmxpbmVDbGljaywgdGhpcyApXHJcbiAgICBlZC5saXN0ZW4oICd1aS10bEtleS1tb3VzZWRvd24nLCB0aGlzLmtleURvd24sIHRoaXMgKVxyXG59XHJcbnZhciBkaXNhYmxlID0gZnVuY3Rpb24oKXtcclxuICAgIGVkLnVubGlzdGVuKCAndWktdGxMaW5lLWRvdWJsZWNsaWNrJywgdGhpcyApXHJcbiAgICBlZC51bmxpc3RlbiggJ3VpLXRsS2V5LWRvdWJsZWNsaWNrJywgdGhpcyApXHJcbn1cclxuXHJcbnZhciBsaW5lQ2xpY2sgPSBmdW5jdGlvbiggZXZlbnQgKXtcclxuICAgIHZhciBzaGFwZSA9IHRoaXMubW9kZWwuZmFjZS5jaHVua1sgZXZlbnQuY2h1bmsgXVxyXG4gICAgdmFyIGRhdGUgPSBldmVudC5kYXRlXHJcbiAgICB2YXIgdGxzID0gdGhpcy5tb2RlbC50aW1lTGluZVN0YXRlXHJcblxyXG4gICAgdGhpcy5tb2RlbC50aW1lTGluZS5hZGRPclNldEtleSggZXZlbnQuY2h1bmssIHRscy5xdWFudGlmeShkYXRlKSwgc2hhcGUucGFjaygpICk7XHJcblxyXG4gICAgZWQuZGlzcGF0Y2goICdjaGFuZ2U6dGltZUxpbmUnLCB7XHJcbiAgICAgICAgd2lwOiBmYWxzZVxyXG4gICAgfSlcclxufVxyXG52YXIga2V5RG93biA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG4gICAgdGhpcy5fY2h1bmsgPSBldmVudC5jaHVua1xyXG4gICAgdGhpcy5fb3JpZ2luID0gdGhpcy5tb2RlbC50aW1lTGluZVN0YXRlLnByb2plY3QoIGV2ZW50LmRhdGUgKVxyXG4gICAgdGhpcy5oID0gZXZlbnQubW91c2VFdmVudC5wYWdlWVxyXG4gICAgdGhpcy5fYW5jaG9yID0gZXZlbnQubW91c2VFdmVudC5wYWdlWFxyXG4gICAgdGhpcy5fa2V5ID0gdGhpcy5tb2RlbC50aW1lTGluZS5rZXlzWyBldmVudC5jaHVuayBdWyBldmVudC5pIF1cclxuICAgIHRoaXMuX3JlbW92ZWQgPSBmYWxzZVxyXG5cclxuXHJcbiAgICBlZC51bmxpc3RlbiggJ3VpLW1vdXNlbW92ZScsIHRoaXMgKVxyXG4gICAgZWQudW5saXN0ZW4oICd1aS1tb3VzZXVwJywgdGhpcyApXHJcbiAgICBlZC5saXN0ZW4oICd1aS1tb3VzZW1vdmUnLCB0aGlzLmtleU1vdmUsIHRoaXMgKVxyXG4gICAgZWQubGlzdGVuKCAndWktbW91c2V1cCcsIHRoaXMua2V5VXAsIHRoaXMgKVxyXG59XHJcbnZhciBrZXlNb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcblxyXG4gICAgdmFyIHRscyA9IHRoaXMubW9kZWwudGltZUxpbmVTdGF0ZVxyXG5cclxuICAgIGlmKCBNYXRoLmFicyggdGhpcy5oIC0gZXZlbnQubW91c2VFdmVudC5wYWdlWSApID4gNTAgKXtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLl9yZW1vdmVkICkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tb2RlbC50aW1lTGluZS5yZW1vdmVLZXkoIHRoaXMuX2NodW5rLCB0aGlzLl9rZXkgKVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlZCA9IHRydWVcclxuXHJcbiAgICAgICAgICAgIGVkLmRpc3BhdGNoKCAnY2hhbmdlOnRpbWVMaW5lJywge1xyXG4gICAgICAgICAgICAgICAgd2lwOiB0cnVlXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIHZhciBuZXdEYXRlID0gdGxzLnVucHJvamVjdCggdGhpcy5fb3JpZ2luICsgZXZlbnQubW91c2VFdmVudC5wYWdlWCAtIHRoaXMuX2FuY2hvciApXHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5fcmVtb3ZlZCApIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwudGltZUxpbmUuc2V0S2V5RGF0ZSggdGhpcy5fY2h1bmssIHRoaXMuX2tleSwgbmV3RGF0ZSApXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fa2V5ID0gdGhpcy5tb2RlbC50aW1lTGluZS5hZGRPclNldEtleSggdGhpcy5fY2h1bmssIG5ld0RhdGUsIHRoaXMuX2tleS5wYWNrIClcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZWQgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZWQuZGlzcGF0Y2goICdjaGFuZ2U6dGltZUxpbmUnLCB7XHJcbiAgICAgICAgICAgIHdpcDogdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxudmFyIGtleVVwID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcblxyXG4gICAgZWQudW5saXN0ZW4oICd1aS1tb3VzZW1vdmUnLCB0aGlzIClcclxuICAgIGVkLnVubGlzdGVuKCAndWktbW91c2V1cCcsIHRoaXMgKVxyXG5cclxuICAgIHZhciB0bHMgPSB0aGlzLm1vZGVsLnRpbWVMaW5lU3RhdGVcclxuXHJcbiAgICB0aGlzLm1vZGVsLnRpbWVMaW5lLnNldEtleURhdGUoIHRoaXMuX2NodW5rLCB0aGlzLl9rZXksIHRscy5xdWFudGlmeSggdGhpcy5fa2V5LmRhdGUgKSApXHJcblxyXG4gICAgZWQuZGlzcGF0Y2goICdjaGFuZ2U6dGltZUxpbmUnLCB7XHJcbiAgICAgICAgd2lwOiBmYWxzZVxyXG4gICAgfSlcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApLmV4dGVuZCh7XHJcbiAgICBpbml0OiBpbml0LFxyXG4gICAgZW5hYmxlOiBlbmFibGUsXHJcbiAgICBkaXNhYmxlOiBkaXNhYmxlLFxyXG59KVxyXG4iLCJ2YXIgc2Nyb2xsVG89ZnVuY3Rpb24oZWwsc2Nyb2xseCxzY3JvbGx5KXtcclxuICAgIGlmKGVsLnNjcm9sbFRvKXtcclxuICAgICAgICBlbC5zY3JvbGxUbyhzY3JvbGx4LHNjcm9sbHkpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmKGVsLnNjcm9sbExlZnQgIT09IG51bGwgJiYgZWwuc2Nyb2xsVG9wICE9PSBudWxsKXtcclxuICAgICAgICBlbC5zY3JvbGxMZWZ0PXNjcm9sbHg7XHJcbiAgICAgICAgZWwuc2Nyb2xsVG9wPXNjcm9sbHk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYoZWwuc2Nyb2xsWCAhPT0gbnVsbCAmJiBlbC5zY3JvbGxZICE9PSBudWxsKXtcclxuICAgICAgICBlbC5zY3JvbGxYPXNjcm9sbHg7XHJcbiAgICAgICAgZWwuc2Nyb2xsWT1zY3JvbGx5O1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRocm93ICd1bmFibGUgdG8gc2Nyb2xsJztcclxufTtcclxuXHJcbnZhciBnZXRTcm9sbD1mdW5jdGlvbihlbCl7XHJcbiAgICBpZihlbC5zY3JvbGxMZWZ0ICE9PSBudWxsICYmIGVsLnNjcm9sbFRvcCAhPT0gbnVsbClcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OmVsLnNjcm9sbExlZnQsXHJcbiAgICAgICAgICAgIHk6ZWwuc2Nyb2xsVG9wXHJcbiAgICAgICAgfTtcclxuICAgIGlmKGVsLnNjcm9sbFggIT09IG51bGwgJiYgZWwuc2Nyb2xsWSAhPT0gbnVsbClcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OmVsLnNjcm9sbFgsXHJcbiAgICAgICAgICAgIHk6ZWwuc2Nyb2xsWVxyXG4gICAgICAgIH07XHJcbiAgICBpZiAoZWwucGFnZVhPZmZzZXQgIT09IG51bGwgJiYgZWwucGFnZVlPZmZzZXQgIT09IG51bGwpXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDplbC5wYWdlWE9mZnNldCxcclxuICAgICAgICAgICAgeTplbC5wYWdlWU9mZnNldFxyXG4gICAgICAgIH07XHJcbiAgICB0aHJvdyAndW5hYmxlIHRvIHNjcm9sbCc7XHJcbn07XHJcblxyXG5cclxuXHJcbnZhciAkbWFpbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hcHAtZHJhdy16b25lJylcclxudmFyICR0bCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hcHAtdGltZUxpbmUnKVxyXG52YXIgJGNvbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGFnZS1hcHAnKVxyXG52YXIgJGJvZHkgPSBkb2N1bWVudC5ib2R5XHJcblxyXG52YXIgbGF5b3V0c19zdHJhdGVnaWVzID0ge31cclxuXHJcbmxheW91dHNfc3RyYXRlZ2llc1swXSA9IGZ1bmN0aW9uKCB3LCBoICl7XHJcblxyXG4gICAgdmFyIG1heF9tYXJnaW4gPSAzMFxyXG4gICAgdmFyIHRsX21pbl9oID0gMjAwXHJcblxyXG4gICAgaCA9IE1hdGgubWF4KGgsIDU1MClcclxuXHJcbiAgICAvLyB2ZXJ0aWNhbFxyXG5cclxuICAgIHZhciB0bGggPSB0bF9taW5faFxyXG5cclxuICAgIHZhciBtaCA9IGggLSB0bGggLSBtYXhfbWFyZ2luXHJcblxyXG4gICAgaWYgKCBtaCA+IDQwMCApXHJcbiAgICAgICAgbWggKj0gMC45NVxyXG5cclxuICAgIGlmICggbWggPiA2MDAgKVxyXG4gICAgICAgIG1oID0gNjAwXHJcblxyXG4gICAgdmFyIG0gPSAoIGggLSBtaCAtIHRsaCApIC80XHJcblxyXG4gICAgJG1haW4uc3R5bGUudG9wID0gbSsncHgnXHJcbiAgICAkbWFpbi5zdHlsZS5oZWlnaHQgPSBtaCsncHgnXHJcblxyXG4gICAgJHRsLnN0eWxlLnRvcCA9IChtKjMrbWgpKydweCdcclxuICAgICR0bC5zdHlsZS5oZWlnaHQgPSB0bGgrJ3B4J1xyXG5cclxuICAgICRjb250LnN0eWxlLmhlaWdodCA9IGgrJ3B4J1xyXG5cclxuICAgIC8vIGhvcml6b250YWxcclxuXHJcbiAgICB2YXIgbXcgPSB3KjAuOFxyXG4gICAgaWYgKCBtdzw1MDAgKVxyXG4gICAgICAgIG13ID0gdyowLjk1XHJcbiAgICBpZiAoIG13PjEwMDAgKVxyXG4gICAgICAgIG13ID0gMTAwMFxyXG5cclxuICAgICRtYWluLnN0eWxlLmxlZnQgPSAkdGwuc3R5bGUubGVmdCA9ICgody1tdykvMikrJ3B4J1xyXG4gICAgJG1haW4uc3R5bGUud2lkdGggPSAkdGwuc3R5bGUud2lkdGggPSBtdysncHgnXHJcblxyXG5cclxuXHJcbiAgICAvLyBjc3MgY2xhc3MgZm9yIHBvc2l0aW9ubmluZ1xyXG5cclxuICAgICRib2R5LmNsYXNzTmFtZSA9ICdqcy1kZWZlcnJlZC1sYXlvdXQnXHJcbn1cclxuXHJcbnZhciByZW5kZXJMYXlvdXQgPSBmdW5jdGlvbigpe1xyXG4gICAgLy8gLyFcXCBoYXJkIHJlZmxvd1xyXG4gICAgbGF5b3V0c19zdHJhdGVnaWVzWzBdKCBkb2N1bWVudC5ib2R5Lm9mZnNldFdpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcclxufVxyXG5cclxudmFyIGxheW91dFRpbWVvdXQgPSAwXHJcbnZhciBhc2tSZW5kZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgd2luZG93LmNsZWFyVGltZW91dChsYXlvdXRUaW1lb3V0KVxyXG4gICAgbGF5b3V0VGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KCByZW5kZXJMYXlvdXQsIDIwMCApXHJcbn1cclxucmVuZGVyTGF5b3V0KClcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBhc2tSZW5kZXIsIGZhbHNlIClcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxudmFyICRwYWdlQXBwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhZ2UtYXBwJylcclxudmFyIGF1dG9TY3JvbGwgPSBmYWxzZVxyXG52YXIgdGVzdFNjcm9sbCA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgdmFyIHNjcm9sbFkgPSBnZXRTcm9sbChkb2N1bWVudC5ib2R5KS55XHJcblxyXG4gICAgaWYgKCBNYXRoLmFicyhzY3JvbGxZIC0gJHBhZ2VBcHAub2Zmc2V0VG9wKSA8IDE4MCApIHtcclxuICAgICAgICBhdXRvU2Nyb2xsID0gdHJ1ZVxyXG4gICAgICAgIHNjcm9sbFRvKGRvY3VtZW50LmJvZHksIDAsICRwYWdlQXBwLm9mZnNldFRvcClcclxuICAgIH1cclxufVxyXG5cclxudmFyIGRvd24gPSBmYWxzZVxyXG52YXIgcGVuZGluZyA9IGZhbHNlXHJcblxyXG52YXIgc2Nyb2xsVGltZW91dCA9IDBcclxudmFyIGFza1Njcm9sbCA9IGZ1bmN0aW9uKCl7XHJcbiAgICBpZiAoYXV0b1Njcm9sbClcclxuICAgICAgICByZXR1cm4gdm9pZCAoIGF1dG9TY3JvbGwgPSBmYWxzZSApXHJcblxyXG4gICAgd2luZG93LmNsZWFyVGltZW91dChzY3JvbGxUaW1lb3V0KVxyXG5cclxuICAgIGlmICggZG93biApXHJcbiAgICAgICAgcGVuZGluZyA9IHRydWVcclxuICAgIGVsc2UgIHtcclxuICAgICAgICBwZW5kaW5nID0gZmFsc2VcclxuICAgICAgICBzY3JvbGxUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoIHRlc3RTY3JvbGwsIDU1MCApXHJcbiAgICB9XHJcbn1cclxudmFyIHRyYWNrTW91c2VEb3duID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcbiAgICBpZiAoZXZlbnQudHlwZSA9PSAnbW91c2V1cCcpIHtcclxuICAgICAgICBpZiAocGVuZGluZykge1xyXG4gICAgICAgICAgICBwZW5kaW5nID0gZmFsc2VcclxuICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChzY3JvbGxUaW1lb3V0KVxyXG4gICAgICAgICAgICBzY3JvbGxUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoIHRlc3RTY3JvbGwsIDU1MCApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvd24gPSBmYWxzZVxyXG4gICAgfSBlbHNlIGlmIChldmVudC50eXBlID09ICdtb3VzZWRvd24nICYmIGV2ZW50LndoaWNoID09IDEgJiYgZXZlbnQuY3VycmVudFRhcmdldCA9PSBkb2N1bWVudClcclxuICAgICAgICBkb3duID0gdHJ1ZVxyXG59XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgYXNrU2Nyb2xsLCBmYWxzZSApXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBhc2tTY3JvbGwsIGZhbHNlIClcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRyYWNrTW91c2VEb3duLCBmYWxzZSApXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0cmFja01vdXNlRG93biwgZmFsc2UgKVxyXG4iLCJ2YXIgQWJzdHJhY3QgPSByZXF1aXJlKCcuLi8uLi91dGlscy9BYnN0cmFjdCcpXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4uLy4uL3N5c3RlbS9ldmVudERpc3BhdGNoZXInKVxyXG4gICwgdSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BvaW50JylcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oIHR5cGUgKXtcclxuXHJcbiAgICB0aGlzLm9yaWdpbiA9IHt4OiAwLCB5OiAwfVxyXG4gICAgdGhpcy56b29tID0gMVxyXG5cclxuICAgIHRoaXMucHJvamVjdCA9IHByb2plY3QuYmluZCggdGhpcyApXHJcbiAgICB0aGlzLnVucHJvamVjdCA9IHVucHJvamVjdC5iaW5kKCB0aGlzIClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG52YXIgcHJvamVjdCA9IGZ1bmN0aW9uKCBwICl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6ICggcC54IC0gdGhpcy5vcmlnaW4ueCApICogdGhpcy56b29tLFxyXG4gICAgICAgIHk6ICggcC55IC0gdGhpcy5vcmlnaW4ueSApICogdGhpcy56b29tXHJcbiAgICB9XHJcbn1cclxudmFyIHVucHJvamVjdCA9IGZ1bmN0aW9uKCBwICl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6ICggcC54IC8gdGhpcy56b29tICkgKyB0aGlzLm9yaWdpbi54LFxyXG4gICAgICAgIHk6ICggcC55IC8gdGhpcy56b29tICkgKyB0aGlzLm9yaWdpbi55XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggQWJzdHJhY3QgKVxyXG4uZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXQsXHJcbn0pXHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0Fic3RyYWN0JylcclxuICAsIGVkID0gcmVxdWlyZSgnLi4vLi4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcblxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCB0eXBlICl7XHJcblxyXG4gICAgdGhpcy5vcmlnaW4gPSAwXHJcbiAgICB0aGlzLnpvb20gPSAzMFxyXG5cclxuICAgIHRoaXMuY3Vyc29yID0gMFxyXG5cclxuICAgIHRoaXMucHJvamVjdCA9IHByb2plY3QuYmluZCggdGhpcyApXHJcbiAgICB0aGlzLnByb2plY3RRID0gcHJvamVjdFEuYmluZCggdGhpcyApXHJcbiAgICB0aGlzLnVucHJvamVjdCA9IHVucHJvamVjdC5iaW5kKCB0aGlzIClcclxuICAgIHRoaXMucXVhbnRpZnkgPSBxdWFudGlmeS5iaW5kKCB0aGlzIClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG52YXIgcHJvamVjdCA9IGZ1bmN0aW9uKCB4ICl7XHJcbiAgICByZXR1cm4gKCB4IC0gdGhpcy5vcmlnaW4gKSAqIHRoaXMuem9vbVxyXG59XHJcbnZhciBwcm9qZWN0USA9IGZ1bmN0aW9uKCB4ICl7XHJcbiAgICByZXR1cm4gdGhpcy5xdWFudGlmeSggdGhpcy5wcm9qZWN0KCB4ICkgKVxyXG59XHJcbnZhciB1bnByb2plY3QgPSBmdW5jdGlvbiggeCApe1xyXG4gICAgcmV0dXJuICB4IC8gdGhpcy56b29tICArIHRoaXMub3JpZ2luXHJcbn1cclxudmFyIHF1YW50aWZ5ID0gZnVuY3Rpb24oIHggKXtcclxuICAgIHJldHVybiBNYXRoLnJvdW5kKCB4IClcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApXHJcbi5leHRlbmQoe1xyXG4gICAgaW5pdDogaW5pdCxcclxufSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG5cclxuICAsIGhpc3Rvcml6YWJsZSA9IHJlcXVpcmUoJy4uL21peGluL2hpc3Rvcml6YWJsZScpXHJcbiAgLCBTaGFwZSA9IHJlcXVpcmUoJy4vU2hhcGUnKVxyXG4gICwgTGluZSA9IHJlcXVpcmUoJy4vTGluZScpXHJcblxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCApe1xyXG5cclxuICAgIHRoaXMuY2h1bmsgPSB7XHJcbiAgICAgICAgbXVzdGFjaF9sZWZ0OiBPYmplY3QuY3JlYXRlKCBMaW5lICkuaW5pdCgpLFxyXG4gICAgICAgIG11c3RhY2hfcmlnaHQ6IE9iamVjdC5jcmVhdGUoIExpbmUgKS5pbml0KCksXHJcblxyXG4gICAgICAgIGJlYXJkX2xlZnQ6IE9iamVjdC5jcmVhdGUoIFNoYXBlICkuaW5pdCgpLFxyXG4gICAgICAgIGJlYXJkX3JpZ2h0OiBPYmplY3QuY3JlYXRlKCBTaGFwZSApLmluaXQoKSxcclxuICAgICAgICBiZWFyZF9taWQ6IE9iamVjdC5jcmVhdGUoIFNoYXBlICkuaW5pdCgpLFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbnZhciBwYWNrID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBvID0ge31cclxuICAgIGZvciggdmFyIGkgaW4gdGhpcy5jaHVuayApXHJcbiAgICAgICAgb1sgaSBdID0gdGhpcy5jaHVuY2tbIGkgXS5wYWNrKClcclxuICAgIHJldHVybiBvXHJcbn1cclxuXHJcbnZhciB1bnBhY2sgPSBmdW5jdGlvbiggbyApe1xyXG4gICAgZm9yKCB2YXIgaSBpbiB0aGlzLmNodW5rIClcclxuICAgICAgICB0aGlzLmNodW5ja1sgaSBdLnVucGFjayggb1sgaSBdIClcclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggQWJzdHJhY3QgKVxyXG4uZXh0ZW5kKCBoaXN0b3JpemFibGUgKVxyXG4uZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXQsXHJcbiAgICBwYWNrOiBwYWNrLFxyXG4gICAgdW5wYWNrOiB1bnBhY2ssXHJcbn0pXHJcbiIsInZhciBTaGFwZSA9IHJlcXVpcmUoJy4vU2hhcGUnKVxyXG4gICwgZWQgPSByZXF1aXJlKCcuLi8uLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuICAsIHBqID0gcmVxdWlyZSgnLi4vLi4vc3lzdGVtL3BhdGhKb2InKVxyXG4gICwgdSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BvaW50JylcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICBTaGFwZS5pbml0LmNhbGwoIHRoaXMgKVxyXG5cclxuICAgIHRoaXMubGluZSA9IFtdXHJcbiAgICB0aGlzLndpZHRoID0gW11cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG52YXIgcmVjb21wdXRlID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICB0aGlzLnZlcnRleCA9IHBqLmV4cGFuZE11c3RhY2goIHRoaXMubGluZSwgdGhpcy53aWR0aCApXHJcblxyXG4gICAgcmV0dXJuIFNoYXBlLnJlY29tcHV0ZS5jYWxsKCB0aGlzIClcclxufVxyXG5cclxudmFyIHBhY2sgPSBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaW5lOiB0aGlzLmxpbmUuc2xpY2UoKS5tYXAoIHUuY29weSApLFxyXG4gICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLnNsaWNlKCksXHJcbiAgICAgICAgLy8gVE9ETyBkZWVwIGNvcHkgdGhpc1xyXG4gICAgICAgIHNoYXJwbmVzczogdGhpcy5zaGFycG5lc3Muc2xpY2UoKVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIFNoYXBlICkuZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXQsXHJcbiAgICByZWNvbXB1dGU6IHJlY29tcHV0ZSxcclxuICAgIHBhY2s6IHBhY2ssXHJcbn0pXHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0Fic3RyYWN0JylcclxuICAsIGhpc3Rvcml6YWJsZSA9IHJlcXVpcmUoJy4uL21peGluL2hpc3Rvcml6YWJsZScpXHJcblxyXG4gICwgZWQgPSByZXF1aXJlKCcuLi8uLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuICAsIHBqID0gcmVxdWlyZSgnLi4vLi4vc3lzdGVtL3BhdGhKb2InKVxyXG4gICwgdSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3BvaW50JylcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oICl7XHJcblxyXG4gICAgLy8gZXhwb3NlIHRoaXNcclxuICAgIHRoaXMudmVydGV4ID0gW107XHJcbiAgICB0aGlzLnNoYXJwbmVzcyA9IFtdO1xyXG5cclxuICAgIHRoaXMuYmV6aWVyUGF0aCA9IFtdO1xyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbnZhciByZWNvbXB1dGUgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5iZXppZXJQYXRoID0gcGouYmV6aWZ5KCB0aGlzLnZlcnRleCwgMC4xNSApXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG52YXIgcGFjayA9IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHZlcnRleDogdGhpcy52ZXJ0ZXguc2xpY2UoKS5tYXAoIHUuY29weSApLFxyXG4gICAgICAgIC8vIFRPRE8gZGVlcCBjb3B5IHRoaXNcclxuICAgICAgICBzaGFycG5lc3M6IHRoaXMuc2hhcnBuZXNzLnNsaWNlKClcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApXHJcbi5leHRlbmQoIGhpc3Rvcml6YWJsZSApXHJcbi5leHRlbmQoe1xyXG4gICAgaW5pdDogaW5pdCxcclxuICAgIHJlY29tcHV0ZTogcmVjb21wdXRlLFxyXG4gICAgcGFjazogcGFjayxcclxufSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgaGlzdG9yaXphYmxlID0gcmVxdWlyZSgnLi4vbWl4aW4vaGlzdG9yaXphYmxlJylcclxuICAsIGVkID0gcmVxdWlyZSgnLi4vLi4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcblxyXG5cclxuLypcclxuICoga2V5cyBpcyBhIHNldCBsYWJlbGQgYnkgY2h1bmsgZWFjaCBpdGVtIGlzIGEgYXJyYXkgY29udGFpbmluZyB7IGRhdGUsIHBhY2sgfVxyXG4gKlxyXG4gKi9cclxudmFyIGluaXQgPSBmdW5jdGlvbiggdHlwZSApe1xyXG5cclxuICAgIHRoaXMua2V5cyA9IHt9XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxudmFyIHNvcnRGbiA9IGZ1bmN0aW9uKGEsIGIpe3JldHVybiBhLmRhdGU8Yi5kYXRlID8gLTEgOiAxfVxyXG5cclxudmFyIGFkZE9yU2V0S2V5ID0gZnVuY3Rpb24oIGNodW5rLCBkYXRlLCBwYWNrICl7XHJcblxyXG4gICAgLy8gVE9ETyBzbWFydCB0aGluZ1xyXG5cclxuICAgIGlmKCAhdGhpcy5rZXlzWyBjaHVuayBdIClcclxuICAgICAgICB0aGlzLmtleXNbIGNodW5rIF0gPSBbXVxyXG5cclxuICAgIGZvcih2YXIgaT10aGlzLmtleXNbIGNodW5rIF0ubGVuZ3RoOyBpLS07KVxyXG4gICAgICAgIGlmKCB0aGlzLmtleXNbIGNodW5rIF1bIGkgXS5kYXRlID09IGRhdGUgKVxyXG4gICAgICAgICAgICByZXR1cm4gdm9pZCAodGhpcy5rZXlzWyBjaHVuayBdWyBpIF0ucGFjayA9IHBhY2spXHJcblxyXG4gICAgdmFyIGtcclxuICAgIHRoaXMua2V5c1sgY2h1bmsgXS5wdXNoKGsgPSB7XHJcbiAgICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgICBwYWNrOiBwYWNrXHJcbiAgICB9KVxyXG4gICAgdGhpcy5rZXlzWyBjaHVuayBdLnNvcnQoIHNvcnRGbiApXHJcblxyXG4gICAgcmV0dXJuIGtcclxufVxyXG52YXIgcmVtb3ZlS2V5ID0gZnVuY3Rpb24oIGNodW5rLCBrZXkgKXtcclxuICAgIHZhciBpXHJcbiAgICBpZiggIXRoaXMua2V5c1sgY2h1bmsgXSB8fCAoIGk9dGhpcy5rZXlzWyBjaHVuayBdLmluZGV4T2YoIGtleSApICkgPD0tMSApXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICByZXR1cm4gdGhpcy5rZXlzWyBjaHVuayBdLnNwbGljZSggaSwgMSApWyAwIF1cclxufVxyXG52YXIgc2V0S2V5RGF0ZSA9IGZ1bmN0aW9uKCBjaHVuaywga2V5LCBkYXRlICl7XHJcblxyXG4gICAgLy8gVE9ETyBzbWFydCB0aGluZ1xyXG5cclxuICAgIGtleS5kYXRlID0gZGF0ZVxyXG4gICAgdGhpcy5rZXlzWyBjaHVuayBdLnNvcnQoIHNvcnRGbiApXHJcblxyXG4gICAgcmV0dXJuIGtleVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0IClcclxuLmV4dGVuZCggaGlzdG9yaXphYmxlIClcclxuLmV4dGVuZCh7XHJcbiAgICBpbml0OiBpbml0LFxyXG4gICAgYWRkT3JTZXRLZXk6IGFkZE9yU2V0S2V5LFxyXG4gICAgc2V0S2V5RGF0ZTogc2V0S2V5RGF0ZSxcclxuICAgIHJlbW92ZUtleTogcmVtb3ZlS2V5LFxyXG5cclxufSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgaCA9IHJlcXVpcmUoJy4vbWl4aW4vaGlzdG9yaXphYmxlJylcclxuICAsIGVkID0gcmVxdWlyZSgnLi4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcblxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggdHlwZSApe1xyXG5cclxuICAgIHRoaXMuc3RhY2sgPSBbXVxyXG4gICAgdGhpcy51bmRvX3N0YWNrID0gW11cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG52YXIgc2F2ZSA9IGZ1bmN0aW9uKCBtb2RlbCApe1xyXG4gICAgdGhpcy5zdGFjay5wdXNoKHsgbW9kZWw6IG1vZGVsLCBwYWNrOiBtb2RlbC5wYWNrKCkgfSlcclxuXHJcbiAgICB0aGlzLnVuZG9fc3RhY2subGVuZ3RoID0gMFxyXG5cclxuICAgIHdoaWxlICggdGhpcy5zdGFjay5sZW5ndGggPiA1MCApXHJcbiAgICAgICAgdGhpcy5zdGFjay5zaGlmdCgpXHJcbn1cclxuXHJcbnZhciBkaXNwYXRjaCA9IGZ1bmN0aW9uKCBtb2RlbCApe1xyXG4gICAgZWQuZGlzcGF0Y2goICdjaGFuZ2U6dGltZUxpbmUnLCB7XHJcbiAgICAgICAgbm9faGlzdG9yeTogdHJ1ZVxyXG4gICAgfSlcclxufVxyXG5cclxudmFyIHVuZG8gPSBmdW5jdGlvbiggbyApe1xyXG4gICAgaWYgKCB0aGlzLnN0YWNrLmxlbmd0aDw9MSApXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgdmFyIG8gPSB0aGlzLnN0YWNrLnBvcCgpXHJcblxyXG4gICAgdmFyIGxhc3QgPSB0aGlzLnN0YWNrWyB0aGlzLnN0YWNrLmxlbmd0aC0xIF1cclxuXHJcbiAgICBvLm1vZGVsLnVucGFjayggaC5kZWVwQ29weSggbGFzdC5wYWNrICkgKVxyXG5cclxuICAgIGRpc3BhdGNoKCBvLm1vZGVsIClcclxuXHJcblxyXG4gICAgdGhpcy51bmRvX3N0YWNrLnB1c2goIG8gKVxyXG59XHJcblxyXG52YXIgcmVkbyA9IGZ1bmN0aW9uKCBvICl7XHJcblxyXG4gICAgaWYgKCAhdGhpcy51bmRvX3N0YWNrLmxlbmd0aCApXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgdmFyIG8gPSB0aGlzLnVuZG9fc3RhY2sucG9wKClcclxuXHJcbiAgICBvLm1vZGVsLnVucGFjayggaC5kZWVwQ29weSggby5wYWNrICkgKVxyXG5cclxuICAgIHRoaXMuc3RhY2sucHVzaCggbyApXHJcblxyXG4gICAgZGlzcGF0Y2goIG8ubW9kZWwgKVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0IClcclxuLmV4dGVuZCggaCApXHJcbi5leHRlbmQoe1xyXG4gICAgaW5pdDogaW5pdCxcclxuICAgIHVuZG86IHVuZG8sXHJcbiAgICByZWRvOiByZWRvLFxyXG4gICAgc2F2ZTogc2F2ZSxcclxufSlcclxuIiwiXHJcbnZhciBkZWVwQ29weSA9IGZ1bmN0aW9uKCBvICl7XHJcbiAgICBpZiggdHlwZW9mIG8gIT09ICdvYmplY3QnIClcclxuICAgICAgICByZXR1cm4gb1xyXG5cclxuICAgIGlmKCBBcnJheS5pc0FycmF5KCBvICkgKVxyXG4gICAgICAgIHJldHVybiBvLm1hcChkZWVwQ29weSlcclxuXHJcbiAgICB2YXIgcmVzID0ge31cclxuICAgIGZvciggdmFyIGkgaW4gbyApXHJcbiAgICAgICAgaWYoIHR5cGVvZiBvWyBpIF0gIT09ICdmdW5jdGlvbicgKVxyXG4gICAgICAgICAgICByZXNbIGkgXSA9IGRlZXBDb3B5KCBvWyBpIF0gKVxyXG4gICAgcmV0dXJuIHJlc1xyXG59XHJcblxyXG52YXIgdW5wYWNrID0gZnVuY3Rpb24oIG8gKXtcclxuICAgIGZvciggdmFyIGkgaW4gbyApXHJcbiAgICAgICAgdGhpc1sgaSBdID0gZGVlcENvcHkoIG9bIGkgXSApXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHBhY2s6IGZ1bmN0aW9uKCl7IHJldHVybiBkZWVwQ29weSggdGhpcyApIH0sXHJcbiAgICB1bnBhY2s6IHVucGFjayxcclxuICAgIGRlZXBDb3B5OiBkZWVwQ29weVxyXG59XHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uL3V0aWxzL0Fic3RyYWN0JylcclxuICAsIGVkID0gcmVxdWlyZSgnLi4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcblxyXG52YXIgaGFuZGxlciA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG4gICAgZWQuZGlzcGF0Y2goICd1aS0nK2V2ZW50LnR5cGUsIHtcclxuICAgICAgICBtb3VzZUV2ZW50OiBldmVudFxyXG4gICAgfSlcclxufVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggbW9kZWxCYWxsLCBkb21TdmcgKXtcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgaGFuZGxlciwgZmFsc2UgKVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIGhhbmRsZXIsIGZhbHNlIClcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgaGFuZGxlciwgZmFsc2UgKVxyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgaGFuZGxlciwgZmFsc2UgKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggQWJzdHJhY3QgKVxyXG4uZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXRcclxufSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgZWQgPSByZXF1aXJlKCcuLi8uLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuICAsIHN2ZyA9IHJlcXVpcmUoJy4vc3ZnLXV0aWwnKVxyXG5cclxuXHJcbnZhciByZW5kZXIgPSBmdW5jdGlvbiggKXtcclxuICAgIHZhciBmYWNlID0gdGhpcy5tb2RlbC5mYWNlXHJcbiAgICB2YXIgY2FtZXJhID0gdGhpcy5tb2RlbC5jYW1lcmFcclxuICAgIHZhciBwcm9qID0gZnVuY3Rpb24oIHAgKXtcclxuICAgICAgICB2YXIgcHAgPSBjYW1lcmEucHJvamVjdCggcCApXHJcbiAgICAgICAgcHAudHlwZSA9IHAudHlwZVxyXG4gICAgICAgIHJldHVybiBwcFxyXG4gICAgfVxyXG5cclxuICAgIGZvciggdmFyIGkgaW4gZmFjZS5jaHVuayApIHtcclxuICAgICAgICBmYWNlLmNodW5rWyBpIF0ucmVjb21wdXRlKClcclxuICAgICAgICB0aGlzLmRvbVsgaSBdLnNldEF0dHJpYnV0ZSggJ2QnLFxyXG4gICAgICAgICAgICBzdmcucmVuZGVyQmV6aWVyKCBmYWNlLmNodW5rWyBpIF0uYmV6aWVyUGF0aC5tYXAoIHByb2ogKSApXHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG59XHJcblxyXG52YXIgYnVpbGQgPSBmdW5jdGlvbiggZG9tU3ZnICl7XHJcbiAgICB2YXIgZmFjZSA9IHRoaXMubW9kZWwuZmFjZVxyXG5cclxuICAgIHRoaXMuZG9tID0ge31cclxuXHJcbiAgICBmb3IoIHZhciBpIGluIGZhY2UuY2h1bmsgKXtcclxuICAgICAgICB0aGlzLmRvbVsgaSBdID0gc3ZnLmNyZWF0ZSgncGF0aCcpXHJcbiAgICAgICAgdGhpcy5kb21bIGkgXS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2hhaXItY2h1bmsgJytpKVxyXG4gICAgICAgIGRvbVN2Zy5hcHBlbmRDaGlsZCggdGhpcy5kb21bIGkgXSApXHJcbiAgICB9XHJcbn1cclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oIG1vZGVsQmFsbCwgZG9tU3ZnICl7XHJcblxyXG4gICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICBmYWNlOiBtb2RlbEJhbGwuZmFjZSxcclxuICAgICAgICBjYW1lcmE6IG1vZGVsQmFsbC5jYW1lcmFcclxuICAgIH1cclxuXHJcbiAgICBidWlsZC5jYWxsKCB0aGlzLCBkb21TdmcgKVxyXG5cclxuICAgIGVkLmxpc3RlbiggJ3JlbmRlcicgLCByZW5kZXIuYmluZCggdGhpcyApICwgdGhpcyApXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApXHJcbi5leHRlbmQoe1xyXG4gICAgaW5pdDogaW5pdCxcclxuICAgIHJlbmRlcjogcmVuZGVyXHJcbn0pXHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0Fic3RyYWN0JylcclxuICAsIGVkID0gcmVxdWlyZSgnLi4vLi4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcbiAgLCBzdmcgPSByZXF1aXJlKCcuL3N2Zy11dGlsJylcclxuXHJcbnZhciB0aWMgPSBmdW5jdGlvbiggeCwgeSApe1xyXG4gICAgdmFyIHQgPSBzdmcuY3JlYXRlKCdjaXJjbGUnKVxyXG4gICAgdC5zZXRBdHRyaWJ1dGUoICdjeCcsIHggKVxyXG4gICAgdC5zZXRBdHRyaWJ1dGUoICdjeScsIHkgKVxyXG4gICAgdC5zZXRBdHRyaWJ1dGUoICdyJywgNSApXHJcbiAgICB0LnNldEF0dHJpYnV0ZSggJ2NsYXNzJywgJ2NvbnRyb2wtdGljJyApXHJcbiAgICByZXR1cm4gdFxyXG59XHJcblxyXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oICl7XHJcbiAgICB2YXIgZmFjZSA9IHRoaXMubW9kZWwuZmFjZVxyXG4gICAgdmFyIHByb2ogPSB0aGlzLm1vZGVsLmNhbWVyYS5wcm9qZWN0XHJcblxyXG4gICAgZm9yKCB2YXIgaSBpbiBmYWNlLmNodW5rICl7XHJcblxyXG4gICAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLmRvbVsgaSBdXHJcbiAgICAgICAgdmFyIHNoYXBlID0gZmFjZS5jaHVua1sgaSBdXHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xyXG5cclxuICAgICAgICB2YXIgcHRzLCBjLCBkXHJcblxyXG4gICAgICAgIGlmKCBzaGFwZS5saW5lICl7XHJcbiAgICAgICAgICAgIC8vIGlzIGEgbGluZVxyXG4gICAgICAgICAgICBwdHMgPSBzaGFwZS5saW5lXHJcbiAgICAgICAgICAgIGMgPSAnY29udHJvbC1saW5lJ1xyXG4gICAgICAgICAgICBkID0gJ2xpbmUnXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gaXMgYSBwYXRoXHJcbiAgICAgICAgICAgIHB0cyA9IHNoYXBlLnZlcnRleFxyXG4gICAgICAgICAgICBjID0gJ2NvbnRyb2wtcGF0aCdcclxuICAgICAgICAgICAgZCA9ICd2ZXJ0ZXgnXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdHMubWFwKCBwcm9qICkuZm9yRWFjaChmdW5jdGlvbiggcCwgaW5kZXggKXtcclxuICAgICAgICAgICAgdmFyIHQgPSB0aWMoIHAueCwgcC55IClcclxuICAgICAgICAgICAgdC5zZXRBdHRyaWJ1dGUoICdjbGFzcycsICdjb250cm9sLXRpYyAnK2MgKVxyXG4gICAgICAgICAgICB0LnNldEF0dHJpYnV0ZSggJ2RhdGEtaScsIGluZGV4IClcclxuICAgICAgICAgICAgdC5zZXRBdHRyaWJ1dGUoICdkYXRhLWNodW5rJywgaSApXHJcbiAgICAgICAgICAgIHQuc2V0QXR0cmlidXRlKCAnZGF0YS1wb29sJywgZCApXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCggdCApXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufVxyXG5cclxudmFyIGJ1aWxkID0gZnVuY3Rpb24oIGRvbVN2ZyApe1xyXG4gICAgdmFyIGZhY2UgPSB0aGlzLm1vZGVsLmZhY2VcclxuXHJcbiAgICB0aGlzLmRvbSA9IHt9XHJcblxyXG4gICAgZm9yKCB2YXIgaSBpbiBmYWNlLmNodW5rICl7XHJcbiAgICAgICAgdGhpcy5kb21bIGkgXSA9IHN2Zy5jcmVhdGUoJ2cnKVxyXG4gICAgICAgIHRoaXMuZG9tWyBpIF0uY2xhc3NOYW1lID0gJ2NvbnRyb2wgY29udHJvbC0nK2lcclxuICAgICAgICB0aGlzLmRvbVsgaSBdLnNldEF0dHJpYnV0ZSggJ2RhdGEtY2h1bmsnLCBpIClcclxuICAgICAgICBkb21TdmcuYXBwZW5kQ2hpbGQoIHRoaXMuZG9tWyBpIF0gKVxyXG4gICAgfVxyXG59XHJcblxyXG52YXIgZG93biA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG4gICAgaWYoICFldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCAnZGF0YS1wb29sJyApIClcclxuICAgICAgICByZXR1cm5cclxuXHJcbiAgICB2YXIgaSA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoICdkYXRhLWknICksXHJcbiAgICAgICAgY2h1bmsgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCAnZGF0YS1jaHVuaycgKSxcclxuICAgICAgICBwb29sID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSggJ2RhdGEtcG9vbCcgKVxyXG5cclxuICAgIGVkLmRpc3BhdGNoKCAndWktdGljLW1vdXNlZG93bicgLCB7XHJcbiAgICAgICAgaTogaSxcclxuICAgICAgICBjaHVuazogY2h1bmssXHJcbiAgICAgICAgcG9vbDogcG9vbCxcclxuICAgICAgICBtb3VzZUV2ZW50OiBldmVudFxyXG4gICAgfSlcclxufVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggbW9kZWxCYWxsLCBkb21TdmcgKXtcclxuXHJcbiAgICB0aGlzLm1vZGVsID0ge1xyXG4gICAgICAgIGZhY2U6IG1vZGVsQmFsbC5mYWNlLFxyXG4gICAgICAgIGNhbWVyYTogbW9kZWxCYWxsLmNhbWVyYSxcclxuICAgIH1cclxuXHJcbiAgICBidWlsZC5jYWxsKCB0aGlzLCBkb21TdmcgKVxyXG5cclxuXHJcbiAgICBkb21TdmcuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIGRvd24sIGZhbHNlIClcclxuXHJcblxyXG4gICAgZWQubGlzdGVuKCAncmVuZGVyJyAsIHJlbmRlci5iaW5kKCB0aGlzICkgLCB0aGlzIClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0IClcclxuLmV4dGVuZCh7XHJcbiAgICBpbml0OiBpbml0LFxyXG4gICAgcmVuZGVyOiByZW5kZXJcclxufSlcclxuIiwiXHJcbnZhciBmbG9vciA9IGZ1bmN0aW9uKCB4ICl7XHJcbiAgICByZXR1cm4gKDB8KHgqMTAwKSkvMTAwO1xyXG59XHJcbnZhciBwb2ludCA9IGZ1bmN0aW9uKCBwICl7XHJcbiAgIHJldHVybiBmbG9vcihwLngpKycgJytmbG9vcihwLnkpXHJcbn1cclxudmFyIHJlbmRlckJlemllciA9IGZ1bmN0aW9uKCBwdHMgKXtcclxuICAgIGlmKCAhcHRzLmxlbmd0aCApXHJcbiAgICAgICAgcmV0dXJuICcnXHJcbiAgICB2YXIgZD0nTScrcG9pbnQoIHB0c1swXSApXHJcbiAgICBmb3IoIHZhciBpID0gMTsgaTxwdHMubGVuZ3RoIDsgaSsrIClcclxuICAgICAgICBzd2l0Y2goIHB0c1tpXS50eXBlICl7XHJcbiAgICAgICAgICAgIGNhc2UgJ0YnOiBkKz0nTCcrcG9pbnQoIHB0c1tpXSApOyBicmVha1xyXG4gICAgICAgICAgICBjYXNlICdDJzogZCs9J1EnK3BvaW50KCBwdHNbaSsrXSApKycgJytwb2ludCggcHRzW2ldICk7IGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgcmV0dXJuIGQrJ3onXHJcbn1cclxudmFyIHJlbmRlckxpbmUgPSBmdW5jdGlvbiggcHRzLCBjbG9zZSApe1xyXG4gICAgcmV0dXJuICdNJytwdHMucmVkdWNlKGZ1bmN0aW9uKHAsIGMpe1xyXG4gICAgICAgIHJldHVybiBwKydMJytwb2ludChjKVxyXG4gICAgfSwnJykuc2xpY2UoMSkrKCBjbG9zZSA/ICd6JyA6ICcnIClcclxufVxyXG5cclxuXHJcbnZhciBzdmdOUyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcclxudmFyIGNyZWF0ZSA9IGZ1bmN0aW9uKCB0eXBlICl7XHJcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmdOUywgdHlwZSApXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgcmVuZGVyQmV6aWVyIDogcmVuZGVyQmV6aWVyLFxyXG4gICAgcmVuZGVyTGluZTogcmVuZGVyTGluZSxcclxuICAgIGNyZWF0ZTogY3JlYXRlLFxyXG5cclxuICAgIHN2Z05TOiBzdmdOU1xyXG59XHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0Fic3RyYWN0JylcclxuICAsIGRvbSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2RvbUhlbHBlcicpXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4uLy4uL3N5c3RlbS9ldmVudERpc3BhdGNoZXInKVxyXG5cclxuXHJcblxyXG5cclxuXHJcbnZhciBnZXREYXRlID0gZnVuY3Rpb24oIG1vdXNlRXZlbnQgKXtcclxuICAgIHZhciBvID0gZG9tLm9mZnNldCggdGhpcy5kb21FbCApLmxlZnRcclxuICAgIHZhciB4ID0gbW91c2VFdmVudC5wYWdlWFxyXG4gICAgcmV0dXJuIHRoaXMubW9kZWwudGltZUxpbmVTdGF0ZS51bnByb2plY3QoIHgtbyApXHJcbn1cclxudmFyIHJlbGF5RXZlbnQgPSBmdW5jdGlvbiggZXZlbnQgKXtcclxuICAgIHJldHVybiBlZC5kaXNwYXRjaCggJ3VpLXRsQ3Vyc29yLScrZXZlbnQudHlwZSwge1xyXG4gICAgICAgIGRhdGU6IGdldERhdGUuY2FsbCh0aGlzLCBldmVudCApLFxyXG4gICAgICAgIG1vdXNlRXZlbnQ6IGV2ZW50XHJcbiAgICB9KVxyXG59XHJcblxyXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oICl7XHJcbiAgICB2YXIgdGltZUxpbmVTdGF0ZSA9IHRoaXMubW9kZWwudGltZUxpbmVTdGF0ZVxyXG4gICAgdGhpcy5kb21DdXJzb3Iuc3R5bGUubGVmdCA9ICh0aW1lTGluZVN0YXRlLnByb2plY3QoIHRpbWVMaW5lU3RhdGUuY3Vyc29yICkgLTIpKydweCdcclxufVxyXG5cclxudmFyIHRwbCA9IFtcclxuJzxkaXYgY2xhc3M9XCJ0bC1ydWxlclwiPicsXHJcbiAgICAnPGRpdiBjbGFzcz1cInRsLWN1cnNvclwiPicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwidGwtcnVsZXItZ3JpZFwiPjwvZGl2PicsXHJcbic8L2Rpdj4nLFxyXG5dLmpvaW4oJycpXHJcblxyXG52YXIgYnVpbGQgPSBmdW5jdGlvbiggKXtcclxuXHJcbiAgICB0aGlzLmRvbUVsID0gZG9tLmRvbWlmeSggdHBsIClcclxuXHJcbiAgICB0aGlzLmRvbUN1cnNvciA9IHRoaXMuZG9tRWwucXVlcnlTZWxlY3RvcignLnRsLWN1cnNvcicpXHJcbn1cclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oIG1vZGVsQmFsbCwgYm9keSApe1xyXG5cclxuICAgIHRoaXMubW9kZWwgPSB7XHJcbiAgICAgICAgdGltZUxpbmVTdGF0ZTogbW9kZWxCYWxsLnRpbWVMaW5lU3RhdGUsXHJcbiAgICB9XHJcblxyXG4gICAgYnVpbGQuY2FsbCggdGhpcyApXHJcblxyXG4gICAgZWQubGlzdGVuKCAnY2hhbmdlOnRpbWVMaW5lU3RhdGUnICwgcmVuZGVyLmJpbmQoIHRoaXMgKSAsIHRoaXMgKVxyXG5cclxuICAgIHRoaXMuZG9tRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgcmVsYXlFdmVudC5iaW5kKHRoaXMpLCBmYWxzZSApXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApXHJcbi5leHRlbmQoe1xyXG4gICAgaW5pdDogaW5pdCxcclxuICAgIHJlbmRlcjogcmVuZGVyXHJcbn0pXHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0Fic3RyYWN0JylcclxuICAsIGRvbSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2RvbUhlbHBlcicpXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4uLy4uL3N5c3RlbS9ldmVudERpc3BhdGNoZXInKVxyXG4gICwgUnVsZXIgPSByZXF1aXJlKCcuL3J1bGVyJylcclxuXHJcblxyXG52YXIga2V5X3RwbCA9IFtcclxuJzxkaXYgY2xhc3M9XCJ0bC1rZXlcIj4nLFxyXG4nPC9kaXY+JyxcclxuXS5qb2luKCcnKVxyXG5cclxudmFyIGxhYmVsX3RwbCA9IFtcclxuJzxkaXYgY2xhc3M9XCJ0bC1yb3dcIj4nLFxyXG4gICAgJzxzcGFuIGNsYXNzPVwidGwtbGFiZWxcIj48L3NwYW4+JyxcclxuJzwvZGl2PicsXHJcbl0uam9pbignJylcclxuXHJcbnZhciByb3dfdHBsID0gW1xyXG4nPGRpdiBjbGFzcz1cInRsLXJvd1wiPicsXHJcbic8L2Rpdj4nLFxyXG5dLmpvaW4oJycpXHJcblxyXG52YXIgdHBsID0gW1xyXG4nPGRpdiBjbGFzcz1cInRsXCI+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwidGwtbGVmdFwiPicsXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJ0bC1ibG9jay1sYWJlbFwiPjwvZGl2PicsXHJcbiAgICAnPC9kaXY+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwidGwtcmlnaHRcIj4nLFxyXG4gICAgICAgICc8ZGl2IGNsYXNzPVwidGwtYmxvY2stbGluZXNcIj48L2Rpdj4nLFxyXG4gICAgJzwvZGl2PicsXHJcbic8L2Rpdj4nLFxyXG5dLmpvaW4oJycpXHJcblxyXG5cclxudmFyIGdldERhdGUgPSBmdW5jdGlvbiggbW91c2VFdmVudCApe1xyXG4gICAgdmFyIG8gPSBkb20ub2Zmc2V0KCB0aGlzLmRvbUVsLnF1ZXJ5U2VsZWN0b3IoJy50bC1ibG9jay1saW5lcycpICkubGVmdFxyXG4gICAgdmFyIHggPSBtb3VzZUV2ZW50LnBhZ2VYXHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbC50aW1lTGluZVN0YXRlLnVucHJvamVjdCggeC1vIClcclxufVxyXG52YXIgcmVsYXlFdmVudCA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG5cclxuICAgIC8vIG9ubHkgY29uc2lkZXIgbWFpbiBidXR0b24gKCBidXR0b24gPT0gMCApXHJcbiAgICBpZiggZXZlbnQuYnV0dG9uIClcclxuICAgICAgICByZXR1cm5cclxuXHJcbiAgICB2YXIga2V5LCBsaW5lXHJcbiAgICBpZigga2V5ID0gZG9tLmdldFBhcmVudCggZXZlbnQudGFyZ2V0LCAndGwta2V5JyApIClcclxuICAgICAgICByZXR1cm4gZWQuZGlzcGF0Y2goICd1aS10bEtleS0nK2V2ZW50LnR5cGUsIHtcclxuICAgICAgICAgICAgbW91c2VFdmVudDogZXZlbnQsXHJcbiAgICAgICAgICAgIGNodW5rOiBkb20uZ2V0UGFyZW50KCBrZXksICd0bC1yb3cnICkuZ2V0QXR0cmlidXRlKCdkYXRhLWNodW5rJyksXHJcbiAgICAgICAgICAgIGk6IGtleS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaScpLFxyXG4gICAgICAgICAgICBkYXRlOiBnZXREYXRlLmNhbGwoIHRoaXMsIGV2ZW50IClcclxuICAgICAgICB9KVxyXG5cclxuICAgIGlmKCBsaW5lID0gZG9tLmdldFBhcmVudCggZXZlbnQudGFyZ2V0LCAndGwtcm93JyApIClcclxuICAgICAgICByZXR1cm4gZWQuZGlzcGF0Y2goICd1aS10bExpbmUtJytldmVudC50eXBlLCB7XHJcbiAgICAgICAgICAgIG1vdXNlRXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICBjaHVuazogbGluZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2h1bmsnKSxcclxuICAgICAgICAgICAgZGF0ZTogZ2V0RGF0ZS5jYWxsKCB0aGlzLCBldmVudCApXHJcbiAgICAgICAgfSlcclxufVxyXG5cclxudmFyIHJlbmRlciA9IGZ1bmN0aW9uKCApe1xyXG4gICAgdmFyIHRpbWVMaW5lID0gdGhpcy5tb2RlbC50aW1lTGluZVxyXG4gICAgdmFyIHByb2ogPSB0aGlzLm1vZGVsLnRpbWVMaW5lU3RhdGUucHJvamVjdFxyXG5cclxuICAgIC8vIGZvciBlYWNoIGNodW5rXHJcbiAgICBmb3IoIHZhciBrIGluIHRoaXMuZG9tTGluZXMgKXtcclxuXHJcbiAgICAgICAgLy8gY2xlYW4gdXBcclxuICAgICAgICB2YXIgYyA9IHRoaXMuZG9tTGluZXNbIGsgXS5jaGlsZHJlbjtcclxuICAgICAgICBmb3IoIHZhciBpPWMubGVuZ3RoOyBpLS07IClcclxuICAgICAgICAgICAgY1sgaSBdLnJlbW92ZSgpXHJcblxyXG4gICAgICAgIC8vIGZvciBlYWNoIGtleVxyXG4gICAgICAgIGZvciggdmFyIGk9KHRpbWVMaW5lLmtleXNbIGsgXXx8W10pLmxlbmd0aDsgaS0tOyApe1xyXG5cclxuICAgICAgICAgICAgdmFyIGRrID0gZG9tLmRvbWlmeSgga2V5X3RwbCApXHJcbiAgICAgICAgICAgIGRrLnNldEF0dHJpYnV0ZSggJ2RhdGEtaScsIGkgKVxyXG4gICAgICAgICAgICBkay5zdHlsZS5sZWZ0ID0gKHByb2ooIHRpbWVMaW5lLmtleXNbIGsgXVsgaSBdLmRhdGUgKSAtNSkrJ3B4J1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kb21MaW5lc1sgayBdLmFwcGVuZENoaWxkKCBkayApXHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn1cclxuXHJcbnZhciBidWlsZCA9IGZ1bmN0aW9uKCApe1xyXG4gICAgdmFyIGZhY2UgPSB0aGlzLm1vZGVsLmZhY2VcclxuXHJcbiAgICB0aGlzLmRvbUVsID0gZG9tLmRvbWlmeSggdHBsIClcclxuXHJcbiAgICB2YXIgbGFiZWxzID0gdGhpcy5kb21FbC5xdWVyeVNlbGVjdG9yKCcudGwtYmxvY2stbGFiZWwnKSxcclxuICAgICAgICBsaW5lcyA9IHRoaXMuZG9tRWwucXVlcnlTZWxlY3RvcignLnRsLWJsb2NrLWxpbmVzJylcclxuXHJcbiAgICB0aGlzLmRvbUVsLnF1ZXJ5U2VsZWN0b3IoJy50bC1yaWdodCcpLmluc2VydEJlZm9yZSggdGhpcy5ydWxlci5kb21FbCwgbGluZXMgKVxyXG5cclxuICAgIHRoaXMuZG9tTGluZXMgPSB7fVxyXG5cclxuICAgIHZhciBrPTBcclxuICAgIGZvciggdmFyIGkgaW4gZmFjZS5jaHVuayApe1xyXG4gICAgICAgIHZhciBsYWJlbCA9IGRvbS5kb21pZnkoIGxhYmVsX3RwbCApXHJcbiAgICAgICAgdmFyIHJvdyA9IGRvbS5kb21pZnkoIHJvd190cGwgKVxyXG5cclxuICAgICAgICBsYWJlbC5xdWVyeVNlbGVjdG9yKCcudGwtbGFiZWwnKS5pbm5lckhUTUwgPSBpLnJlcGxhY2UoJ18nLCAnICcpXHJcblxyXG4gICAgICAgIHJvdy5zZXRBdHRyaWJ1dGUoJ2RhdGEtY2h1bmsnLCBpKVxyXG5cclxuICAgICAgICBsYWJlbHMuYXBwZW5kQ2hpbGQoIGxhYmVsIClcclxuICAgICAgICBsaW5lcy5hcHBlbmRDaGlsZCggcm93IClcclxuXHJcbiAgICAgICAgdGhpcy5kb21MaW5lc1sgaSBdID0gcm93XHJcbiAgICB9XHJcbn1cclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oIG1vZGVsQmFsbCwgdGltZUxpbmVFTCApe1xyXG5cclxuICAgIHRoaXMubW9kZWwgPSB7XHJcbiAgICAgICAgZmFjZTogbW9kZWxCYWxsLmZhY2UsXHJcbiAgICAgICAgdGltZUxpbmVTdGF0ZTogbW9kZWxCYWxsLnRpbWVMaW5lU3RhdGUsXHJcbiAgICAgICAgdGltZUxpbmU6IG1vZGVsQmFsbC50aW1lTGluZSxcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJ1bGVyID0gT2JqZWN0LmNyZWF0ZSggUnVsZXIgKS5pbml0KCBtb2RlbEJhbGwgKVxyXG5cclxuICAgIGJ1aWxkLmNhbGwoIHRoaXMgKVxyXG5cclxuICAgIHRpbWVMaW5lRUwuY2xhc3NOYW1lICs9ICcgdGwnXHJcbiAgICBmb3IoIHZhciBpID0gdGhpcy5kb21FbC5jaGlsZHJlbi5sZW5ndGg7IGktLTsgKVxyXG4gICAgICAgIHRpbWVMaW5lRUwuYXBwZW5kQ2hpbGQoIHRoaXMuZG9tRWwuY2hpbGRyZW5baV0gKVxyXG4gICAgdGhpcy5kb21FbCA9IHRpbWVMaW5lRUxcclxuXHJcblxyXG4gICAgZWQubGlzdGVuKCAnY2hhbmdlOnRpbWVMaW5lJyAsIHJlbmRlci5iaW5kKCB0aGlzICkgLCB0aGlzIClcclxuICAgIGVkLmxpc3RlbiggJ3JlbmRlcicgLCByZW5kZXIuYmluZCggdGhpcyApICwgdGhpcyApXHJcblxyXG4gICAgdGhpcy5kb21FbC5xdWVyeVNlbGVjdG9yKCcudGwtYmxvY2stbGluZXMnKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCByZWxheUV2ZW50LmJpbmQodGhpcyksIGZhbHNlIClcclxuICAgIHRoaXMuZG9tRWwucXVlcnlTZWxlY3RvcignLnRsLWJsb2NrLWxpbmVzJykuYWRkRXZlbnRMaXN0ZW5lcignZG91YmxlY2xpY2snLCByZWxheUV2ZW50LmJpbmQodGhpcyksIGZhbHNlIClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0IClcclxuLmV4dGVuZCh7XHJcbiAgICBpbml0OiBpbml0LFxyXG4gICAgcmVuZGVyOiByZW5kZXJcclxufSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgZWQgPSByZXF1aXJlKCcuLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuICAsIGludGVycG9sYXRlID0gcmVxdWlyZSgnLi4vc3lzdGVtL2ludGVycG9sYXRlJylcclxuXHJcbiB2YXIgaW5pdCA9IGZ1bmN0aW9uKCBtb2RlbEJhbGwgKXtcclxuXHJcbiAgICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICAgZmFjZTogbW9kZWxCYWxsLmZhY2UsXHJcbiAgICAgICAgIHRpbWVMaW5lOiBtb2RlbEJhbGwudGltZUxpbmUsXHJcbiAgICAgICAgIHRpbWVMaW5lU3RhdGU6IG1vZGVsQmFsbC50aW1lTGluZVN0YXRlXHJcbiAgICAgfVxyXG5cclxuICAgICB0aGlzLmNoYW5nZVNoYXBlID0gY2hhbmdlU2hhcGUuYmluZCggdGhpcyApXHJcbiAgICAgdGhpcy5jaGFuZ2VDdXJzb3IgPSBjaGFuZ2VDdXJzb3IuYmluZCggdGhpcyApXHJcblxyXG4gICAgIHJldHVybiB0aGlzXHJcbiB9XHJcblxyXG4gdmFyIGVuYWJsZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgdGhpcy5kaXNhYmxlKClcclxuICAgICBlZC5saXN0ZW4oICdjaGFuZ2U6c2hhcGUnLCB0aGlzLmNoYW5nZVNoYXBlLCB0aGlzIClcclxuICAgICBlZC5saXN0ZW4oICdjaGFuZ2U6dGltZUxpbmVTdGF0ZScsIHRoaXMuY2hhbmdlQ3Vyc29yLCB0aGlzIClcclxuIH1cclxuIHZhciBkaXNhYmxlID0gZnVuY3Rpb24oKXtcclxuICAgICBlZC51bmxpc3RlbiggJ2NoYW5nZTpzaGFwZScsIHRoaXMgKVxyXG4gICAgIGVkLnVubGlzdGVuKCAnY2hhbmdlOnRpbWVMaW5lU3RhdGUnLCB0aGlzIClcclxuIH1cclxuXHJcbiB2YXIgY2hhbmdlU2hhcGUgPSBmdW5jdGlvbiggZXZlbnQgKXtcclxuXHJcbiAgICAgaWYoZXZlbnQud2lwIHx8IGV2ZW50LmlzX2ludGVycG9sYXRpb24pXHJcbiAgICAgICAgIHJldHVyblxyXG5cclxuICAgICBmb3IoIHZhciBjaHVuayBpbiB0aGlzLm1vZGVsLmZhY2UuY2h1bmsgKVxyXG4gICAgICAgICBpZiggdGhpcy5tb2RlbC5mYWNlLmNodW5rW2NodW5rXSA9PSBldmVudC5zaGFwZSApXHJcbiAgICAgICAgICAgICBicmVha1xyXG5cclxuICAgICB0aGlzLm1vZGVsLnRpbWVMaW5lLmFkZE9yU2V0S2V5KCBjaHVuaywgdGhpcy5tb2RlbC50aW1lTGluZVN0YXRlLmN1cnNvciwgZXZlbnQuc2hhcGUucGFjaygpIClcclxuXHJcbiAgICAgZWQuZGlzcGF0Y2goICdjaGFuZ2U6dGltZUxpbmUnLCB7XHJcbiAgICAgICAgIHdpcDogZmFsc2VcclxuICAgICB9KVxyXG4gfVxyXG4gdmFyIGNoYW5nZUN1cnNvciA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG5cclxuICAgICB2YXIgZmNodW5rID0gdGhpcy5tb2RlbC5mYWNlLmNodW5rLFxyXG4gICAgICAgICBkYXRlID0gdGhpcy5tb2RlbC50aW1lTGluZVN0YXRlLmN1cnNvcixcclxuICAgICAgICAga2V5cyA9IHRoaXMubW9kZWwudGltZUxpbmUua2V5c1xyXG5cclxuICAgICBpZiggdGhpcy5fY3Vyc29yID09IGRhdGUgKVxyXG4gICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgZm9yKCB2YXIgY2h1bmsgaW4ga2V5cyApe1xyXG4gICAgICAgICB2YXIgayA9IGtleXNbIGNodW5rIF1cclxuXHJcblxyXG4gICAgICAgICAvLyBUT0RPIGRldGVjdCB3aGVuIHRoZSBzaGFwZSBkb2VzIG5vdCBjaGFuZ2UsIGRvbnQgYXNrIGZvciByZWRyYXcgdGhlblxyXG5cclxuXHJcbiAgICAgICAgIGlmKCBkYXRlIDw9IGtbIDAgXS5kYXRlIClcclxuICAgICAgICAgICAgIGZjaHVua1sgY2h1bmsgXS51bnBhY2soIGtbIDAgXS5wYWNrIClcclxuXHJcbiAgICAgICAgIGVsc2UgaWYoIGRhdGUgPj0ga1sgay5sZW5ndGgtMSBdLmRhdGUgKVxyXG4gICAgICAgICAgICAgZmNodW5rWyBjaHVuayBdLnVucGFjaygga1sgay5sZW5ndGgtMSBdLnBhY2sgKVxyXG5cclxuICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgZm9yKCB2YXIgaT0xOyBpPGsubGVuZ3RoICYmIGtbaV0uZGF0ZTxkYXRlOyBpKysgKTtcclxuXHJcbiAgICAgICAgICAgICB2YXIgYSA9IGtbaS0xXSxcclxuICAgICAgICAgICAgICAgICBiID0ga1tpXVxyXG5cclxuICAgICAgICAgICAgIHZhciBhbHBoYSA9ICggZGF0ZSAtIGEuZGF0ZSApLyggYi5kYXRlIC0gYS5kYXRlIClcclxuXHJcbiAgICAgICAgICAgICBmY2h1bmtbIGNodW5rIF0udW5wYWNrKCBpbnRlcnBvbGF0ZS5sZXJwUGFjayggYS5wYWNrLCBiLnBhY2sgLCBhbHBoYSApIClcclxuICAgICAgICAgfVxyXG5cclxuICAgICAgICAgZWQuZGlzcGF0Y2goICdjaGFuZ2U6cG9pbnQnLCB7XHJcbiAgICAgICAgICAgICB3aXA6IGV2ZW50LndpcCxcclxuICAgICAgICAgICAgIHNoYXBlOiBmY2h1bmtbIGNodW5rIF0sXHJcbiAgICAgICAgICAgICBpc19pbnRlcnBvbGF0aW9uOiB0cnVlXHJcbiAgICAgICAgIH0pXHJcbiAgICAgfVxyXG4gfVxyXG5cclxuXHJcblxyXG4gbW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApLmV4dGVuZCh7XHJcbiAgICAgaW5pdDogaW5pdCxcclxuICAgICBlbmFibGU6IGVuYWJsZSxcclxuICAgICBkaXNhYmxlOiBkaXNhYmxlLFxyXG4gfSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgZWQgPSByZXF1aXJlKCcuLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oIG1vZGVsQmFsbCApe1xyXG5cclxuICAgIHRoaXMuY2hhbmdlUG9pbnQgPSBjaGFuZ2VQb2ludC5iaW5kKCB0aGlzIClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG52YXIgZW5hYmxlID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuZGlzYWJsZSgpXHJcbiAgICBlZC5saXN0ZW4oICdjaGFuZ2U6cG9pbnQnLCB0aGlzLmNoYW5nZVBvaW50LCB0aGlzIClcclxufVxyXG52YXIgZGlzYWJsZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICBlZC51bmxpc3RlbiggJ2NoYW5nZTpwb2ludCcsIHRoaXMgKVxyXG59XHJcblxyXG52YXIgY2hhbmdlUG9pbnQgPSBmdW5jdGlvbiggZXZlbnQgKXtcclxuXHJcbiAgICBldmVudC5zaGFwZS5yZWNvbXB1dGUoKTtcclxuXHJcbiAgICBlZC5kaXNwYXRjaCggJ2NoYW5nZTpzaGFwZScsIHtcclxuICAgICAgICB3aXA6IGV2ZW50LndpcCxcclxuICAgICAgICBpc19pbnRlcnBvbGF0aW9uOiBldmVudC5pc19pbnRlcnBvbGF0aW9uLFxyXG4gICAgICAgIHNoYXBlOiBldmVudC5zaGFwZVxyXG4gICAgfSlcclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0ICkuZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXQsXHJcbiAgICBlbmFibGU6IGVuYWJsZSxcclxuICAgIGRpc2FibGU6IGRpc2FibGUsXHJcbn0pXHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uL3V0aWxzL0Fic3RyYWN0JylcclxuXHJcbnZhciBsaXN0ZW5lciA9IHt9O1xyXG5cclxudmFyIGRpc3BhdGNoID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgZGF0YSApe1xyXG5cclxuXHJcblxyXG4gICAgaWYodHJ1ZSlcclxuICAgICAgICBzd2l0Y2goZXZlbnROYW1lKXtcclxuICAgICAgICAgICAgY2FzZSAndWktbW91c2Vtb3ZlJzpcclxuICAgICAgICAgICAgY2FzZSAncmVuZGVyM0QtY2FtZXJhLWNoYW5nZSc6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGV2ZW50TmFtZSwgZGF0YSlcclxuICAgICAgICB9XHJcblxyXG4gICAgdGhpcy5fbG9jayA9IHRydWVcclxuXHJcbiAgICB2YXIgbCA9IGxpc3RlbmVyWyBldmVudE5hbWUgXSB8fCBbXVxyXG4gICAgZm9yKCB2YXIgaSA9IDA7IGk8bC5sZW5ndGg7IGkrKylcclxuICAgICAgICBsW2ldLmZuKGRhdGEsIGV2ZW50TmFtZSlcclxuXHJcbiAgICB0aGlzLl9sb2NrID0gZmFsc2VcclxuICAgIHdoaWxlKCAodGhpcy5fc3RhY2t8fFtdKS5sZW5ndGggKXtcclxuICAgICAgICB2YXIgbyA9IHRoaXMuX3N0YWNrLnNoaWZ0KClcclxuICAgICAgICB0aGlzWyBvLmZuIF0uYXBwbHkoIHRoaXMsIG8uYXJncylcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcbnZhciBsaXN0ZW4gPSBmdW5jdGlvbiggZXZlbnROYW1lLCBmbiAsIGtleSApe1xyXG5cclxuICAgIGlmICggdGhpcy5fbG9jayApXHJcbiAgICAgICAgcmV0dXJuIHZvaWQgKCB0aGlzLl9zdGFjayA9IHRoaXMuX3N0YWNrIHx8IFtdICkucHVzaCh7IGZuOidsaXN0ZW4nLCBhcmdzOiBhcmd1bWVudHMgfSlcclxuXHJcbiAgICA7KCBsaXN0ZW5lclsgZXZlbnROYW1lIF0gPSBsaXN0ZW5lclsgZXZlbnROYW1lIF0gfHwgW10gKS5wdXNoKHtcclxuICAgICAgICBmbjogZm4sXHJcbiAgICAgICAga2V5OiBrZXlcclxuICAgIH0pXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcbnZhciB1bmxpc3RlbiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGtleSApe1xyXG5cclxuICAgIGlmICggdGhpcy5fbG9jayApXHJcbiAgICAgICAgcmV0dXJuIHZvaWQgKCB0aGlzLl9zdGFjayA9IHRoaXMuX3N0YWNrIHx8IFtdICkucHVzaCh7IGZuOid1bmxpc3RlbicsIGFyZ3M6IGFyZ3VtZW50cyB9KVxyXG5cclxuICAgIHZhciBsID0gKCBsaXN0ZW5lclsgZXZlbnROYW1lIF0gPSBsaXN0ZW5lclsgZXZlbnROYW1lIF0gfHwgW10gKVxyXG4gICAgZm9yKCB2YXIgaSA9IGwubGVuZ3RoOyBpLS07KVxyXG4gICAgICAgIGlmKCBsW2ldLmtleSA9PSBrZXkgKVxyXG4gICAgICAgICAgICBsLnNwbGljZShpLDEpXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcbnZhciBoYXNMaXN0ZW5lciA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGtleSApe1xyXG4gICAgcmV0dXJuICEhKCBsaXN0ZW5lclsgZXZlbnROYW1lIF0gfHwgW10gKS5sZW5ndGhcclxufVxyXG52YXIgcmVzZXQgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBrZXkgKXtcclxuICAgIGxpc3RlbmVyID0ge31cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApXHJcbi5leHRlbmQoe1xyXG4gICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxyXG4gICAgbGlzdGVuOiBsaXN0ZW4sXHJcbiAgICB1bmxpc3RlbjogdW5saXN0ZW4sXHJcbiAgICBoYXNMaXN0ZW5lcjogaGFzTGlzdGVuZXIsXHJcbiAgICByZXNldDogcmVzZXRcclxufSlcclxuIiwidmFyIHUgPSByZXF1aXJlKCcuLi91dGlscy9wb2ludCcpXHJcblxyXG5cclxuLy8gYSAoMS1hbHBoYSkgKyBiIGFscGhhXHJcbnZhciBsZXJwUG9pbnRzID0gZnVuY3Rpb24oIGFwdHMsIGJwdHMsIGFscGhhICl7XHJcblxyXG4gICAgLy8gZW5zdXJlIHRoYXQgdGhlIGFycmF5IGFyZSBzYW1lIGxlbmd0aGVkXHJcbiAgICB3aGlsZSggYXB0cy5sZW5ndGggPCBicHRzLmxlbmd0aCApXHJcbiAgICAgICAgYXB0cy5wdXNoKCB1LmNvcHkoIGJwdHNbYnB0cy5sZW5ndGgtMV0gKSApXHJcblxyXG4gICAgd2hpbGUoIGJwdHMubGVuZ3RoIDwgYXB0cy5sZW5ndGggKVxyXG4gICAgICAgIGJwdHMucHVzaCggdS5jb3B5KCBhcHRzW2FwdHMubGVuZ3RoLTFdICkgKVxyXG5cclxuXHJcbiAgICB2YXIgcmVzID0gW11cclxuXHJcbiAgICBmb3IodmFyIGk9MDsgaTxhcHRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIHJlcy5wdXNoKCB1LmxlcnAoIGFwdHNbaV0sIGJwdHNbaV0sIGFscGhhICkgKVxyXG5cclxuICAgIHJldHVybiByZXNcclxufVxyXG5cclxuLy8gYSAoMS1hbHBoYSkgKyBiIGFscGhhXHJcbnZhciBsZXJwTnVtYmVyID0gZnVuY3Rpb24oIGFwdHMsIGJwdHMsIGFscGhhICl7XHJcblxyXG4gICAgLy8gZW5zdXJlIHRoYXQgdGhlIGFycmF5IGFyZSBzYW1lIGxlbmd0aGVkXHJcbiAgICB3aGlsZSggYXB0cy5sZW5ndGggPCBicHRzLmxlbmd0aCApXHJcbiAgICAgICAgYXB0cy5wdXNoKCB1LmNvcHkoIGJwdHNbYnB0cy5sZW5ndGgtMV0gKSApXHJcblxyXG4gICAgd2hpbGUoIGJwdHMubGVuZ3RoIDwgYXB0cy5sZW5ndGggKVxyXG4gICAgICAgIGJwdHMucHVzaCggdS5jb3B5KCBhcHRzW2FwdHMubGVuZ3RoLTFdICkgKVxyXG5cclxuXHJcbiAgICB2YXIgcmVzID0gW11cclxuXHJcbiAgICB2YXIgYWFscGhhID0gMS1hbHBoYVxyXG5cclxuICAgIGZvcih2YXIgaT0wOyBpPGFwdHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgcmVzLnB1c2goIGFhbHBoYSAqIGFwdHNbaV0gKyBhbHBoYSAqIGJwdHNbaV0gKVxyXG5cclxuICAgIHJldHVybiByZXNcclxufVxyXG5cclxuLy8gYSAoMS1hbHBoYSkgKyBiIGFscGhhXHJcbnZhciBsZXJwUGFjayA9IGZ1bmN0aW9uKCBhcGFjaywgYnBhY2sgLCBhbHBoYSApe1xyXG4gICAgdmFyIHJlcyA9IHt9XHJcblxyXG4gICAgZm9yKCB2YXIgaSBpbiBhcGFjayApXHJcbiAgICAgICAgc3dpdGNoKCBpICl7XHJcbiAgICAgICAgICAgIGNhc2UgJ2xpbmUnOlxyXG4gICAgICAgICAgICBjYXNlICd2ZXJ0ZXgnOlxyXG4gICAgICAgICAgICAgICAgcmVzWyBpIF0gPSBsZXJwUG9pbnRzKCBhcGFja1tpXSwgYnBhY2tbaV0sIGFscGhhIClcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgICAgICBjYXNlICd3aWR0aCc6XHJcbiAgICAgICAgICAgICAgICByZXNbIGkgXSA9IGxlcnBOdW1iZXIoIGFwYWNrW2ldLCBicGFja1tpXSwgYWxwaGEgKVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGxlcnBQYWNrOiBsZXJwUGFja1xyXG59XHJcbiIsInZhciB1ID0gcmVxdWlyZSgnLi4vdXRpbHMvcG9pbnQnKVxyXG5cclxuXHJcbnZhciByZXNvbHZlVW5jYXBTaGFycG5lc3MgPSBmdW5jdGlvbiggc2hhcnBuZXNzICl7XHJcblxyXG4gICAgdmFyIF9hID0gc2hhcnBuZXNzWyAwIF0sXHJcbiAgICAgICAgIGEsXHJcbiAgICAgICAgIHRcclxuXHJcbiAgICBmb3IoIHZhciBpID0gc2hhcnBuZXNzLmxlbmd0aDsgaS0tOyApe1xyXG4gICAgICAgIGEgID0gX2FcclxuICAgICAgICBfYSA9IHNoYXJwbmVzc1sgaSBdXHJcblxyXG4gICAgICAgIC8vIF9hIGFcclxuICAgICAgICAvLyAtMSAwXHJcblxyXG4gICAgICAgIGlmKCB0ID0gKCBfYS5uZXh0ICsgYS5iZWZvcmUgKSA+IDEgKXtcclxuICAgICAgICAgICAgX2EubmV4dCAvPSB0XHJcbiAgICAgICAgICAgIGEuYmVmb3JlIC89IHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNoYXJwbmVzc1xyXG59XHJcbnZhciBiZXppZnkgPSBmdW5jdGlvbiggcHRzLCBzaGFycG5lc3MgKXtcclxuXHJcbiAgICB2YXIgZGVmYXVsdF9zaGFycG5lc3NcclxuXHJcbiAgICBpZiggcHRzLmxlbmd0aDwyIClcclxuICAgICAgICByZXR1cm4gW11cclxuXHJcbiAgICBpZiggIXNoYXJwbmVzcyB8fCB0eXBlb2Ygc2hhcnBuZXNzID09ICdudW1iZXInIClcclxuICAgICAgICBkZWZhdWx0X3NoYXJwbmVzcyA9IHNoYXJwbmVzcyB8fCAwLjI1XHJcbiAgICBlbHNlXHJcbiAgICAgICAgcmVzb2x2ZVVuY2FwU2hhcnBuZXNzKCBzaGFycG5lc3MgKVxyXG5cclxuXHJcbiAgICB2YXIgX2EgPSBwdHNbIDAgXSxcclxuICAgICAgICAgYSA9IHB0c1sgMSBdLFxyXG4gICAgICAgIGFfLCBlXywgX2UsXHJcbiAgICAgICAgc18sIF9zXHJcblxyXG5cclxuICAgIHZhciBiZXppZXJQYXRoID0gW11cclxuICAgIGZvciggdmFyIGk9cHRzLmxlbmd0aDsgaS0tOyApe1xyXG5cclxuICAgICAgICAvLyBfYSBhIGFfIGlzIGEgdmVydGV4XHJcbiAgICAgICAgLy8gLTEgMCArMVxyXG4gICAgICAgIGFfID0gIGFcclxuICAgICAgICBhICA9IF9hXHJcbiAgICAgICAgX2EgPSBwdHNbIGkgXVxyXG5cclxuICAgICAgICAvLyBjb21wdXRlIGZpeGVkIHBvaW50ICggZGVwZW5kcyBvbiBzaGFycG5lc3MgKVxyXG5cclxuICAgICAgICBfcyA9IGRlZmF1bHRfc2hhcnBuZXNzIHx8IHNoYXJwbmVzc1sgaSBdLmJlZm9yZVxyXG4gICAgICAgIHNfID0gZGVmYXVsdF9zaGFycG5lc3MgfHwgc2hhcnBuZXNzWyBpIF0uYWZ0ZXJcclxuXHJcbiAgICAgICAgZV8gPSB1LmxlcnAoIGEsIF9hLCBfcyApXHJcbiAgICAgICAgX2UgPSB1LmxlcnAoIGEsIGFfLCBzXyApXHJcblxyXG4gICAgICAgIGVfLnR5cGUgPSAnRidcclxuICAgICAgICBfZS50eXBlID0gJ0YnXHJcblxyXG4gICAgICAgIGEudHlwZSA9ICdDJ1xyXG5cclxuICAgICAgICBiZXppZXJQYXRoLnB1c2goIF9lLCBhLCBlXyApXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJlemllclBhdGhcclxufVxyXG5cclxudmFyIGV4cGFuZE11c3RhY2ggPSBmdW5jdGlvbiggcHRzLCBocyApe1xyXG4gICAgcmV0dXJuIHB0cy5yZWR1Y2UoIGZ1bmN0aW9uKCBwLCBhLCBpICl7XHJcbiAgICAgICAgaWYoIGk9PTAgfHwgaT09cHRzLmxlbmd0aC0xICl7XHJcbiAgICAgICAgICAgIHAucHVzaCggYSApXHJcbiAgICAgICAgICAgIHJldHVybiBwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBhXyA9IHUubm9ybWFsaXplKCB1LmRpZmYoIHB0c1tpLTFdLCBhICkgKSxcclxuICAgICAgICAgICAgX2EgPSB1Lm5vcm1hbGl6ZSggdS5kaWZmKCBhLCBwdHNbaSsxXSApIClcclxuXHJcbiAgICAgICAgdmFyIG4gPSBhX1xyXG5cclxuICAgICAgICBuLnggPSBfYS54ICsgYV8ueFxyXG4gICAgICAgIG4ueSA9IF9hLnkgKyBhXy55XHJcblxyXG4gICAgICAgIHUubm9ybWFsaXplKCBuIClcclxuXHJcbiAgICAgICAgdmFyIHRtcCA9IG4ueFxyXG4gICAgICAgIG4ueCA9IG4ueVxyXG4gICAgICAgIG4ueSA9IC10bXBcclxuXHJcbiAgICAgICAgcC51bnNoaWZ0KHtcclxuICAgICAgICAgICAgeDogYS54ICsgbi54ICogaHNbaV0sXHJcbiAgICAgICAgICAgIHk6IGEueSArIG4ueSAqIGhzW2ldXHJcbiAgICAgICAgfSlcclxuICAgICAgICBwLnB1c2goe1xyXG4gICAgICAgICAgICB4OiBhLnggLSBuLnggKiBoc1tpXSxcclxuICAgICAgICAgICAgeTogYS55IC0gbi55ICogaHNbaV1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICByZXR1cm4gcFxyXG4gICAgfSwgW10pXHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGV4cGFuZE11c3RhY2g6IGV4cGFuZE11c3RhY2gsXHJcbiAgICBiZXppZnk6IGJlemlmeVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgaW5pdDpmdW5jdGlvbigpeyByZXR1cm4gdGhpc30sXHJcbiAgICBleHRlbmQ6ZnVuY3Rpb24obyl7XHJcbiAgICAgICAgZm9yKHZhciBpIGluIG8gKXtcclxuICAgICAgICAgICAgdGhpc1tpXSA9IG9baV1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGhhc0NsYXNzIDogZnVuY3Rpb24oIGVsICwgYyApe1xyXG5cdFx0cmV0dXJuIGVsLmNsYXNzTGlzdC5jb250YWlucyhjKVxyXG5cdH0sXHJcblx0YWRkQ2xhc3MgOiBmdW5jdGlvbiggZWwgLCBjICl7XHJcblx0XHRlbC5jbGFzc05hbWUgKz0gJyAnK2NcclxuXHR9LFxyXG5cdHJlbW92ZUNsYXNzIDogZnVuY3Rpb24oIGVsICwgYyApe1xyXG5cdFx0dmFyIG5jPVwiXCJcclxuXHRcdGZvcih2YXIgaT1lbC5jbGFzc0xpc3QubGVuZ3RoO2ktLTsgKVxyXG5cdFx0XHRpZiggYyAhPSBlbC5jbGFzc0xpc3RbaV0gKVxyXG5cdFx0XHRcdG5jICs9ICcgJytlbC5jbGFzc0xpc3RbaV1cclxuXHRcdGVsLmNsYXNzTmFtZSA9IG5jXHJcblx0fSxcclxuXHRnZXRQYXJlbnQgOiBmdW5jdGlvbiggZWwgLCBjICl7XHJcblx0XHR3aGlsZSh0cnVlKVxyXG5cdFx0XHRpZiggZWwgJiYgIXRoaXMuaGFzQ2xhc3MoIGVsICwgYyApIClcclxuXHRcdFx0XHRlbCA9IGVsLnBhcmVudEVsZW1lbnRcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0cmV0dXJuIGVsXHJcblx0fSxcclxuICAgIG9mZnNldCA6IGZ1bmN0aW9uKCBlbCApe1xyXG4gICAgICAgIC8vIFRPRE8gY29uc2lkZXIgc2Nyb2xsXHJcbiAgICAgICAgdmFyIG8gPSB7XHJcbiAgICAgICAgICAgIGxlZnQ6MCxcclxuICAgICAgICAgICAgdG9wOjBcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUoIGVsICYmIGVsLm9mZnNldExlZnQgIT09IG51bGwpe1xyXG4gICAgICAgICAgICBvLmxlZnQgKz0gZWwub2Zmc2V0TGVmdFxyXG4gICAgICAgICAgICBvLnRvcCArPSBlbC5vZmZzZXRUb3BcclxuXHJcbiAgICAgICAgICAgIGVsID0gZWwucGFyZW50RWxlbWVudFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb1xyXG4gICAgfSxcclxuXHRiaW5kIDogZnVuY3Rpb24oIGVsICwgZXZlbnROYW1lICwgZm4gKXtcclxuXHJcblx0XHR2YXIgbCA9IGV2ZW50TmFtZS5zcGxpdCgnICcpXHJcblx0XHRpZiggbC5sZW5ndGg+MSApe1xyXG5cdFx0XHRmb3IodmFyIGk9bC5sZW5ndGg7aS0tOylcclxuXHRcdFx0XHR0aGlzLmJpbmQoIGVsICwgbFtpXSAsIGZuIClcclxuXHRcdFx0cmV0dXJuXHJcblx0XHR9XHJcblxyXG5cclxuXHRcdGVsLl9iaW5kSGFuZGxlcnMgPSBlbC5fYmluZEhhbmRsZXJzIHx8IHt9XHJcblxyXG5cdFx0dGhpcy51bmJpbmQoIGVsICwgZXZlbnROYW1lIClcclxuXHJcblx0XHRlbC5hZGRFdmVudExpc3RlbmVyKCBldmVudE5hbWUuc3BsaXQoJy4nKVswXSAsIGZuICwgZmFsc2UgKVxyXG5cdFx0ZWwuX2JpbmRIYW5kbGVyc1sgZXZlbnROYW1lIF0gPSBmblxyXG5cdH0sXHJcblx0dW5iaW5kIDogZnVuY3Rpb24oIGVsICwgZXZlbnROYW1lICl7XHJcblxyXG5cdFx0dmFyIGwgPSBldmVudE5hbWUuc3BsaXQoJyAnKVxyXG5cdFx0aWYoIGwubGVuZ3RoPjEgKXtcclxuXHRcdFx0Zm9yKHZhciBpPWwubGVuZ3RoO2ktLTspXHJcblx0XHRcdFx0dGhpcy51bmJpbmQoIGVsICwgbFtpXSApXHJcblx0XHRcdHJldHVyblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmKCAhZWwuX2JpbmRIYW5kbGVycyB8fCAhZWwuX2JpbmRIYW5kbGVyc1sgZXZlbnROYW1lIF0gKVxyXG5cdFx0XHRyZXR1cm5cclxuXHJcblx0XHRlbC5yZW1vdmVFdmVudExpc3RlbmVyKCBldmVudE5hbWUuc3BsaXQoJy4nKVswXSAsIGVsLl9iaW5kSGFuZGxlcnNbIGV2ZW50TmFtZSBdICwgZmFsc2UgKVxyXG5cdFx0ZWwuX2JpbmRIYW5kbGVyc1sgZXZlbnROYW1lIF0gPSBudWxsXHJcblx0fSxcclxuICAgIGRvbWlmeSA6IChmdW5jdGlvbigpe1xyXG4gICAgICAgIGlmKCB0eXBlb2YgZG9jdW1lbnQgIT0gJ29iamVjdCcgKVxyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXt9XHJcbiAgICAgICAgdmFyIHRhbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiggdHBsICl7XHJcbiAgICAgICAgICAgIHRhbmsuaW5uZXJIVE1MID0gdHBsXHJcbiAgICAgICAgICAgIHZhciBkb21FbCA9IHRhbmsuY2hpbGRyZW5bIDAgXVxyXG4gICAgICAgICAgICB0YW5rLmlubmVySFRNTCA9ICcnXHJcbiAgICAgICAgICAgIHJldHVybiBkb21FbFxyXG4gICAgICAgIH1cclxuICAgIH0pKClcclxufVxyXG4iLCI7KGZ1bmN0aW9uKCl7XHJcblxyXG52YXIgc3RhcnRUaW1lLFxyXG4gICAgc3RhcnRFbGVtZW50LFxyXG4gICAgc3RhcnRQb3MgPSB7fSxcclxuICAgIHBoYXNlID0gMFxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJyxmdW5jdGlvbihldmVudCl7XHJcbiAgICBpZiAoIHBoYXNlID09IDAgfHwgZXZlbnQudGltZVN0YW1wIC0gc3RhcnRUaW1lID4gNDAwICl7XHJcblxyXG4gICAgICAgIHN0YXJ0VGltZSA9IGV2ZW50LnRpbWVTdGFtcFxyXG4gICAgICAgIHN0YXJ0RWxlbWVudCA9IGV2ZW50LnRhcmdldFxyXG4gICAgICAgIHN0YXJ0UG9zLnggPSBldmVudC5wYWdlWFxyXG4gICAgICAgIHN0YXJ0UG9zLnkgPSBldmVudC5wYWdlWVxyXG4gICAgICAgIHBoYXNlPTFcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBoYXNlKytcclxuICAgIH1cclxufSlcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLGZ1bmN0aW9uKGV2ZW50KXtcclxuXHJcbiAgICBpZiggc3RhcnRFbGVtZW50IT1ldmVudC50YXJnZXRcclxuICAgICAgICB8fCBldmVudC50aW1lU3RhbXAgLSBzdGFydFRpbWUgPiA0MDBcclxuICAgICAgICB8fCBNYXRoLmFicyhzdGFydFBvcy54IC0gZXZlbnQucGFnZVgpID4gMjVcclxuICAgICAgICB8fCBNYXRoLmFicyhzdGFydFBvcy55IC0gZXZlbnQucGFnZVkpID4gMjVcclxuICAgIClcclxuICAgICAgICByZXR1cm4gdm9pZCAoIHBoYXNlID0gMCApXHJcblxyXG4gICAgaWYoIHBoYXNlID49IDIgKXtcclxuICAgICAgICB2YXIgY2xpY2tldmVudCA9IG5ldyBNb3VzZUV2ZW50KCdkb3VibGVjbGljaycsZXZlbnQpO1xyXG5cclxuICAgICAgICBldmVudC50YXJnZXQuZGlzcGF0Y2hFdmVudChjbGlja2V2ZW50KTtcclxuXHJcbiAgICAgICAgcGhhc2UgPSAwO1xyXG4gICAgfVxyXG59KVxyXG5cclxufSkoKVxyXG4iLCJ2YXIgdSA9IHt9XHJcblxyXG51LnNjYWxhaXJlID0gZnVuY3Rpb24oIGEsIGIgKXtcclxuICAgIHJldHVybiBhLngqYi54ICsgYS55KmIueVxyXG59XHJcbnUubm9ybWUgPSBmdW5jdGlvbiggYSApe1xyXG4gICAgcmV0dXJuIE1hdGguc3FydCggdS5zY2FsYWlyZSggYSwgYSApIClcclxufVxyXG51Lm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKCBhICl7XHJcbiAgICB2YXIgbiA9IHUubm9ybWUoIGEgKVxyXG4gICAgYS54IC89IG5cclxuICAgIGEueSAvPSBuXHJcbiAgICByZXR1cm4gYVxyXG59XHJcbnUuZGlmZiA9IGZ1bmN0aW9uKCBhLCBiICl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IGEueCAtIGIueCxcclxuICAgICAgICB5OiBhLnkgLSBiLnlcclxuICAgIH1cclxufVxyXG51LmxlcnAgPSBmdW5jdGlvbiggYSwgYiwgYWxwaGEgKXtcclxuICAgIHZhciBhYWxwaGEgPSAxLWFscGhhXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IGEueCphYWxwaGEgKyBiLngqYWxwaGEsXHJcbiAgICAgICAgeTogYS55KmFhbHBoYSArIGIueSphbHBoYVxyXG4gICAgfVxyXG59XHJcbnUuY29weSA9IGZ1bmN0aW9uKCBhICl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IGEueCxcclxuICAgICAgICB5OiBhLnlcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB1XHJcbiJdfQ==
