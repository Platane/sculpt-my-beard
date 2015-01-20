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


  , layoutManager = require('./layout')


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

// layout
layoutManager.render()


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

var timeout = 0
var askRender = function(){
    window.clearTimeout(timeout)
    timeout = window.setTimeout( renderLayout, 200 )
}

window.addEventListener('resize', askRender, false )

module.exports = {
    render: renderLayout
}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwianNcXGFwcC5qcyIsImpzXFxjb250cm9sbGVyXFxjdHJsWi5qcyIsImpzXFxjb250cm9sbGVyXFxkcmFnUG9pbnQuanMiLCJqc1xcY29udHJvbGxlclxcdGltZUxpbmVcXGN1cnNvci5qcyIsImpzXFxjb250cm9sbGVyXFx0aW1lTGluZVxca2V5LmpzIiwianNcXGxheW91dC5qcyIsImpzXFxtb2RlbFxcYXBwLXN0YXRlXFxDYW1lcmEuanMiLCJqc1xcbW9kZWxcXGFwcC1zdGF0ZVxcVGltZUxpbmVTdGF0ZS5qcyIsImpzXFxtb2RlbFxcZGF0YVxcRmFjZS5qcyIsImpzXFxtb2RlbFxcZGF0YVxcTGluZS5qcyIsImpzXFxtb2RlbFxcZGF0YVxcU2hhcGUuanMiLCJqc1xcbW9kZWxcXGRhdGFcXFRpbWVMaW5lLmpzIiwianNcXG1vZGVsXFxoaXN0b3J5LmpzIiwianNcXG1vZGVsXFxtaXhpblxcaGlzdG9yaXphYmxlLmpzIiwianNcXHJlbmRlcmVyXFxiYXNpY0V2ZW50LmpzIiwianNcXHJlbmRlcmVyXFxzdmdcXGZhY2UuanMiLCJqc1xccmVuZGVyZXJcXHN2Z1xccG9pbnRDb250cm9sLmpzIiwianNcXHJlbmRlcmVyXFxzdmdcXHN2Zy11dGlsLmpzIiwianNcXHJlbmRlcmVyXFx0aW1lTGluZVxccnVsZXIuanMiLCJqc1xccmVuZGVyZXJcXHRpbWVMaW5lXFx0aW1lTGluZS5qcyIsImpzXFxzdGF0aWNDb250cm9sbGVyXFxhcHBseVRpbWVMaW5lLmpzIiwianNcXHN0YXRpY0NvbnRyb2xsZXJcXHJlY29tcHV0ZS5qcyIsImpzXFxzeXN0ZW1cXGV2ZW50RGlzcGF0Y2hlci5qcyIsImpzXFxzeXN0ZW1cXGludGVycG9sYXRlLmpzIiwianNcXHN5c3RlbVxccGF0aEpvYi5qcyIsImpzXFx1dGlsc1xcQWJzdHJhY3QuanMiLCJqc1xcdXRpbHNcXGRvbUhlbHBlci5qcyIsImpzXFx1dGlsc1xcZG91YmxlQ2xpY2suanMiLCJqc1xcdXRpbHNcXHBvaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgZmFjZVJlbmRlcmVyID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9yZW5kZXJlci9zdmcvZmFjZScpIClcclxuICAsIHBvaW50Q29udHJvbFJlbmRlcmVyID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9yZW5kZXJlci9zdmcvcG9pbnRDb250cm9sJykgKVxyXG4gICwgYmFzaWNFdmVudCA9IE9iamVjdC5jcmVhdGUoIHJlcXVpcmUoJy4vcmVuZGVyZXIvYmFzaWNFdmVudCcpIClcclxuICAsIHRpbWVMaW5lUmVuZGVyZXIgPSBPYmplY3QuY3JlYXRlKCByZXF1aXJlKCcuL3JlbmRlcmVyL3RpbWVMaW5lL3RpbWVMaW5lJykgKVxyXG5cclxuXHJcbiAgLCBmYWNlID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9tb2RlbC9kYXRhL0ZhY2UnKSApXHJcbiAgLCB0aW1lTGluZSA9IE9iamVjdC5jcmVhdGUoIHJlcXVpcmUoJy4vbW9kZWwvZGF0YS9UaW1lTGluZScpIClcclxuXHJcbiAgLCBjYW1lcmEgPSBPYmplY3QuY3JlYXRlKCByZXF1aXJlKCcuL21vZGVsL2FwcC1zdGF0ZS9DYW1lcmEnKSApXHJcbiAgLCB0aW1lTGluZVN0YXRlID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9tb2RlbC9hcHAtc3RhdGUvVGltZUxpbmVTdGF0ZScpIClcclxuXHJcbiAgLCBoaXN0b3J5ID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9tb2RlbC9oaXN0b3J5JykgKVxyXG5cclxuXHJcbiAgLCBkcmFnUG9pbnRDdHJsID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9jb250cm9sbGVyL2RyYWdQb2ludCcpIClcclxuICAsIHRpbWVMaW5lS2V5UG9pbnRDdHJsID0gT2JqZWN0LmNyZWF0ZSggcmVxdWlyZSgnLi9jb250cm9sbGVyL3RpbWVMaW5lL2tleScpIClcclxuICAsIHRpbWVMaW5lQ3Vyc29yQ3RybCA9IE9iamVjdC5jcmVhdGUoIHJlcXVpcmUoJy4vY29udHJvbGxlci90aW1lTGluZS9jdXJzb3InKSApXHJcbiAgLCBjdHJsWiA9IE9iamVjdC5jcmVhdGUoIHJlcXVpcmUoJy4vY29udHJvbGxlci9jdHJsWicpIClcclxuXHJcbiAgLCBzdGF0aWNBcHBseUN0cmwgPSBPYmplY3QuY3JlYXRlKCByZXF1aXJlKCcuL3N0YXRpY0NvbnRyb2xsZXIvYXBwbHlUaW1lTGluZScpIClcclxuICAsIHN0YXRpY1JlY29tcHV0ZUN0cmwgPSBPYmplY3QuY3JlYXRlKCByZXF1aXJlKCcuL3N0YXRpY0NvbnRyb2xsZXIvcmVjb21wdXRlJykgKVxyXG5cclxuXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcblxyXG5cclxuICAsIGxheW91dE1hbmFnZXIgPSByZXF1aXJlKCcuL2xheW91dCcpXHJcblxyXG5cclxuICByZXF1aXJlKCcuL3V0aWxzL2RvdWJsZUNsaWNrJylcclxuXHJcbi8vIGluaXQgbW9kZWxcclxuZmFjZS5pbml0KClcclxuY2FtZXJhLmluaXQoKVxyXG50aW1lTGluZVN0YXRlLmluaXQoKVxyXG50aW1lTGluZS5pbml0KClcclxuaGlzdG9yeS5pbml0KClcclxuXHJcbi8vIGluaXQgc3lzdGVtXHJcbnZhciBtb2RlbEJhbGwgPSB7XHJcbiAgICBmYWNlOiBmYWNlLFxyXG4gICAgY2FtZXJhOiBjYW1lcmEsXHJcbiAgICB0aW1lTGluZVN0YXRlOiB0aW1lTGluZVN0YXRlLFxyXG4gICAgdGltZUxpbmU6IHRpbWVMaW5lLFxyXG4gICAgaGlzdG9yeTogaGlzdG9yeVxyXG59XHJcbndpbmRvdy5tb2RlbEJhbGwgPSBtb2RlbEJhbGxcclxuXHJcbi8vIGluaXQgcmVuZGVyZXJcclxudmFyIGRvbVN2ZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hcHAtZHJhdy16b25lJylcclxuZmFjZVJlbmRlcmVyLmluaXQoIG1vZGVsQmFsbCwgZG9tU3ZnIClcclxucG9pbnRDb250cm9sUmVuZGVyZXIuaW5pdCggbW9kZWxCYWxsLCBkb21TdmcgKVxyXG5cclxuYmFzaWNFdmVudC5pbml0KCBtb2RlbEJhbGwgKVxyXG5cclxudGltZUxpbmVSZW5kZXJlci5pbml0KCBtb2RlbEJhbGwsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hcHAtdGltZUxpbmUnKSApXHJcblxyXG4vLyBjb250cm9sbGVyXHJcbmRyYWdQb2ludEN0cmwuaW5pdCggbW9kZWxCYWxsICkuZW5hYmxlKClcclxudGltZUxpbmVLZXlQb2ludEN0cmwuaW5pdCggbW9kZWxCYWxsICkuZW5hYmxlKClcclxuY3RybFouaW5pdCggbW9kZWxCYWxsICkuZW5hYmxlKClcclxudGltZUxpbmVDdXJzb3JDdHJsLmluaXQoIG1vZGVsQmFsbCApLmVuYWJsZSgpXHJcblxyXG5cclxuc3RhdGljQXBwbHlDdHJsLmluaXQoIG1vZGVsQmFsbCApLmVuYWJsZSgpXHJcbnN0YXRpY1JlY29tcHV0ZUN0cmwuaW5pdCggbW9kZWxCYWxsICkuZW5hYmxlKClcclxuXHJcbi8vIGxheW91dFxyXG5sYXlvdXRNYW5hZ2VyLnJlbmRlcigpXHJcblxyXG5cclxuLy8gYm9vdHN0cmFwXHJcbmZhY2UuY2h1bmsubXVzdGFjaF9sZWZ0LmxpbmUgPSBbXHJcbiAgICB7eDogNTAsIHk6IDEwMH0sXHJcbiAgICAvL3t4OiAxNTAsIHk6IDEzMH0sXHJcbiAgICAvL3t4OiAyNzAsIHk6IDIwMH1cclxuXVxyXG5mYWNlLmNodW5rLm11c3RhY2hfbGVmdC53aWR0aCA9IFtcclxuICAgIDQwLFxyXG4gICAgLy8yMCxcclxuICAgIC8vMzVcclxuXVxyXG5mYWNlLmNodW5rLm11c3RhY2hfbGVmdC5yZWNvbXB1dGUoKVxyXG5cclxuXHJcblxyXG4vLyBUT0RPIHB1dCB0aGF0IG9uIGEgc3RhdGljIGNvbnRyb2xsZXJcclxuLy8gcmVuZGVyXHJcblxyXG5mdW5jdGlvbiByZW5kZXIoKXtcclxuXHJcbiAgICAvL2VkLmRpc3BhdGNoKCdwcmUtcmVuZGVyJylcclxuICAgIGVkLmRpc3BhdGNoKCdyZW5kZXInKVxyXG4gICAgLy9lZC5kaXNwYXRjaCgncG9zdC1yZW5kZXInKVxyXG5cclxufVxyXG5cclxuLy8gVE9ETyB0aHJvdHRsZSB0aGlzXHJcbmVkLmxpc3RlbiggJ3BsZWFzZS1yZW5kZXInICwgcmVuZGVyLmJpbmQoIHRoaXMgKSAsIHRoaXMgKVxyXG5cclxucmVuZGVyKClcclxuXHJcblxyXG52YXIgcGxfcmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgIGVkLmRpc3BhdGNoKCAncGxlYXNlLXJlbmRlcicgKVxyXG59XHJcbmVkLmxpc3RlbiggJ2NoYW5nZTpzaGFwZScsIHBsX3JlbmRlciApXHJcbmVkLmxpc3RlbiggJ2NoYW5nZTpjYW1lcmE6em9vbScsIHBsX3JlbmRlciApXHJcbmVkLmxpc3RlbiggJ2NoYW5nZTpjYW1lcmE6b3JpZ2luJywgcGxfcmVuZGVyIClcclxuXHJcblxyXG52YXIgcGxfaGlzdG9yaXplID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcbiAgICBpZiggIWV2ZW50LndpcCAmJiAhZXZlbnQubm9faGlzdG9yeSApXHJcbiAgICAgICAgaGlzdG9yeS5zYXZlKCB0aW1lTGluZSApXHJcbn1cclxuaGlzdG9yeS5zYXZlKCB0aW1lTGluZSApXHJcbmVkLmxpc3RlbiggJ2NoYW5nZTpzaGFwZScsIHBsX2hpc3Rvcml6ZSApXHJcbmVkLmxpc3RlbiggJ2NoYW5nZTp0aW1lTGluZScsIHBsX2hpc3Rvcml6ZSApXHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uL3V0aWxzL0Fic3RyYWN0JylcclxuICAsIGVkID0gcmVxdWlyZSgnLi4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcblxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCBtb2RlbEJhbGwgKXtcclxuXHJcbiAgICB0aGlzLm1vZGVsID0ge1xyXG4gICAgICAgIGhpc3Rvcnk6IG1vZGVsQmFsbC5oaXN0b3J5XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5rZXlEb3duID0ga2V5RG93bi5iaW5kKCB0aGlzIClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG52YXIga2V5RG93biA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG4gICAgaWYgKCAhZXZlbnQubW91c2VFdmVudC5jdHJsS2V5IClcclxuICAgICAgICByZXR1cm5cclxuXHJcbiAgICBzd2l0Y2goIGV2ZW50Lm1vdXNlRXZlbnQud2hpY2ggKXtcclxuICAgICAgICBjYXNlIDkwIDogIC8vIHpcclxuICAgICAgICAgICAgaWYgKCB0aGlzLm1vZGVsLmhpc3RvcnkudW5kbygpICE9PSBmYWxzZSApXHJcbiAgICAgICAgICAgICAgICBlZC5kaXNwYXRjaCggJ2hpc3Rvcnk6dW5kbycpXHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGVkLmRpc3BhdGNoKCAnaGlzdG9yeTpub3RoaW5nLXRvLXVuZG8nKVxyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSA4OSA6ICAvLyB6XHJcbiAgICAgICAgICAgIGlmICggdGhpcy5tb2RlbC5oaXN0b3J5LnJlZG8oKSAhPT0gZmFsc2UgKVxyXG4gICAgICAgICAgICAgICAgZWQuZGlzcGF0Y2goICdoaXN0b3J5OnJlZG8nKVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBlZC5kaXNwYXRjaCggJ2hpc3Rvcnk6bm90aGluZy10by1yZWRvJylcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbn1cclxuXHJcbnZhciBlbmFibGUgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5kaXNhYmxlKClcclxuICAgIGVkLmxpc3RlbiggJ3VpLWtleWRvd24nLCB0aGlzLmtleURvd24sIHRoaXMgKVxyXG59XHJcbnZhciBkaXNhYmxlID0gZnVuY3Rpb24oKXtcclxuICAgIGVkLnVubGlzdGVuKCAndWkta2V5ZG93bicsIHRoaXMgKVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0ICkuZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXQsXHJcbiAgICBlbmFibGU6IGVuYWJsZSxcclxuICAgIGRpc2FibGU6IGRpc2FibGUsXHJcbn0pXHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uL3V0aWxzL0Fic3RyYWN0JylcclxuLCBlZCA9IHJlcXVpcmUoJy4uL3N5c3RlbS9ldmVudERpc3BhdGNoZXInKVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggbW9kZWxCYWxsICl7XHJcblxyXG4gICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICBmYWNlOiBtb2RlbEJhbGwuZmFjZVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGljRG93biA9IHRpY0Rvd24uYmluZCggdGhpcyApXHJcbiAgICB0aGlzLnRpY01vdmUgPSB0aWNNb3ZlLmJpbmQoIHRoaXMgKVxyXG4gICAgdGhpcy50aWNVcCA9IHRpY1VwLmJpbmQoIHRoaXMgKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbnZhciBlbmFibGUgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5kaXNhYmxlKClcclxuICAgIGVkLmxpc3RlbiggJ3VpLXRpYy1tb3VzZWRvd24nLCB0aGlzLnRpY0Rvd24sIHRoaXMgKVxyXG59XHJcbnZhciBkaXNhYmxlID0gZnVuY3Rpb24oKXtcclxuICAgIGVkLnVubGlzdGVuKCAndWktdGljLW1vdXNlZG93bicsIHRoaXMgKVxyXG4gICAgZWQudW5saXN0ZW4oICd1aS1tb3VzZW1vdmUnLCB0aGlzIClcclxuICAgIGVkLnVubGlzdGVuKCAndWktbW91c2V1cCcsIHRoaXMgKVxyXG59XHJcblxyXG52YXIgdGljRG93biA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG4gICAgdGhpcy5fc2hhcGUgPSB0aGlzLm1vZGVsLmZhY2UuY2h1bmtbIGV2ZW50LmNodW5rIF1cclxuICAgIHRoaXMuX3BvaW50ID0gdGhpcy5fc2hhcGVbIGV2ZW50LnBvb2wgXVsgZXZlbnQuaSBdXHJcbiAgICB0aGlzLl9vcmlnaW4gPSB7XHJcbiAgICAgICAgeDogdGhpcy5fcG9pbnQueCxcclxuICAgICAgICB5OiB0aGlzLl9wb2ludC55XHJcbiAgICB9XHJcbiAgICB0aGlzLl9hbmNob3IgPSB7XHJcbiAgICAgICAgeDogZXZlbnQubW91c2VFdmVudC5wYWdlWCxcclxuICAgICAgICB5OiBldmVudC5tb3VzZUV2ZW50LnBhZ2VZXHJcbiAgICB9XHJcblxyXG4gICAgZWQubGlzdGVuKCAndWktbW91c2Vtb3ZlJywgdGhpcy50aWNNb3ZlLCB0aGlzIClcclxuICAgIGVkLmxpc3RlbiggJ3VpLW1vdXNldXAnLCB0aGlzLnRpY1VwLCB0aGlzIClcclxufVxyXG5cclxudmFyIHRpY01vdmUgPSBmdW5jdGlvbiggZXZlbnQgKXtcclxuICAgIHRoaXMuX3BvaW50LnggPSB0aGlzLl9vcmlnaW4ueCArIGV2ZW50Lm1vdXNlRXZlbnQucGFnZVggLSB0aGlzLl9hbmNob3IueFxyXG4gICAgdGhpcy5fcG9pbnQueSA9IHRoaXMuX29yaWdpbi55ICsgZXZlbnQubW91c2VFdmVudC5wYWdlWSAtIHRoaXMuX2FuY2hvci55XHJcblxyXG4gICAgZWQuZGlzcGF0Y2goICdjaGFuZ2U6cG9pbnQnLCB7XHJcbiAgICAgICAgcG9pbnQ6IHRoaXMuX3BvaW50LFxyXG4gICAgICAgIHNoYXBlOiB0aGlzLl9zaGFwZSxcclxuICAgICAgICB3aXA6IHRydWVcclxuICAgIH0pXHJcbn1cclxuXHJcbnZhciB0aWNVcCA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG5cclxuICAgIGVkLmRpc3BhdGNoKCAnY2hhbmdlOnBvaW50Jywge1xyXG4gICAgICAgIHBvaW50OiB0aGlzLl9wb2ludCxcclxuICAgICAgICBzaGFwZTogdGhpcy5fc2hhcGUsXHJcbiAgICAgICAgd2lwOiBmYWxzZVxyXG4gICAgfSlcclxuXHJcbiAgICBlZC51bmxpc3RlbiggJ3VpLW1vdXNlbW92ZScsIHRoaXMgKVxyXG4gICAgZWQudW5saXN0ZW4oICd1aS1tb3VzZXVwJywgdGhpcyApXHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0ICkuZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXQsXHJcbiAgICBlbmFibGU6IGVuYWJsZSxcclxuICAgIGRpc2FibGU6IGRpc2FibGUsXHJcbn0pXHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0Fic3RyYWN0JylcclxuICAsIGVkID0gcmVxdWlyZSgnLi4vLi4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcblxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCBtb2RlbEJhbGwgKXtcclxuXHJcbiAgICB0aGlzLm1vZGVsID0ge1xyXG4gICAgICAgIHRpbWVMaW5lU3RhdGU6IG1vZGVsQmFsbC50aW1lTGluZVN0YXRlLFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuQ3VyRG93biA9IEN1ckRvd24uYmluZCggdGhpcyApXHJcbiAgICB0aGlzLkN1ck1vdmUgPSBDdXJNb3ZlLmJpbmQoIHRoaXMgKVxyXG4gICAgdGhpcy5DdXJVcCA9IEN1clVwLmJpbmQoIHRoaXMgKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbnZhciBlbmFibGUgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5kaXNhYmxlKClcclxuICAgIGVkLmxpc3RlbiggJ3VpLXRsQ3Vyc29yLW1vdXNlZG93bicsIHRoaXMuQ3VyRG93biwgdGhpcyApXHJcbn1cclxudmFyIGRpc2FibGUgPSBmdW5jdGlvbigpe1xyXG4gICAgZWQudW5saXN0ZW4oICd1aS10bEN1cnNvci1tb3VzZWRvd24nLCB0aGlzIClcclxufVxyXG5cclxudmFyIEN1ckRvd24gPSBmdW5jdGlvbiggZXZlbnQgKXtcclxuICAgIHRoaXMuX29yaWdpbiA9IHRoaXMubW9kZWwudGltZUxpbmVTdGF0ZS5wcm9qZWN0KCBldmVudC5kYXRlIClcclxuICAgIHRoaXMuX2FuY2hvciA9IGV2ZW50Lm1vdXNlRXZlbnQucGFnZVhcclxuXHJcbiAgICBlZC51bmxpc3RlbiggJ3VpLW1vdXNlbW92ZScsIHRoaXMgKVxyXG4gICAgZWQudW5saXN0ZW4oICd1aS1tb3VzZXVwJywgdGhpcyApXHJcbiAgICBlZC5saXN0ZW4oICd1aS1tb3VzZW1vdmUnLCB0aGlzLkN1ck1vdmUsIHRoaXMgKVxyXG4gICAgZWQubGlzdGVuKCAndWktbW91c2V1cCcsIHRoaXMuQ3VyVXAsIHRoaXMgKVxyXG59XHJcbnZhciBDdXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcbiAgICB2YXIgdGxzID0gdGhpcy5tb2RlbC50aW1lTGluZVN0YXRlXHJcbiAgICB2YXIgbmV3RGF0ZSA9IHRscy51bnByb2plY3QoIHRoaXMuX29yaWdpbiArIGV2ZW50Lm1vdXNlRXZlbnQucGFnZVggLSB0aGlzLl9hbmNob3IgKVxyXG5cclxuICAgIHRscy5jdXJzb3IgPSBuZXdEYXRlXHJcblxyXG4gICAgZWQuZGlzcGF0Y2goICdjaGFuZ2U6dGltZUxpbmVTdGF0ZScsIHtcclxuICAgICAgICB3aXA6IHRydWVcclxuICAgIH0pXHJcbn1cclxudmFyIEN1clVwID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcblxyXG4gICAgdmFyIHRscyA9IHRoaXMubW9kZWwudGltZUxpbmVTdGF0ZVxyXG5cclxuICAgIHRscy5jdXJzb3IgPSB0bHMucXVhbnRpZnkoIHRscy5jdXJzb3IgKVxyXG5cclxuICAgIGVkLnVubGlzdGVuKCAndWktbW91c2Vtb3ZlJywgdGhpcyApXHJcbiAgICBlZC51bmxpc3RlbiggJ3VpLW1vdXNldXAnLCB0aGlzIClcclxuXHJcbiAgICBlZC5kaXNwYXRjaCggJ2NoYW5nZTp0aW1lTGluZVN0YXRlJywge1xyXG4gICAgICAgIHdpcDogZmFsc2VcclxuICAgIH0pXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggQWJzdHJhY3QgKS5leHRlbmQoe1xyXG4gICAgaW5pdDogaW5pdCxcclxuICAgIGVuYWJsZTogZW5hYmxlLFxyXG4gICAgZGlzYWJsZTogZGlzYWJsZSxcclxufSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgZWQgPSByZXF1aXJlKCcuLi8uLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oIG1vZGVsQmFsbCApe1xyXG5cclxuICAgIHRoaXMubW9kZWwgPSB7XHJcbiAgICAgICAgZmFjZTogbW9kZWxCYWxsLmZhY2UsXHJcbiAgICAgICAgdGltZUxpbmU6IG1vZGVsQmFsbC50aW1lTGluZSxcclxuICAgICAgICB0aW1lTGluZVN0YXRlOiBtb2RlbEJhbGwudGltZUxpbmVTdGF0ZSxcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxpbmVDbGljayA9IGxpbmVDbGljay5iaW5kKCB0aGlzIClcclxuICAgIHRoaXMua2V5RG93biA9IGtleURvd24uYmluZCggdGhpcyApXHJcbiAgICB0aGlzLmtleU1vdmUgPSBrZXlNb3ZlLmJpbmQoIHRoaXMgKVxyXG4gICAgdGhpcy5rZXlVcCA9IGtleVVwLmJpbmQoIHRoaXMgKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbnZhciBlbmFibGUgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5kaXNhYmxlKClcclxuICAgIGVkLmxpc3RlbiggJ3VpLXRsTGluZS1kb3VibGVjbGljaycsIHRoaXMubGluZUNsaWNrLCB0aGlzIClcclxuICAgIGVkLmxpc3RlbiggJ3VpLXRsS2V5LW1vdXNlZG93bicsIHRoaXMua2V5RG93biwgdGhpcyApXHJcbn1cclxudmFyIGRpc2FibGUgPSBmdW5jdGlvbigpe1xyXG4gICAgZWQudW5saXN0ZW4oICd1aS10bExpbmUtZG91YmxlY2xpY2snLCB0aGlzIClcclxuICAgIGVkLnVubGlzdGVuKCAndWktdGxLZXktZG91YmxlY2xpY2snLCB0aGlzIClcclxufVxyXG5cclxudmFyIGxpbmVDbGljayA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG4gICAgdmFyIHNoYXBlID0gdGhpcy5tb2RlbC5mYWNlLmNodW5rWyBldmVudC5jaHVuayBdXHJcbiAgICB2YXIgZGF0ZSA9IGV2ZW50LmRhdGVcclxuICAgIHZhciB0bHMgPSB0aGlzLm1vZGVsLnRpbWVMaW5lU3RhdGVcclxuXHJcbiAgICB0aGlzLm1vZGVsLnRpbWVMaW5lLmFkZE9yU2V0S2V5KCBldmVudC5jaHVuaywgdGxzLnF1YW50aWZ5KGRhdGUpLCBzaGFwZS5wYWNrKCkgKTtcclxuXHJcbiAgICBlZC5kaXNwYXRjaCggJ2NoYW5nZTp0aW1lTGluZScsIHtcclxuICAgICAgICB3aXA6IGZhbHNlXHJcbiAgICB9KVxyXG59XHJcbnZhciBrZXlEb3duID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcbiAgICB0aGlzLl9jaHVuayA9IGV2ZW50LmNodW5rXHJcbiAgICB0aGlzLl9vcmlnaW4gPSB0aGlzLm1vZGVsLnRpbWVMaW5lU3RhdGUucHJvamVjdCggZXZlbnQuZGF0ZSApXHJcbiAgICB0aGlzLmggPSBldmVudC5tb3VzZUV2ZW50LnBhZ2VZXHJcbiAgICB0aGlzLl9hbmNob3IgPSBldmVudC5tb3VzZUV2ZW50LnBhZ2VYXHJcbiAgICB0aGlzLl9rZXkgPSB0aGlzLm1vZGVsLnRpbWVMaW5lLmtleXNbIGV2ZW50LmNodW5rIF1bIGV2ZW50LmkgXVxyXG4gICAgdGhpcy5fcmVtb3ZlZCA9IGZhbHNlXHJcblxyXG5cclxuICAgIGVkLnVubGlzdGVuKCAndWktbW91c2Vtb3ZlJywgdGhpcyApXHJcbiAgICBlZC51bmxpc3RlbiggJ3VpLW1vdXNldXAnLCB0aGlzIClcclxuICAgIGVkLmxpc3RlbiggJ3VpLW1vdXNlbW92ZScsIHRoaXMua2V5TW92ZSwgdGhpcyApXHJcbiAgICBlZC5saXN0ZW4oICd1aS1tb3VzZXVwJywgdGhpcy5rZXlVcCwgdGhpcyApXHJcbn1cclxudmFyIGtleU1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKXtcclxuXHJcbiAgICB2YXIgdGxzID0gdGhpcy5tb2RlbC50aW1lTGluZVN0YXRlXHJcblxyXG4gICAgaWYoIE1hdGguYWJzKCB0aGlzLmggLSBldmVudC5tb3VzZUV2ZW50LnBhZ2VZICkgPiA1MCApe1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuX3JlbW92ZWQgKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnRpbWVMaW5lLnJlbW92ZUtleSggdGhpcy5fY2h1bmssIHRoaXMuX2tleSApXHJcblxyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVkID0gdHJ1ZVxyXG5cclxuICAgICAgICAgICAgZWQuZGlzcGF0Y2goICdjaGFuZ2U6dGltZUxpbmUnLCB7XHJcbiAgICAgICAgICAgICAgICB3aXA6IHRydWVcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgdmFyIG5ld0RhdGUgPSB0bHMudW5wcm9qZWN0KCB0aGlzLl9vcmlnaW4gKyBldmVudC5tb3VzZUV2ZW50LnBhZ2VYIC0gdGhpcy5fYW5jaG9yIClcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLl9yZW1vdmVkICkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tb2RlbC50aW1lTGluZS5zZXRLZXlEYXRlKCB0aGlzLl9jaHVuaywgdGhpcy5fa2V5LCBuZXdEYXRlIClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXkgPSB0aGlzLm1vZGVsLnRpbWVMaW5lLmFkZE9yU2V0S2V5KCB0aGlzLl9jaHVuaywgbmV3RGF0ZSwgdGhpcy5fa2V5LnBhY2sgKVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlZCA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlZC5kaXNwYXRjaCggJ2NoYW5nZTp0aW1lTGluZScsIHtcclxuICAgICAgICAgICAgd2lwOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufVxyXG52YXIga2V5VXAgPSBmdW5jdGlvbiggZXZlbnQgKXtcclxuXHJcbiAgICBlZC51bmxpc3RlbiggJ3VpLW1vdXNlbW92ZScsIHRoaXMgKVxyXG4gICAgZWQudW5saXN0ZW4oICd1aS1tb3VzZXVwJywgdGhpcyApXHJcblxyXG4gICAgdmFyIHRscyA9IHRoaXMubW9kZWwudGltZUxpbmVTdGF0ZVxyXG5cclxuICAgIHRoaXMubW9kZWwudGltZUxpbmUuc2V0S2V5RGF0ZSggdGhpcy5fY2h1bmssIHRoaXMuX2tleSwgdGxzLnF1YW50aWZ5KCB0aGlzLl9rZXkuZGF0ZSApIClcclxuXHJcbiAgICBlZC5kaXNwYXRjaCggJ2NoYW5nZTp0aW1lTGluZScsIHtcclxuICAgICAgICB3aXA6IGZhbHNlXHJcbiAgICB9KVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0ICkuZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXQsXHJcbiAgICBlbmFibGU6IGVuYWJsZSxcclxuICAgIGRpc2FibGU6IGRpc2FibGUsXHJcbn0pXHJcbiIsInZhciBzY3JvbGxUbz1mdW5jdGlvbihlbCxzY3JvbGx4LHNjcm9sbHkpe1xyXG4gICAgaWYoZWwuc2Nyb2xsVG8pe1xyXG4gICAgICAgIGVsLnNjcm9sbFRvKHNjcm9sbHgsc2Nyb2xseSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYoZWwuc2Nyb2xsTGVmdCAhPT0gbnVsbCAmJiBlbC5zY3JvbGxUb3AgIT09IG51bGwpe1xyXG4gICAgICAgIGVsLnNjcm9sbExlZnQ9c2Nyb2xseDtcclxuICAgICAgICBlbC5zY3JvbGxUb3A9c2Nyb2xseTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZihlbC5zY3JvbGxYICE9PSBudWxsICYmIGVsLnNjcm9sbFkgIT09IG51bGwpe1xyXG4gICAgICAgIGVsLnNjcm9sbFg9c2Nyb2xseDtcclxuICAgICAgICBlbC5zY3JvbGxZPXNjcm9sbHk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhyb3cgJ3VuYWJsZSB0byBzY3JvbGwnO1xyXG59O1xyXG5cclxudmFyIGdldFNyb2xsPWZ1bmN0aW9uKGVsKXtcclxuICAgIGlmKGVsLnNjcm9sbExlZnQgIT09IG51bGwgJiYgZWwuc2Nyb2xsVG9wICE9PSBudWxsKVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHg6ZWwuc2Nyb2xsTGVmdCxcclxuICAgICAgICAgICAgeTplbC5zY3JvbGxUb3BcclxuICAgICAgICB9O1xyXG4gICAgaWYoZWwuc2Nyb2xsWCAhPT0gbnVsbCAmJiBlbC5zY3JvbGxZICE9PSBudWxsKVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHg6ZWwuc2Nyb2xsWCxcclxuICAgICAgICAgICAgeTplbC5zY3JvbGxZXHJcbiAgICAgICAgfTtcclxuICAgIGlmIChlbC5wYWdlWE9mZnNldCAhPT0gbnVsbCAmJiBlbC5wYWdlWU9mZnNldCAhPT0gbnVsbClcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OmVsLnBhZ2VYT2Zmc2V0LFxyXG4gICAgICAgICAgICB5OmVsLnBhZ2VZT2Zmc2V0XHJcbiAgICAgICAgfTtcclxuICAgIHRocm93ICd1bmFibGUgdG8gc2Nyb2xsJztcclxufTtcclxuXHJcblxyXG5cclxudmFyICRtYWluID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFwcC1kcmF3LXpvbmUnKVxyXG52YXIgJHRsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFwcC10aW1lTGluZScpXHJcbnZhciAkY29udCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYWdlLWFwcCcpXHJcbnZhciAkYm9keSA9IGRvY3VtZW50LmJvZHlcclxuXHJcbnZhciBsYXlvdXRzX3N0cmF0ZWdpZXMgPSB7fVxyXG5cclxubGF5b3V0c19zdHJhdGVnaWVzWzBdID0gZnVuY3Rpb24oIHcsIGggKXtcclxuXHJcbiAgICB2YXIgbWF4X21hcmdpbiA9IDMwXHJcbiAgICB2YXIgdGxfbWluX2ggPSAyMDBcclxuXHJcbiAgICBoID0gTWF0aC5tYXgoaCwgNTUwKVxyXG5cclxuICAgIC8vIHZlcnRpY2FsXHJcblxyXG4gICAgdmFyIHRsaCA9IHRsX21pbl9oXHJcblxyXG4gICAgdmFyIG1oID0gaCAtIHRsaCAtIG1heF9tYXJnaW5cclxuXHJcbiAgICBpZiAoIG1oID4gNDAwIClcclxuICAgICAgICBtaCAqPSAwLjk1XHJcblxyXG4gICAgaWYgKCBtaCA+IDYwMCApXHJcbiAgICAgICAgbWggPSA2MDBcclxuXHJcbiAgICB2YXIgbSA9ICggaCAtIG1oIC0gdGxoICkgLzRcclxuXHJcbiAgICAkbWFpbi5zdHlsZS50b3AgPSBtKydweCdcclxuICAgICRtYWluLnN0eWxlLmhlaWdodCA9IG1oKydweCdcclxuXHJcbiAgICAkdGwuc3R5bGUudG9wID0gKG0qMyttaCkrJ3B4J1xyXG4gICAgJHRsLnN0eWxlLmhlaWdodCA9IHRsaCsncHgnXHJcblxyXG4gICAgJGNvbnQuc3R5bGUuaGVpZ2h0ID0gaCsncHgnXHJcblxyXG4gICAgLy8gaG9yaXpvbnRhbFxyXG5cclxuICAgIHZhciBtdyA9IHcqMC44XHJcbiAgICBpZiAoIG13PDUwMCApXHJcbiAgICAgICAgbXcgPSB3KjAuOTVcclxuICAgIGlmICggbXc+MTAwMCApXHJcbiAgICAgICAgbXcgPSAxMDAwXHJcblxyXG4gICAgJG1haW4uc3R5bGUubGVmdCA9ICR0bC5zdHlsZS5sZWZ0ID0gKCh3LW13KS8yKSsncHgnXHJcbiAgICAkbWFpbi5zdHlsZS53aWR0aCA9ICR0bC5zdHlsZS53aWR0aCA9IG13KydweCdcclxuXHJcblxyXG5cclxuICAgIC8vIGNzcyBjbGFzcyBmb3IgcG9zaXRpb25uaW5nXHJcblxyXG4gICAgJGJvZHkuY2xhc3NOYW1lID0gJ2pzLWRlZmVycmVkLWxheW91dCdcclxufVxyXG5cclxudmFyIHJlbmRlckxheW91dCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAvLyAvIVxcIGhhcmQgcmVmbG93XHJcbiAgICBsYXlvdXRzX3N0cmF0ZWdpZXNbMF0oIGRvY3VtZW50LmJvZHkub2Zmc2V0V2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xyXG59XHJcblxyXG52YXIgdGltZW91dCA9IDBcclxudmFyIGFza1JlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXQpXHJcbiAgICB0aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoIHJlbmRlckxheW91dCwgMjAwIClcclxufVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGFza1JlbmRlciwgZmFsc2UgKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICByZW5kZXI6IHJlbmRlckxheW91dFxyXG59XHJcbiIsInZhciBBYnN0cmFjdCA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0Fic3RyYWN0JylcclxuICAsIGVkID0gcmVxdWlyZSgnLi4vLi4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcbiAgLCB1ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcG9pbnQnKVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggdHlwZSApe1xyXG5cclxuICAgIHRoaXMub3JpZ2luID0ge3g6IDAsIHk6IDB9XHJcbiAgICB0aGlzLnpvb20gPSAxXHJcblxyXG4gICAgdGhpcy5wcm9qZWN0ID0gcHJvamVjdC5iaW5kKCB0aGlzIClcclxuICAgIHRoaXMudW5wcm9qZWN0ID0gdW5wcm9qZWN0LmJpbmQoIHRoaXMgKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbnZhciBwcm9qZWN0ID0gZnVuY3Rpb24oIHAgKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogKCBwLnggLSB0aGlzLm9yaWdpbi54ICkgKiB0aGlzLnpvb20sXHJcbiAgICAgICAgeTogKCBwLnkgLSB0aGlzLm9yaWdpbi55ICkgKiB0aGlzLnpvb21cclxuICAgIH1cclxufVxyXG52YXIgdW5wcm9qZWN0ID0gZnVuY3Rpb24oIHAgKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogKCBwLnggLyB0aGlzLnpvb20gKSArIHRoaXMub3JpZ2luLngsXHJcbiAgICAgICAgeTogKCBwLnkgLyB0aGlzLnpvb20gKSArIHRoaXMub3JpZ2luLnlcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApXHJcbi5leHRlbmQoe1xyXG4gICAgaW5pdDogaW5pdCxcclxufSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgZWQgPSByZXF1aXJlKCcuLi8uLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oIHR5cGUgKXtcclxuXHJcbiAgICB0aGlzLm9yaWdpbiA9IDBcclxuICAgIHRoaXMuem9vbSA9IDMwXHJcblxyXG4gICAgdGhpcy5jdXJzb3IgPSAwXHJcblxyXG4gICAgdGhpcy5wcm9qZWN0ID0gcHJvamVjdC5iaW5kKCB0aGlzIClcclxuICAgIHRoaXMucHJvamVjdFEgPSBwcm9qZWN0US5iaW5kKCB0aGlzIClcclxuICAgIHRoaXMudW5wcm9qZWN0ID0gdW5wcm9qZWN0LmJpbmQoIHRoaXMgKVxyXG4gICAgdGhpcy5xdWFudGlmeSA9IHF1YW50aWZ5LmJpbmQoIHRoaXMgKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbnZhciBwcm9qZWN0ID0gZnVuY3Rpb24oIHggKXtcclxuICAgIHJldHVybiAoIHggLSB0aGlzLm9yaWdpbiApICogdGhpcy56b29tXHJcbn1cclxudmFyIHByb2plY3RRID0gZnVuY3Rpb24oIHggKXtcclxuICAgIHJldHVybiB0aGlzLnF1YW50aWZ5KCB0aGlzLnByb2plY3QoIHggKSApXHJcbn1cclxudmFyIHVucHJvamVjdCA9IGZ1bmN0aW9uKCB4ICl7XHJcbiAgICByZXR1cm4gIHggLyB0aGlzLnpvb20gICsgdGhpcy5vcmlnaW5cclxufVxyXG52YXIgcXVhbnRpZnkgPSBmdW5jdGlvbiggeCApe1xyXG4gICAgcmV0dXJuIE1hdGgucm91bmQoIHggKVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0IClcclxuLmV4dGVuZCh7XHJcbiAgICBpbml0OiBpbml0LFxyXG59KVxyXG4iLCJ2YXIgQWJzdHJhY3QgPSByZXF1aXJlKCcuLi8uLi91dGlscy9BYnN0cmFjdCcpXHJcblxyXG4gICwgaGlzdG9yaXphYmxlID0gcmVxdWlyZSgnLi4vbWl4aW4vaGlzdG9yaXphYmxlJylcclxuICAsIFNoYXBlID0gcmVxdWlyZSgnLi9TaGFwZScpXHJcbiAgLCBMaW5lID0gcmVxdWlyZSgnLi9MaW5lJylcclxuXHJcbnZhciBpbml0ID0gZnVuY3Rpb24oICl7XHJcblxyXG4gICAgdGhpcy5jaHVuayA9IHtcclxuICAgICAgICBtdXN0YWNoX2xlZnQ6IE9iamVjdC5jcmVhdGUoIExpbmUgKS5pbml0KCksXHJcbiAgICAgICAgbXVzdGFjaF9yaWdodDogT2JqZWN0LmNyZWF0ZSggTGluZSApLmluaXQoKSxcclxuXHJcbiAgICAgICAgYmVhcmRfbGVmdDogT2JqZWN0LmNyZWF0ZSggU2hhcGUgKS5pbml0KCksXHJcbiAgICAgICAgYmVhcmRfcmlnaHQ6IE9iamVjdC5jcmVhdGUoIFNoYXBlICkuaW5pdCgpLFxyXG4gICAgICAgIGJlYXJkX21pZDogT2JqZWN0LmNyZWF0ZSggU2hhcGUgKS5pbml0KCksXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxudmFyIHBhY2sgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG8gPSB7fVxyXG4gICAgZm9yKCB2YXIgaSBpbiB0aGlzLmNodW5rIClcclxuICAgICAgICBvWyBpIF0gPSB0aGlzLmNodW5ja1sgaSBdLnBhY2soKVxyXG4gICAgcmV0dXJuIG9cclxufVxyXG5cclxudmFyIHVucGFjayA9IGZ1bmN0aW9uKCBvICl7XHJcbiAgICBmb3IoIHZhciBpIGluIHRoaXMuY2h1bmsgKVxyXG4gICAgICAgIHRoaXMuY2h1bmNrWyBpIF0udW5wYWNrKCBvWyBpIF0gKVxyXG4gICAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApXHJcbi5leHRlbmQoIGhpc3Rvcml6YWJsZSApXHJcbi5leHRlbmQoe1xyXG4gICAgaW5pdDogaW5pdCxcclxuICAgIHBhY2s6IHBhY2ssXHJcbiAgICB1bnBhY2s6IHVucGFjayxcclxufSlcclxuIiwidmFyIFNoYXBlID0gcmVxdWlyZSgnLi9TaGFwZScpXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4uLy4uL3N5c3RlbS9ldmVudERpc3BhdGNoZXInKVxyXG4gICwgcGogPSByZXF1aXJlKCcuLi8uLi9zeXN0ZW0vcGF0aEpvYicpXHJcbiAgLCB1ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcG9pbnQnKVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbigpe1xyXG5cclxuICAgIFNoYXBlLmluaXQuY2FsbCggdGhpcyApXHJcblxyXG4gICAgdGhpcy5saW5lID0gW11cclxuICAgIHRoaXMud2lkdGggPSBbXVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbnZhciByZWNvbXB1dGUgPSBmdW5jdGlvbigpe1xyXG5cclxuICAgIHRoaXMudmVydGV4ID0gcGouZXhwYW5kTXVzdGFjaCggdGhpcy5saW5lLCB0aGlzLndpZHRoIClcclxuXHJcbiAgICByZXR1cm4gU2hhcGUucmVjb21wdXRlLmNhbGwoIHRoaXMgKVxyXG59XHJcblxyXG52YXIgcGFjayA9IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGxpbmU6IHRoaXMubGluZS5zbGljZSgpLm1hcCggdS5jb3B5ICksXHJcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGguc2xpY2UoKSxcclxuICAgICAgICAvLyBUT0RPIGRlZXAgY29weSB0aGlzXHJcbiAgICAgICAgc2hhcnBuZXNzOiB0aGlzLnNoYXJwbmVzcy5zbGljZSgpXHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggU2hhcGUgKS5leHRlbmQoe1xyXG4gICAgaW5pdDogaW5pdCxcclxuICAgIHJlY29tcHV0ZTogcmVjb21wdXRlLFxyXG4gICAgcGFjazogcGFjayxcclxufSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgaGlzdG9yaXphYmxlID0gcmVxdWlyZSgnLi4vbWl4aW4vaGlzdG9yaXphYmxlJylcclxuXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4uLy4uL3N5c3RlbS9ldmVudERpc3BhdGNoZXInKVxyXG4gICwgcGogPSByZXF1aXJlKCcuLi8uLi9zeXN0ZW0vcGF0aEpvYicpXHJcbiAgLCB1ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvcG9pbnQnKVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggKXtcclxuXHJcbiAgICAvLyBleHBvc2UgdGhpc1xyXG4gICAgdGhpcy52ZXJ0ZXggPSBbXTtcclxuICAgIHRoaXMuc2hhcnBuZXNzID0gW107XHJcblxyXG4gICAgdGhpcy5iZXppZXJQYXRoID0gW107XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxudmFyIHJlY29tcHV0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLmJlemllclBhdGggPSBwai5iZXppZnkoIHRoaXMudmVydGV4LCAwLjE1IClcclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbnZhciBwYWNrID0gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdmVydGV4OiB0aGlzLnZlcnRleC5zbGljZSgpLm1hcCggdS5jb3B5ICksXHJcbiAgICAgICAgLy8gVE9ETyBkZWVwIGNvcHkgdGhpc1xyXG4gICAgICAgIHNoYXJwbmVzczogdGhpcy5zaGFycG5lc3Muc2xpY2UoKVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0IClcclxuLmV4dGVuZCggaGlzdG9yaXphYmxlIClcclxuLmV4dGVuZCh7XHJcbiAgICBpbml0OiBpbml0LFxyXG4gICAgcmVjb21wdXRlOiByZWNvbXB1dGUsXHJcbiAgICBwYWNrOiBwYWNrLFxyXG59KVxyXG4iLCJ2YXIgQWJzdHJhY3QgPSByZXF1aXJlKCcuLi8uLi91dGlscy9BYnN0cmFjdCcpXHJcbiAgLCBoaXN0b3JpemFibGUgPSByZXF1aXJlKCcuLi9taXhpbi9oaXN0b3JpemFibGUnKVxyXG4gICwgZWQgPSByZXF1aXJlKCcuLi8uLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuXHJcblxyXG4vKlxyXG4gKiBrZXlzIGlzIGEgc2V0IGxhYmVsZCBieSBjaHVuayBlYWNoIGl0ZW0gaXMgYSBhcnJheSBjb250YWluaW5nIHsgZGF0ZSwgcGFjayB9XHJcbiAqXHJcbiAqL1xyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCB0eXBlICl7XHJcblxyXG4gICAgdGhpcy5rZXlzID0ge31cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG52YXIgc29ydEZuID0gZnVuY3Rpb24oYSwgYil7cmV0dXJuIGEuZGF0ZTxiLmRhdGUgPyAtMSA6IDF9XHJcblxyXG52YXIgYWRkT3JTZXRLZXkgPSBmdW5jdGlvbiggY2h1bmssIGRhdGUsIHBhY2sgKXtcclxuXHJcbiAgICAvLyBUT0RPIHNtYXJ0IHRoaW5nXHJcblxyXG4gICAgaWYoICF0aGlzLmtleXNbIGNodW5rIF0gKVxyXG4gICAgICAgIHRoaXMua2V5c1sgY2h1bmsgXSA9IFtdXHJcblxyXG4gICAgZm9yKHZhciBpPXRoaXMua2V5c1sgY2h1bmsgXS5sZW5ndGg7IGktLTspXHJcbiAgICAgICAgaWYoIHRoaXMua2V5c1sgY2h1bmsgXVsgaSBdLmRhdGUgPT0gZGF0ZSApXHJcbiAgICAgICAgICAgIHJldHVybiB2b2lkICh0aGlzLmtleXNbIGNodW5rIF1bIGkgXS5wYWNrID0gcGFjaylcclxuXHJcbiAgICB2YXIga1xyXG4gICAgdGhpcy5rZXlzWyBjaHVuayBdLnB1c2goayA9IHtcclxuICAgICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICAgIHBhY2s6IHBhY2tcclxuICAgIH0pXHJcbiAgICB0aGlzLmtleXNbIGNodW5rIF0uc29ydCggc29ydEZuIClcclxuXHJcbiAgICByZXR1cm4ga1xyXG59XHJcbnZhciByZW1vdmVLZXkgPSBmdW5jdGlvbiggY2h1bmssIGtleSApe1xyXG4gICAgdmFyIGlcclxuICAgIGlmKCAhdGhpcy5rZXlzWyBjaHVuayBdIHx8ICggaT10aGlzLmtleXNbIGNodW5rIF0uaW5kZXhPZigga2V5ICkgKSA8PS0xIClcclxuICAgICAgICByZXR1cm5cclxuICAgIHJldHVybiB0aGlzLmtleXNbIGNodW5rIF0uc3BsaWNlKCBpLCAxIClbIDAgXVxyXG59XHJcbnZhciBzZXRLZXlEYXRlID0gZnVuY3Rpb24oIGNodW5rLCBrZXksIGRhdGUgKXtcclxuXHJcbiAgICAvLyBUT0RPIHNtYXJ0IHRoaW5nXHJcblxyXG4gICAga2V5LmRhdGUgPSBkYXRlXHJcbiAgICB0aGlzLmtleXNbIGNodW5rIF0uc29ydCggc29ydEZuIClcclxuXHJcbiAgICByZXR1cm4ga2V5XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggQWJzdHJhY3QgKVxyXG4uZXh0ZW5kKCBoaXN0b3JpemFibGUgKVxyXG4uZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXQsXHJcbiAgICBhZGRPclNldEtleTogYWRkT3JTZXRLZXksXHJcbiAgICBzZXRLZXlEYXRlOiBzZXRLZXlEYXRlLFxyXG4gICAgcmVtb3ZlS2V5OiByZW1vdmVLZXksXHJcblxyXG59KVxyXG4iLCJ2YXIgQWJzdHJhY3QgPSByZXF1aXJlKCcuLi91dGlscy9BYnN0cmFjdCcpXHJcbiAgLCBoID0gcmVxdWlyZSgnLi9taXhpbi9oaXN0b3JpemFibGUnKVxyXG4gICwgZWQgPSByZXF1aXJlKCcuLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuXHJcblxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCB0eXBlICl7XHJcblxyXG4gICAgdGhpcy5zdGFjayA9IFtdXHJcbiAgICB0aGlzLnVuZG9fc3RhY2sgPSBbXVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbnZhciBzYXZlID0gZnVuY3Rpb24oIG1vZGVsICl7XHJcbiAgICB0aGlzLnN0YWNrLnB1c2goeyBtb2RlbDogbW9kZWwsIHBhY2s6IG1vZGVsLnBhY2soKSB9KVxyXG5cclxuICAgIHRoaXMudW5kb19zdGFjay5sZW5ndGggPSAwXHJcblxyXG4gICAgd2hpbGUgKCB0aGlzLnN0YWNrLmxlbmd0aCA+IDUwIClcclxuICAgICAgICB0aGlzLnN0YWNrLnNoaWZ0KClcclxufVxyXG5cclxudmFyIGRpc3BhdGNoID0gZnVuY3Rpb24oIG1vZGVsICl7XHJcbiAgICBlZC5kaXNwYXRjaCggJ2NoYW5nZTp0aW1lTGluZScsIHtcclxuICAgICAgICBub19oaXN0b3J5OiB0cnVlXHJcbiAgICB9KVxyXG59XHJcblxyXG52YXIgdW5kbyA9IGZ1bmN0aW9uKCBvICl7XHJcbiAgICBpZiAoIHRoaXMuc3RhY2subGVuZ3RoPD0xIClcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICB2YXIgbyA9IHRoaXMuc3RhY2sucG9wKClcclxuXHJcbiAgICB2YXIgbGFzdCA9IHRoaXMuc3RhY2tbIHRoaXMuc3RhY2subGVuZ3RoLTEgXVxyXG5cclxuICAgIG8ubW9kZWwudW5wYWNrKCBoLmRlZXBDb3B5KCBsYXN0LnBhY2sgKSApXHJcblxyXG4gICAgZGlzcGF0Y2goIG8ubW9kZWwgKVxyXG5cclxuXHJcbiAgICB0aGlzLnVuZG9fc3RhY2sucHVzaCggbyApXHJcbn1cclxuXHJcbnZhciByZWRvID0gZnVuY3Rpb24oIG8gKXtcclxuXHJcbiAgICBpZiAoICF0aGlzLnVuZG9fc3RhY2subGVuZ3RoIClcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICB2YXIgbyA9IHRoaXMudW5kb19zdGFjay5wb3AoKVxyXG5cclxuICAgIG8ubW9kZWwudW5wYWNrKCBoLmRlZXBDb3B5KCBvLnBhY2sgKSApXHJcblxyXG4gICAgdGhpcy5zdGFjay5wdXNoKCBvIClcclxuXHJcbiAgICBkaXNwYXRjaCggby5tb2RlbCApXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggQWJzdHJhY3QgKVxyXG4uZXh0ZW5kKCBoIClcclxuLmV4dGVuZCh7XHJcbiAgICBpbml0OiBpbml0LFxyXG4gICAgdW5kbzogdW5kbyxcclxuICAgIHJlZG86IHJlZG8sXHJcbiAgICBzYXZlOiBzYXZlLFxyXG59KVxyXG4iLCJcclxudmFyIGRlZXBDb3B5ID0gZnVuY3Rpb24oIG8gKXtcclxuICAgIGlmKCB0eXBlb2YgbyAhPT0gJ29iamVjdCcgKVxyXG4gICAgICAgIHJldHVybiBvXHJcblxyXG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIG8gKSApXHJcbiAgICAgICAgcmV0dXJuIG8ubWFwKGRlZXBDb3B5KVxyXG5cclxuICAgIHZhciByZXMgPSB7fVxyXG4gICAgZm9yKCB2YXIgaSBpbiBvIClcclxuICAgICAgICBpZiggdHlwZW9mIG9bIGkgXSAhPT0gJ2Z1bmN0aW9uJyApXHJcbiAgICAgICAgICAgIHJlc1sgaSBdID0gZGVlcENvcHkoIG9bIGkgXSApXHJcbiAgICByZXR1cm4gcmVzXHJcbn1cclxuXHJcbnZhciB1bnBhY2sgPSBmdW5jdGlvbiggbyApe1xyXG4gICAgZm9yKCB2YXIgaSBpbiBvIClcclxuICAgICAgICB0aGlzWyBpIF0gPSBkZWVwQ29weSggb1sgaSBdIClcclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgcGFjazogZnVuY3Rpb24oKXsgcmV0dXJuIGRlZXBDb3B5KCB0aGlzICkgfSxcclxuICAgIHVucGFjazogdW5wYWNrLFxyXG4gICAgZGVlcENvcHk6IGRlZXBDb3B5XHJcbn1cclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgZWQgPSByZXF1aXJlKCcuLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuXHJcbnZhciBoYW5kbGVyID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcbiAgICBlZC5kaXNwYXRjaCggJ3VpLScrZXZlbnQudHlwZSwge1xyXG4gICAgICAgIG1vdXNlRXZlbnQ6IGV2ZW50XHJcbiAgICB9KVxyXG59XHJcblxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCBtb2RlbEJhbGwsIGRvbVN2ZyApe1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBoYW5kbGVyLCBmYWxzZSApXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgaGFuZGxlciwgZmFsc2UgKVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBoYW5kbGVyLCBmYWxzZSApXHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBoYW5kbGVyLCBmYWxzZSApXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBBYnN0cmFjdCApXHJcbi5leHRlbmQoe1xyXG4gICAgaW5pdDogaW5pdFxyXG59KVxyXG4iLCJ2YXIgQWJzdHJhY3QgPSByZXF1aXJlKCcuLi8uLi91dGlscy9BYnN0cmFjdCcpXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4uLy4uL3N5c3RlbS9ldmVudERpc3BhdGNoZXInKVxyXG4gICwgc3ZnID0gcmVxdWlyZSgnLi9zdmctdXRpbCcpXHJcblxyXG5cclxudmFyIHJlbmRlciA9IGZ1bmN0aW9uKCApe1xyXG4gICAgdmFyIGZhY2UgPSB0aGlzLm1vZGVsLmZhY2VcclxuICAgIHZhciBjYW1lcmEgPSB0aGlzLm1vZGVsLmNhbWVyYVxyXG4gICAgdmFyIHByb2ogPSBmdW5jdGlvbiggcCApe1xyXG4gICAgICAgIHZhciBwcCA9IGNhbWVyYS5wcm9qZWN0KCBwIClcclxuICAgICAgICBwcC50eXBlID0gcC50eXBlXHJcbiAgICAgICAgcmV0dXJuIHBwXHJcbiAgICB9XHJcblxyXG4gICAgZm9yKCB2YXIgaSBpbiBmYWNlLmNodW5rICkge1xyXG4gICAgICAgIGZhY2UuY2h1bmtbIGkgXS5yZWNvbXB1dGUoKVxyXG4gICAgICAgIHRoaXMuZG9tWyBpIF0uc2V0QXR0cmlidXRlKCAnZCcsXHJcbiAgICAgICAgICAgIHN2Zy5yZW5kZXJCZXppZXIoIGZhY2UuY2h1bmtbIGkgXS5iZXppZXJQYXRoLm1hcCggcHJvaiApIClcclxuICAgICAgICApXHJcbiAgICB9XHJcbn1cclxuXHJcbnZhciBidWlsZCA9IGZ1bmN0aW9uKCBkb21TdmcgKXtcclxuICAgIHZhciBmYWNlID0gdGhpcy5tb2RlbC5mYWNlXHJcblxyXG4gICAgdGhpcy5kb20gPSB7fVxyXG5cclxuICAgIGZvciggdmFyIGkgaW4gZmFjZS5jaHVuayApe1xyXG4gICAgICAgIHRoaXMuZG9tWyBpIF0gPSBzdmcuY3JlYXRlKCdwYXRoJylcclxuICAgICAgICB0aGlzLmRvbVsgaSBdLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnaGFpci1jaHVuayAnK2kpXHJcbiAgICAgICAgZG9tU3ZnLmFwcGVuZENoaWxkKCB0aGlzLmRvbVsgaSBdIClcclxuICAgIH1cclxufVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggbW9kZWxCYWxsLCBkb21TdmcgKXtcclxuXHJcbiAgICB0aGlzLm1vZGVsID0ge1xyXG4gICAgICAgIGZhY2U6IG1vZGVsQmFsbC5mYWNlLFxyXG4gICAgICAgIGNhbWVyYTogbW9kZWxCYWxsLmNhbWVyYVxyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkLmNhbGwoIHRoaXMsIGRvbVN2ZyApXHJcblxyXG4gICAgZWQubGlzdGVuKCAncmVuZGVyJyAsIHJlbmRlci5iaW5kKCB0aGlzICkgLCB0aGlzIClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0IClcclxuLmV4dGVuZCh7XHJcbiAgICBpbml0OiBpbml0LFxyXG4gICAgcmVuZGVyOiByZW5kZXJcclxufSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgZWQgPSByZXF1aXJlKCcuLi8uLi9zeXN0ZW0vZXZlbnREaXNwYXRjaGVyJylcclxuICAsIHN2ZyA9IHJlcXVpcmUoJy4vc3ZnLXV0aWwnKVxyXG5cclxudmFyIHRpYyA9IGZ1bmN0aW9uKCB4LCB5ICl7XHJcbiAgICB2YXIgdCA9IHN2Zy5jcmVhdGUoJ2NpcmNsZScpXHJcbiAgICB0LnNldEF0dHJpYnV0ZSggJ2N4JywgeCApXHJcbiAgICB0LnNldEF0dHJpYnV0ZSggJ2N5JywgeSApXHJcbiAgICB0LnNldEF0dHJpYnV0ZSggJ3InLCA1IClcclxuICAgIHQuc2V0QXR0cmlidXRlKCAnY2xhc3MnLCAnY29udHJvbC10aWMnIClcclxuICAgIHJldHVybiB0XHJcbn1cclxuXHJcbnZhciByZW5kZXIgPSBmdW5jdGlvbiggKXtcclxuICAgIHZhciBmYWNlID0gdGhpcy5tb2RlbC5mYWNlXHJcbiAgICB2YXIgcHJvaiA9IHRoaXMubW9kZWwuY2FtZXJhLnByb2plY3RcclxuXHJcbiAgICBmb3IoIHZhciBpIGluIGZhY2UuY2h1bmsgKXtcclxuXHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuZG9tWyBpIF1cclxuICAgICAgICB2YXIgc2hhcGUgPSBmYWNlLmNodW5rWyBpIF1cclxuXHJcbiAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnXHJcblxyXG4gICAgICAgIHZhciBwdHMsIGMsIGRcclxuXHJcbiAgICAgICAgaWYoIHNoYXBlLmxpbmUgKXtcclxuICAgICAgICAgICAgLy8gaXMgYSBsaW5lXHJcbiAgICAgICAgICAgIHB0cyA9IHNoYXBlLmxpbmVcclxuICAgICAgICAgICAgYyA9ICdjb250cm9sLWxpbmUnXHJcbiAgICAgICAgICAgIGQgPSAnbGluZSdcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBpcyBhIHBhdGhcclxuICAgICAgICAgICAgcHRzID0gc2hhcGUudmVydGV4XHJcbiAgICAgICAgICAgIGMgPSAnY29udHJvbC1wYXRoJ1xyXG4gICAgICAgICAgICBkID0gJ3ZlcnRleCdcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB0cy5tYXAoIHByb2ogKS5mb3JFYWNoKGZ1bmN0aW9uKCBwLCBpbmRleCApe1xyXG4gICAgICAgICAgICB2YXIgdCA9IHRpYyggcC54LCBwLnkgKVxyXG4gICAgICAgICAgICB0LnNldEF0dHJpYnV0ZSggJ2NsYXNzJywgJ2NvbnRyb2wtdGljICcrYyApXHJcbiAgICAgICAgICAgIHQuc2V0QXR0cmlidXRlKCAnZGF0YS1pJywgaW5kZXggKVxyXG4gICAgICAgICAgICB0LnNldEF0dHJpYnV0ZSggJ2RhdGEtY2h1bmsnLCBpIClcclxuICAgICAgICAgICAgdC5zZXRBdHRyaWJ1dGUoICdkYXRhLXBvb2wnLCBkIClcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKCB0IClcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG52YXIgYnVpbGQgPSBmdW5jdGlvbiggZG9tU3ZnICl7XHJcbiAgICB2YXIgZmFjZSA9IHRoaXMubW9kZWwuZmFjZVxyXG5cclxuICAgIHRoaXMuZG9tID0ge31cclxuXHJcbiAgICBmb3IoIHZhciBpIGluIGZhY2UuY2h1bmsgKXtcclxuICAgICAgICB0aGlzLmRvbVsgaSBdID0gc3ZnLmNyZWF0ZSgnZycpXHJcbiAgICAgICAgdGhpcy5kb21bIGkgXS5jbGFzc05hbWUgPSAnY29udHJvbCBjb250cm9sLScraVxyXG4gICAgICAgIHRoaXMuZG9tWyBpIF0uc2V0QXR0cmlidXRlKCAnZGF0YS1jaHVuaycsIGkgKVxyXG4gICAgICAgIGRvbVN2Zy5hcHBlbmRDaGlsZCggdGhpcy5kb21bIGkgXSApXHJcbiAgICB9XHJcbn1cclxuXHJcbnZhciBkb3duID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcbiAgICBpZiggIWV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoICdkYXRhLXBvb2wnICkgKVxyXG4gICAgICAgIHJldHVyblxyXG5cclxuICAgIHZhciBpID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSggJ2RhdGEtaScgKSxcclxuICAgICAgICBjaHVuayA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoICdkYXRhLWNodW5rJyApLFxyXG4gICAgICAgIHBvb2wgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCAnZGF0YS1wb29sJyApXHJcblxyXG4gICAgZWQuZGlzcGF0Y2goICd1aS10aWMtbW91c2Vkb3duJyAsIHtcclxuICAgICAgICBpOiBpLFxyXG4gICAgICAgIGNodW5rOiBjaHVuayxcclxuICAgICAgICBwb29sOiBwb29sLFxyXG4gICAgICAgIG1vdXNlRXZlbnQ6IGV2ZW50XHJcbiAgICB9KVxyXG59XHJcblxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCBtb2RlbEJhbGwsIGRvbVN2ZyApe1xyXG5cclxuICAgIHRoaXMubW9kZWwgPSB7XHJcbiAgICAgICAgZmFjZTogbW9kZWxCYWxsLmZhY2UsXHJcbiAgICAgICAgY2FtZXJhOiBtb2RlbEJhbGwuY2FtZXJhLFxyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkLmNhbGwoIHRoaXMsIGRvbVN2ZyApXHJcblxyXG5cclxuICAgIGRvbVN2Zy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgZG93biwgZmFsc2UgKVxyXG5cclxuXHJcbiAgICBlZC5saXN0ZW4oICdyZW5kZXInICwgcmVuZGVyLmJpbmQoIHRoaXMgKSAsIHRoaXMgKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggQWJzdHJhY3QgKVxyXG4uZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXQsXHJcbiAgICByZW5kZXI6IHJlbmRlclxyXG59KVxyXG4iLCJcclxudmFyIGZsb29yID0gZnVuY3Rpb24oIHggKXtcclxuICAgIHJldHVybiAoMHwoeCoxMDApKS8xMDA7XHJcbn1cclxudmFyIHBvaW50ID0gZnVuY3Rpb24oIHAgKXtcclxuICAgcmV0dXJuIGZsb29yKHAueCkrJyAnK2Zsb29yKHAueSlcclxufVxyXG52YXIgcmVuZGVyQmV6aWVyID0gZnVuY3Rpb24oIHB0cyApe1xyXG4gICAgaWYoICFwdHMubGVuZ3RoIClcclxuICAgICAgICByZXR1cm4gJydcclxuICAgIHZhciBkPSdNJytwb2ludCggcHRzWzBdIClcclxuICAgIGZvciggdmFyIGkgPSAxOyBpPHB0cy5sZW5ndGggOyBpKysgKVxyXG4gICAgICAgIHN3aXRjaCggcHRzW2ldLnR5cGUgKXtcclxuICAgICAgICAgICAgY2FzZSAnRic6IGQrPSdMJytwb2ludCggcHRzW2ldICk7IGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgJ0MnOiBkKz0nUScrcG9pbnQoIHB0c1tpKytdICkrJyAnK3BvaW50KCBwdHNbaV0gKTsgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gZCsneidcclxufVxyXG52YXIgcmVuZGVyTGluZSA9IGZ1bmN0aW9uKCBwdHMsIGNsb3NlICl7XHJcbiAgICByZXR1cm4gJ00nK3B0cy5yZWR1Y2UoZnVuY3Rpb24ocCwgYyl7XHJcbiAgICAgICAgcmV0dXJuIHArJ0wnK3BvaW50KGMpXHJcbiAgICB9LCcnKS5zbGljZSgxKSsoIGNsb3NlID8gJ3onIDogJycgKVxyXG59XHJcblxyXG5cclxudmFyIHN2Z05TID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xyXG52YXIgY3JlYXRlID0gZnVuY3Rpb24oIHR5cGUgKXtcclxuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z05TLCB0eXBlIClcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICByZW5kZXJCZXppZXIgOiByZW5kZXJCZXppZXIsXHJcbiAgICByZW5kZXJMaW5lOiByZW5kZXJMaW5lLFxyXG4gICAgY3JlYXRlOiBjcmVhdGUsXHJcblxyXG4gICAgc3ZnTlM6IHN2Z05TXHJcbn1cclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgZG9tID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvZG9tSGVscGVyJylcclxuICAsIGVkID0gcmVxdWlyZSgnLi4vLi4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcblxyXG5cclxuXHJcblxyXG5cclxudmFyIGdldERhdGUgPSBmdW5jdGlvbiggbW91c2VFdmVudCApe1xyXG4gICAgdmFyIG8gPSBkb20ub2Zmc2V0KCB0aGlzLmRvbUVsICkubGVmdFxyXG4gICAgdmFyIHggPSBtb3VzZUV2ZW50LnBhZ2VYXHJcbiAgICByZXR1cm4gdGhpcy5tb2RlbC50aW1lTGluZVN0YXRlLnVucHJvamVjdCggeC1vIClcclxufVxyXG52YXIgcmVsYXlFdmVudCA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG4gICAgcmV0dXJuIGVkLmRpc3BhdGNoKCAndWktdGxDdXJzb3ItJytldmVudC50eXBlLCB7XHJcbiAgICAgICAgZGF0ZTogZ2V0RGF0ZS5jYWxsKHRoaXMsIGV2ZW50ICksXHJcbiAgICAgICAgbW91c2VFdmVudDogZXZlbnRcclxuICAgIH0pXHJcbn1cclxuXHJcbnZhciByZW5kZXIgPSBmdW5jdGlvbiggKXtcclxuICAgIHZhciB0aW1lTGluZVN0YXRlID0gdGhpcy5tb2RlbC50aW1lTGluZVN0YXRlXHJcbiAgICB0aGlzLmRvbUN1cnNvci5zdHlsZS5sZWZ0ID0gKHRpbWVMaW5lU3RhdGUucHJvamVjdCggdGltZUxpbmVTdGF0ZS5jdXJzb3IgKSAtMikrJ3B4J1xyXG59XHJcblxyXG52YXIgdHBsID0gW1xyXG4nPGRpdiBjbGFzcz1cInRsLXJ1bGVyXCI+JyxcclxuICAgICc8ZGl2IGNsYXNzPVwidGwtY3Vyc29yXCI+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzxkaXYgY2xhc3M9XCJ0bC1ydWxlci1ncmlkXCI+PC9kaXY+JyxcclxuJzwvZGl2PicsXHJcbl0uam9pbignJylcclxuXHJcbnZhciBidWlsZCA9IGZ1bmN0aW9uKCApe1xyXG5cclxuICAgIHRoaXMuZG9tRWwgPSBkb20uZG9taWZ5KCB0cGwgKVxyXG5cclxuICAgIHRoaXMuZG9tQ3Vyc29yID0gdGhpcy5kb21FbC5xdWVyeVNlbGVjdG9yKCcudGwtY3Vyc29yJylcclxufVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggbW9kZWxCYWxsLCBib2R5ICl7XHJcblxyXG4gICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICB0aW1lTGluZVN0YXRlOiBtb2RlbEJhbGwudGltZUxpbmVTdGF0ZSxcclxuICAgIH1cclxuXHJcbiAgICBidWlsZC5jYWxsKCB0aGlzIClcclxuXHJcbiAgICBlZC5saXN0ZW4oICdjaGFuZ2U6dGltZUxpbmVTdGF0ZScgLCByZW5kZXIuYmluZCggdGhpcyApICwgdGhpcyApXHJcblxyXG4gICAgdGhpcy5kb21FbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCByZWxheUV2ZW50LmJpbmQodGhpcyksIGZhbHNlIClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0IClcclxuLmV4dGVuZCh7XHJcbiAgICBpbml0OiBpbml0LFxyXG4gICAgcmVuZGVyOiByZW5kZXJcclxufSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG4gICwgZG9tID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvZG9tSGVscGVyJylcclxuICAsIGVkID0gcmVxdWlyZSgnLi4vLi4vc3lzdGVtL2V2ZW50RGlzcGF0Y2hlcicpXHJcbiAgLCBSdWxlciA9IHJlcXVpcmUoJy4vcnVsZXInKVxyXG5cclxuXHJcbnZhciBrZXlfdHBsID0gW1xyXG4nPGRpdiBjbGFzcz1cInRsLWtleVwiPicsXHJcbic8L2Rpdj4nLFxyXG5dLmpvaW4oJycpXHJcblxyXG52YXIgbGFiZWxfdHBsID0gW1xyXG4nPGRpdiBjbGFzcz1cInRsLXJvd1wiPicsXHJcbiAgICAnPHNwYW4gY2xhc3M9XCJ0bC1sYWJlbFwiPjwvc3Bhbj4nLFxyXG4nPC9kaXY+JyxcclxuXS5qb2luKCcnKVxyXG5cclxudmFyIHJvd190cGwgPSBbXHJcbic8ZGl2IGNsYXNzPVwidGwtcm93XCI+JyxcclxuJzwvZGl2PicsXHJcbl0uam9pbignJylcclxuXHJcbnZhciB0cGwgPSBbXHJcbic8ZGl2IGNsYXNzPVwidGxcIj4nLFxyXG4gICAgJzxkaXYgY2xhc3M9XCJ0bC1sZWZ0XCI+JyxcclxuICAgICAgICAnPGRpdiBjbGFzcz1cInRsLWJsb2NrLWxhYmVsXCI+PC9kaXY+JyxcclxuICAgICc8L2Rpdj4nLFxyXG4gICAgJzxkaXYgY2xhc3M9XCJ0bC1yaWdodFwiPicsXHJcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJ0bC1ibG9jay1saW5lc1wiPjwvZGl2PicsXHJcbiAgICAnPC9kaXY+JyxcclxuJzwvZGl2PicsXHJcbl0uam9pbignJylcclxuXHJcblxyXG52YXIgZ2V0RGF0ZSA9IGZ1bmN0aW9uKCBtb3VzZUV2ZW50ICl7XHJcbiAgICB2YXIgbyA9IGRvbS5vZmZzZXQoIHRoaXMuZG9tRWwucXVlcnlTZWxlY3RvcignLnRsLWJsb2NrLWxpbmVzJykgKS5sZWZ0XHJcbiAgICB2YXIgeCA9IG1vdXNlRXZlbnQucGFnZVhcclxuICAgIHJldHVybiB0aGlzLm1vZGVsLnRpbWVMaW5lU3RhdGUudW5wcm9qZWN0KCB4LW8gKVxyXG59XHJcbnZhciByZWxheUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcblxyXG4gICAgLy8gb25seSBjb25zaWRlciBtYWluIGJ1dHRvbiAoIGJ1dHRvbiA9PSAwIClcclxuICAgIGlmKCBldmVudC5idXR0b24gKVxyXG4gICAgICAgIHJldHVyblxyXG5cclxuICAgIHZhciBrZXksIGxpbmVcclxuICAgIGlmKCBrZXkgPSBkb20uZ2V0UGFyZW50KCBldmVudC50YXJnZXQsICd0bC1rZXknICkgKVxyXG4gICAgICAgIHJldHVybiBlZC5kaXNwYXRjaCggJ3VpLXRsS2V5LScrZXZlbnQudHlwZSwge1xyXG4gICAgICAgICAgICBtb3VzZUV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgY2h1bms6IGRvbS5nZXRQYXJlbnQoIGtleSwgJ3RsLXJvdycgKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2h1bmsnKSxcclxuICAgICAgICAgICAgaToga2V5LmdldEF0dHJpYnV0ZSgnZGF0YS1pJyksXHJcbiAgICAgICAgICAgIGRhdGU6IGdldERhdGUuY2FsbCggdGhpcywgZXZlbnQgKVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgaWYoIGxpbmUgPSBkb20uZ2V0UGFyZW50KCBldmVudC50YXJnZXQsICd0bC1yb3cnICkgKVxyXG4gICAgICAgIHJldHVybiBlZC5kaXNwYXRjaCggJ3VpLXRsTGluZS0nK2V2ZW50LnR5cGUsIHtcclxuICAgICAgICAgICAgbW91c2VFdmVudDogZXZlbnQsXHJcbiAgICAgICAgICAgIGNodW5rOiBsaW5lLmdldEF0dHJpYnV0ZSgnZGF0YS1jaHVuaycpLFxyXG4gICAgICAgICAgICBkYXRlOiBnZXREYXRlLmNhbGwoIHRoaXMsIGV2ZW50IClcclxuICAgICAgICB9KVxyXG59XHJcblxyXG52YXIgcmVuZGVyID0gZnVuY3Rpb24oICl7XHJcbiAgICB2YXIgdGltZUxpbmUgPSB0aGlzLm1vZGVsLnRpbWVMaW5lXHJcbiAgICB2YXIgcHJvaiA9IHRoaXMubW9kZWwudGltZUxpbmVTdGF0ZS5wcm9qZWN0XHJcblxyXG4gICAgLy8gZm9yIGVhY2ggY2h1bmtcclxuICAgIGZvciggdmFyIGsgaW4gdGhpcy5kb21MaW5lcyApe1xyXG5cclxuICAgICAgICAvLyBjbGVhbiB1cFxyXG4gICAgICAgIHZhciBjID0gdGhpcy5kb21MaW5lc1sgayBdLmNoaWxkcmVuO1xyXG4gICAgICAgIGZvciggdmFyIGk9Yy5sZW5ndGg7IGktLTsgKVxyXG4gICAgICAgICAgICBjWyBpIF0ucmVtb3ZlKClcclxuXHJcbiAgICAgICAgLy8gZm9yIGVhY2gga2V5XHJcbiAgICAgICAgZm9yKCB2YXIgaT0odGltZUxpbmUua2V5c1sgayBdfHxbXSkubGVuZ3RoOyBpLS07ICl7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGsgPSBkb20uZG9taWZ5KCBrZXlfdHBsIClcclxuICAgICAgICAgICAgZGsuc2V0QXR0cmlidXRlKCAnZGF0YS1pJywgaSApXHJcbiAgICAgICAgICAgIGRrLnN0eWxlLmxlZnQgPSAocHJvaiggdGltZUxpbmUua2V5c1sgayBdWyBpIF0uZGF0ZSApIC01KSsncHgnXHJcblxyXG4gICAgICAgICAgICB0aGlzLmRvbUxpbmVzWyBrIF0uYXBwZW5kQ2hpbGQoIGRrIClcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG5cclxudmFyIGJ1aWxkID0gZnVuY3Rpb24oICl7XHJcbiAgICB2YXIgZmFjZSA9IHRoaXMubW9kZWwuZmFjZVxyXG5cclxuICAgIHRoaXMuZG9tRWwgPSBkb20uZG9taWZ5KCB0cGwgKVxyXG5cclxuICAgIHZhciBsYWJlbHMgPSB0aGlzLmRvbUVsLnF1ZXJ5U2VsZWN0b3IoJy50bC1ibG9jay1sYWJlbCcpLFxyXG4gICAgICAgIGxpbmVzID0gdGhpcy5kb21FbC5xdWVyeVNlbGVjdG9yKCcudGwtYmxvY2stbGluZXMnKVxyXG5cclxuICAgIHRoaXMuZG9tRWwucXVlcnlTZWxlY3RvcignLnRsLXJpZ2h0JykuaW5zZXJ0QmVmb3JlKCB0aGlzLnJ1bGVyLmRvbUVsLCBsaW5lcyApXHJcblxyXG4gICAgdGhpcy5kb21MaW5lcyA9IHt9XHJcblxyXG4gICAgdmFyIGs9MFxyXG4gICAgZm9yKCB2YXIgaSBpbiBmYWNlLmNodW5rICl7XHJcbiAgICAgICAgdmFyIGxhYmVsID0gZG9tLmRvbWlmeSggbGFiZWxfdHBsIClcclxuICAgICAgICB2YXIgcm93ID0gZG9tLmRvbWlmeSggcm93X3RwbCApXHJcblxyXG4gICAgICAgIGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJy50bC1sYWJlbCcpLmlubmVySFRNTCA9IGkucmVwbGFjZSgnXycsICcgJylcclxuXHJcbiAgICAgICAgcm93LnNldEF0dHJpYnV0ZSgnZGF0YS1jaHVuaycsIGkpXHJcblxyXG4gICAgICAgIGxhYmVscy5hcHBlbmRDaGlsZCggbGFiZWwgKVxyXG4gICAgICAgIGxpbmVzLmFwcGVuZENoaWxkKCByb3cgKVxyXG5cclxuICAgICAgICB0aGlzLmRvbUxpbmVzWyBpIF0gPSByb3dcclxuICAgIH1cclxufVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggbW9kZWxCYWxsLCB0aW1lTGluZUVMICl7XHJcblxyXG4gICAgdGhpcy5tb2RlbCA9IHtcclxuICAgICAgICBmYWNlOiBtb2RlbEJhbGwuZmFjZSxcclxuICAgICAgICB0aW1lTGluZVN0YXRlOiBtb2RlbEJhbGwudGltZUxpbmVTdGF0ZSxcclxuICAgICAgICB0aW1lTGluZTogbW9kZWxCYWxsLnRpbWVMaW5lLFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucnVsZXIgPSBPYmplY3QuY3JlYXRlKCBSdWxlciApLmluaXQoIG1vZGVsQmFsbCApXHJcblxyXG4gICAgYnVpbGQuY2FsbCggdGhpcyApXHJcblxyXG4gICAgdGltZUxpbmVFTC5jbGFzc05hbWUgKz0gJyB0bCdcclxuICAgIGZvciggdmFyIGkgPSB0aGlzLmRvbUVsLmNoaWxkcmVuLmxlbmd0aDsgaS0tOyApXHJcbiAgICAgICAgdGltZUxpbmVFTC5hcHBlbmRDaGlsZCggdGhpcy5kb21FbC5jaGlsZHJlbltpXSApXHJcbiAgICB0aGlzLmRvbUVsID0gdGltZUxpbmVFTFxyXG5cclxuXHJcbiAgICBlZC5saXN0ZW4oICdjaGFuZ2U6dGltZUxpbmUnICwgcmVuZGVyLmJpbmQoIHRoaXMgKSAsIHRoaXMgKVxyXG4gICAgZWQubGlzdGVuKCAncmVuZGVyJyAsIHJlbmRlci5iaW5kKCB0aGlzICkgLCB0aGlzIClcclxuXHJcbiAgICB0aGlzLmRvbUVsLnF1ZXJ5U2VsZWN0b3IoJy50bC1ibG9jay1saW5lcycpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHJlbGF5RXZlbnQuYmluZCh0aGlzKSwgZmFsc2UgKVxyXG4gICAgdGhpcy5kb21FbC5xdWVyeVNlbGVjdG9yKCcudGwtYmxvY2stbGluZXMnKS5hZGRFdmVudExpc3RlbmVyKCdkb3VibGVjbGljaycsIHJlbGF5RXZlbnQuYmluZCh0aGlzKSwgZmFsc2UgKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggQWJzdHJhY3QgKVxyXG4uZXh0ZW5kKHtcclxuICAgIGluaXQ6IGluaXQsXHJcbiAgICByZW5kZXI6IHJlbmRlclxyXG59KVxyXG4iLCJ2YXIgQWJzdHJhY3QgPSByZXF1aXJlKCcuLi91dGlscy9BYnN0cmFjdCcpXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4uL3N5c3RlbS9ldmVudERpc3BhdGNoZXInKVxyXG4gICwgaW50ZXJwb2xhdGUgPSByZXF1aXJlKCcuLi9zeXN0ZW0vaW50ZXJwb2xhdGUnKVxyXG5cclxuIHZhciBpbml0ID0gZnVuY3Rpb24oIG1vZGVsQmFsbCApe1xyXG5cclxuICAgICB0aGlzLm1vZGVsID0ge1xyXG4gICAgICAgICBmYWNlOiBtb2RlbEJhbGwuZmFjZSxcclxuICAgICAgICAgdGltZUxpbmU6IG1vZGVsQmFsbC50aW1lTGluZSxcclxuICAgICAgICAgdGltZUxpbmVTdGF0ZTogbW9kZWxCYWxsLnRpbWVMaW5lU3RhdGVcclxuICAgICB9XHJcblxyXG4gICAgIHRoaXMuY2hhbmdlU2hhcGUgPSBjaGFuZ2VTaGFwZS5iaW5kKCB0aGlzIClcclxuICAgICB0aGlzLmNoYW5nZUN1cnNvciA9IGNoYW5nZUN1cnNvci5iaW5kKCB0aGlzIClcclxuXHJcbiAgICAgcmV0dXJuIHRoaXNcclxuIH1cclxuXHJcbiB2YXIgZW5hYmxlID0gZnVuY3Rpb24oKXtcclxuICAgICB0aGlzLmRpc2FibGUoKVxyXG4gICAgIGVkLmxpc3RlbiggJ2NoYW5nZTpzaGFwZScsIHRoaXMuY2hhbmdlU2hhcGUsIHRoaXMgKVxyXG4gICAgIGVkLmxpc3RlbiggJ2NoYW5nZTp0aW1lTGluZVN0YXRlJywgdGhpcy5jaGFuZ2VDdXJzb3IsIHRoaXMgKVxyXG4gfVxyXG4gdmFyIGRpc2FibGUgPSBmdW5jdGlvbigpe1xyXG4gICAgIGVkLnVubGlzdGVuKCAnY2hhbmdlOnNoYXBlJywgdGhpcyApXHJcbiAgICAgZWQudW5saXN0ZW4oICdjaGFuZ2U6dGltZUxpbmVTdGF0ZScsIHRoaXMgKVxyXG4gfVxyXG5cclxuIHZhciBjaGFuZ2VTaGFwZSA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG5cclxuICAgICBpZihldmVudC53aXAgfHwgZXZlbnQuaXNfaW50ZXJwb2xhdGlvbilcclxuICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgIGZvciggdmFyIGNodW5rIGluIHRoaXMubW9kZWwuZmFjZS5jaHVuayApXHJcbiAgICAgICAgIGlmKCB0aGlzLm1vZGVsLmZhY2UuY2h1bmtbY2h1bmtdID09IGV2ZW50LnNoYXBlIClcclxuICAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgIHRoaXMubW9kZWwudGltZUxpbmUuYWRkT3JTZXRLZXkoIGNodW5rLCB0aGlzLm1vZGVsLnRpbWVMaW5lU3RhdGUuY3Vyc29yLCBldmVudC5zaGFwZS5wYWNrKCkgKVxyXG5cclxuICAgICBlZC5kaXNwYXRjaCggJ2NoYW5nZTp0aW1lTGluZScsIHtcclxuICAgICAgICAgd2lwOiBmYWxzZVxyXG4gICAgIH0pXHJcbiB9XHJcbiB2YXIgY2hhbmdlQ3Vyc29yID0gZnVuY3Rpb24oIGV2ZW50ICl7XHJcblxyXG4gICAgIHZhciBmY2h1bmsgPSB0aGlzLm1vZGVsLmZhY2UuY2h1bmssXHJcbiAgICAgICAgIGRhdGUgPSB0aGlzLm1vZGVsLnRpbWVMaW5lU3RhdGUuY3Vyc29yLFxyXG4gICAgICAgICBrZXlzID0gdGhpcy5tb2RlbC50aW1lTGluZS5rZXlzXHJcblxyXG4gICAgIGlmKCB0aGlzLl9jdXJzb3IgPT0gZGF0ZSApXHJcbiAgICAgICAgIHJldHVyblxyXG5cclxuICAgICBmb3IoIHZhciBjaHVuayBpbiBrZXlzICl7XHJcbiAgICAgICAgIHZhciBrID0ga2V5c1sgY2h1bmsgXVxyXG5cclxuXHJcbiAgICAgICAgIC8vIFRPRE8gZGV0ZWN0IHdoZW4gdGhlIHNoYXBlIGRvZXMgbm90IGNoYW5nZSwgZG9udCBhc2sgZm9yIHJlZHJhdyB0aGVuXHJcblxyXG5cclxuICAgICAgICAgaWYoIGRhdGUgPD0ga1sgMCBdLmRhdGUgKVxyXG4gICAgICAgICAgICAgZmNodW5rWyBjaHVuayBdLnVucGFjaygga1sgMCBdLnBhY2sgKVxyXG5cclxuICAgICAgICAgZWxzZSBpZiggZGF0ZSA+PSBrWyBrLmxlbmd0aC0xIF0uZGF0ZSApXHJcbiAgICAgICAgICAgICBmY2h1bmtbIGNodW5rIF0udW5wYWNrKCBrWyBrLmxlbmd0aC0xIF0ucGFjayApXHJcblxyXG4gICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICBmb3IoIHZhciBpPTE7IGk8ay5sZW5ndGggJiYga1tpXS5kYXRlPGRhdGU7IGkrKyApO1xyXG5cclxuICAgICAgICAgICAgIHZhciBhID0ga1tpLTFdLFxyXG4gICAgICAgICAgICAgICAgIGIgPSBrW2ldXHJcblxyXG4gICAgICAgICAgICAgdmFyIGFscGhhID0gKCBkYXRlIC0gYS5kYXRlICkvKCBiLmRhdGUgLSBhLmRhdGUgKVxyXG5cclxuICAgICAgICAgICAgIGZjaHVua1sgY2h1bmsgXS51bnBhY2soIGludGVycG9sYXRlLmxlcnBQYWNrKCBhLnBhY2ssIGIucGFjayAsIGFscGhhICkgKVxyXG4gICAgICAgICB9XHJcblxyXG4gICAgICAgICBlZC5kaXNwYXRjaCggJ2NoYW5nZTpwb2ludCcsIHtcclxuICAgICAgICAgICAgIHdpcDogZXZlbnQud2lwLFxyXG4gICAgICAgICAgICAgc2hhcGU6IGZjaHVua1sgY2h1bmsgXSxcclxuICAgICAgICAgICAgIGlzX2ludGVycG9sYXRpb246IHRydWVcclxuICAgICAgICAgfSlcclxuICAgICB9XHJcbiB9XHJcblxyXG5cclxuXHJcbiBtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0ICkuZXh0ZW5kKHtcclxuICAgICBpbml0OiBpbml0LFxyXG4gICAgIGVuYWJsZTogZW5hYmxlLFxyXG4gICAgIGRpc2FibGU6IGRpc2FibGUsXHJcbiB9KVxyXG4iLCJ2YXIgQWJzdHJhY3QgPSByZXF1aXJlKCcuLi91dGlscy9BYnN0cmFjdCcpXHJcbiAgLCBlZCA9IHJlcXVpcmUoJy4uL3N5c3RlbS9ldmVudERpc3BhdGNoZXInKVxyXG5cclxudmFyIGluaXQgPSBmdW5jdGlvbiggbW9kZWxCYWxsICl7XHJcblxyXG4gICAgdGhpcy5jaGFuZ2VQb2ludCA9IGNoYW5nZVBvaW50LmJpbmQoIHRoaXMgKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbnZhciBlbmFibGUgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5kaXNhYmxlKClcclxuICAgIGVkLmxpc3RlbiggJ2NoYW5nZTpwb2ludCcsIHRoaXMuY2hhbmdlUG9pbnQsIHRoaXMgKVxyXG59XHJcbnZhciBkaXNhYmxlID0gZnVuY3Rpb24oKXtcclxuICAgIGVkLnVubGlzdGVuKCAnY2hhbmdlOnBvaW50JywgdGhpcyApXHJcbn1cclxuXHJcbnZhciBjaGFuZ2VQb2ludCA9IGZ1bmN0aW9uKCBldmVudCApe1xyXG5cclxuICAgIGV2ZW50LnNoYXBlLnJlY29tcHV0ZSgpO1xyXG5cclxuICAgIGVkLmRpc3BhdGNoKCAnY2hhbmdlOnNoYXBlJywge1xyXG4gICAgICAgIHdpcDogZXZlbnQud2lwLFxyXG4gICAgICAgIGlzX2ludGVycG9sYXRpb246IGV2ZW50LmlzX2ludGVycG9sYXRpb24sXHJcbiAgICAgICAgc2hhcGU6IGV2ZW50LnNoYXBlXHJcbiAgICB9KVxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggQWJzdHJhY3QgKS5leHRlbmQoe1xyXG4gICAgaW5pdDogaW5pdCxcclxuICAgIGVuYWJsZTogZW5hYmxlLFxyXG4gICAgZGlzYWJsZTogZGlzYWJsZSxcclxufSlcclxuIiwidmFyIEFic3RyYWN0ID0gcmVxdWlyZSgnLi4vdXRpbHMvQWJzdHJhY3QnKVxyXG5cclxudmFyIGxpc3RlbmVyID0ge307XHJcblxyXG52YXIgZGlzcGF0Y2ggPSBmdW5jdGlvbiggZXZlbnROYW1lLCBkYXRhICl7XHJcblxyXG5cclxuXHJcbiAgICBpZih0cnVlKVxyXG4gICAgICAgIHN3aXRjaChldmVudE5hbWUpe1xyXG4gICAgICAgICAgICBjYXNlICd1aS1tb3VzZW1vdmUnOlxyXG4gICAgICAgICAgICBjYXNlICdyZW5kZXIzRC1jYW1lcmEtY2hhbmdlJzpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXZlbnROYW1lLCBkYXRhKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB0aGlzLl9sb2NrID0gdHJ1ZVxyXG5cclxuICAgIHZhciBsID0gbGlzdGVuZXJbIGV2ZW50TmFtZSBdIHx8IFtdXHJcbiAgICBmb3IoIHZhciBpID0gMDsgaTxsLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGxbaV0uZm4oZGF0YSwgZXZlbnROYW1lKVxyXG5cclxuICAgIHRoaXMuX2xvY2sgPSBmYWxzZVxyXG4gICAgd2hpbGUoICh0aGlzLl9zdGFja3x8W10pLmxlbmd0aCApe1xyXG4gICAgICAgIHZhciBvID0gdGhpcy5fc3RhY2suc2hpZnQoKVxyXG4gICAgICAgIHRoaXNbIG8uZm4gXS5hcHBseSggdGhpcywgby5hcmdzKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxudmFyIGxpc3RlbiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGZuICwga2V5ICl7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9sb2NrIClcclxuICAgICAgICByZXR1cm4gdm9pZCAoIHRoaXMuX3N0YWNrID0gdGhpcy5fc3RhY2sgfHwgW10gKS5wdXNoKHsgZm46J2xpc3RlbicsIGFyZ3M6IGFyZ3VtZW50cyB9KVxyXG5cclxuICAgIDsoIGxpc3RlbmVyWyBldmVudE5hbWUgXSA9IGxpc3RlbmVyWyBldmVudE5hbWUgXSB8fCBbXSApLnB1c2goe1xyXG4gICAgICAgIGZuOiBmbixcclxuICAgICAgICBrZXk6IGtleVxyXG4gICAgfSlcclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxudmFyIHVubGlzdGVuID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwga2V5ICl7XHJcblxyXG4gICAgaWYgKCB0aGlzLl9sb2NrIClcclxuICAgICAgICByZXR1cm4gdm9pZCAoIHRoaXMuX3N0YWNrID0gdGhpcy5fc3RhY2sgfHwgW10gKS5wdXNoKHsgZm46J3VubGlzdGVuJywgYXJnczogYXJndW1lbnRzIH0pXHJcblxyXG4gICAgdmFyIGwgPSAoIGxpc3RlbmVyWyBldmVudE5hbWUgXSA9IGxpc3RlbmVyWyBldmVudE5hbWUgXSB8fCBbXSApXHJcbiAgICBmb3IoIHZhciBpID0gbC5sZW5ndGg7IGktLTspXHJcbiAgICAgICAgaWYoIGxbaV0ua2V5ID09IGtleSApXHJcbiAgICAgICAgICAgIGwuc3BsaWNlKGksMSlcclxuICAgIHJldHVybiB0aGlzXHJcbn1cclxudmFyIGhhc0xpc3RlbmVyID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwga2V5ICl7XHJcbiAgICByZXR1cm4gISEoIGxpc3RlbmVyWyBldmVudE5hbWUgXSB8fCBbXSApLmxlbmd0aFxyXG59XHJcbnZhciByZXNldCA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGtleSApe1xyXG4gICAgbGlzdGVuZXIgPSB7fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIEFic3RyYWN0IClcclxuLmV4dGVuZCh7XHJcbiAgICBkaXNwYXRjaDogZGlzcGF0Y2gsXHJcbiAgICBsaXN0ZW46IGxpc3RlbixcclxuICAgIHVubGlzdGVuOiB1bmxpc3RlbixcclxuICAgIGhhc0xpc3RlbmVyOiBoYXNMaXN0ZW5lcixcclxuICAgIHJlc2V0OiByZXNldFxyXG59KVxyXG4iLCJ2YXIgdSA9IHJlcXVpcmUoJy4uL3V0aWxzL3BvaW50JylcclxuXHJcblxyXG4vLyBhICgxLWFscGhhKSArIGIgYWxwaGFcclxudmFyIGxlcnBQb2ludHMgPSBmdW5jdGlvbiggYXB0cywgYnB0cywgYWxwaGEgKXtcclxuXHJcbiAgICAvLyBlbnN1cmUgdGhhdCB0aGUgYXJyYXkgYXJlIHNhbWUgbGVuZ3RoZWRcclxuICAgIHdoaWxlKCBhcHRzLmxlbmd0aCA8IGJwdHMubGVuZ3RoIClcclxuICAgICAgICBhcHRzLnB1c2goIHUuY29weSggYnB0c1ticHRzLmxlbmd0aC0xXSApIClcclxuXHJcbiAgICB3aGlsZSggYnB0cy5sZW5ndGggPCBhcHRzLmxlbmd0aCApXHJcbiAgICAgICAgYnB0cy5wdXNoKCB1LmNvcHkoIGFwdHNbYXB0cy5sZW5ndGgtMV0gKSApXHJcblxyXG5cclxuICAgIHZhciByZXMgPSBbXVxyXG5cclxuICAgIGZvcih2YXIgaT0wOyBpPGFwdHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgcmVzLnB1c2goIHUubGVycCggYXB0c1tpXSwgYnB0c1tpXSwgYWxwaGEgKSApXHJcblxyXG4gICAgcmV0dXJuIHJlc1xyXG59XHJcblxyXG4vLyBhICgxLWFscGhhKSArIGIgYWxwaGFcclxudmFyIGxlcnBOdW1iZXIgPSBmdW5jdGlvbiggYXB0cywgYnB0cywgYWxwaGEgKXtcclxuXHJcbiAgICAvLyBlbnN1cmUgdGhhdCB0aGUgYXJyYXkgYXJlIHNhbWUgbGVuZ3RoZWRcclxuICAgIHdoaWxlKCBhcHRzLmxlbmd0aCA8IGJwdHMubGVuZ3RoIClcclxuICAgICAgICBhcHRzLnB1c2goIHUuY29weSggYnB0c1ticHRzLmxlbmd0aC0xXSApIClcclxuXHJcbiAgICB3aGlsZSggYnB0cy5sZW5ndGggPCBhcHRzLmxlbmd0aCApXHJcbiAgICAgICAgYnB0cy5wdXNoKCB1LmNvcHkoIGFwdHNbYXB0cy5sZW5ndGgtMV0gKSApXHJcblxyXG5cclxuICAgIHZhciByZXMgPSBbXVxyXG5cclxuICAgIHZhciBhYWxwaGEgPSAxLWFscGhhXHJcblxyXG4gICAgZm9yKHZhciBpPTA7IGk8YXB0cy5sZW5ndGg7IGkrKylcclxuICAgICAgICByZXMucHVzaCggYWFscGhhICogYXB0c1tpXSArIGFscGhhICogYnB0c1tpXSApXHJcblxyXG4gICAgcmV0dXJuIHJlc1xyXG59XHJcblxyXG4vLyBhICgxLWFscGhhKSArIGIgYWxwaGFcclxudmFyIGxlcnBQYWNrID0gZnVuY3Rpb24oIGFwYWNrLCBicGFjayAsIGFscGhhICl7XHJcbiAgICB2YXIgcmVzID0ge31cclxuXHJcbiAgICBmb3IoIHZhciBpIGluIGFwYWNrIClcclxuICAgICAgICBzd2l0Y2goIGkgKXtcclxuICAgICAgICAgICAgY2FzZSAnbGluZSc6XHJcbiAgICAgICAgICAgIGNhc2UgJ3ZlcnRleCc6XHJcbiAgICAgICAgICAgICAgICByZXNbIGkgXSA9IGxlcnBQb2ludHMoIGFwYWNrW2ldLCBicGFja1tpXSwgYWxwaGEgKVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ3dpZHRoJzpcclxuICAgICAgICAgICAgICAgIHJlc1sgaSBdID0gbGVycE51bWJlciggYXBhY2tbaV0sIGJwYWNrW2ldLCBhbHBoYSApXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgbGVycFBhY2s6IGxlcnBQYWNrXHJcbn1cclxuIiwidmFyIHUgPSByZXF1aXJlKCcuLi91dGlscy9wb2ludCcpXHJcblxyXG5cclxudmFyIHJlc29sdmVVbmNhcFNoYXJwbmVzcyA9IGZ1bmN0aW9uKCBzaGFycG5lc3MgKXtcclxuXHJcbiAgICB2YXIgX2EgPSBzaGFycG5lc3NbIDAgXSxcclxuICAgICAgICAgYSxcclxuICAgICAgICAgdFxyXG5cclxuICAgIGZvciggdmFyIGkgPSBzaGFycG5lc3MubGVuZ3RoOyBpLS07ICl7XHJcbiAgICAgICAgYSAgPSBfYVxyXG4gICAgICAgIF9hID0gc2hhcnBuZXNzWyBpIF1cclxuXHJcbiAgICAgICAgLy8gX2EgYVxyXG4gICAgICAgIC8vIC0xIDBcclxuXHJcbiAgICAgICAgaWYoIHQgPSAoIF9hLm5leHQgKyBhLmJlZm9yZSApID4gMSApe1xyXG4gICAgICAgICAgICBfYS5uZXh0IC89IHRcclxuICAgICAgICAgICAgYS5iZWZvcmUgLz0gdFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2hhcnBuZXNzXHJcbn1cclxudmFyIGJlemlmeSA9IGZ1bmN0aW9uKCBwdHMsIHNoYXJwbmVzcyApe1xyXG5cclxuICAgIHZhciBkZWZhdWx0X3NoYXJwbmVzc1xyXG5cclxuICAgIGlmKCBwdHMubGVuZ3RoPDIgKVxyXG4gICAgICAgIHJldHVybiBbXVxyXG5cclxuICAgIGlmKCAhc2hhcnBuZXNzIHx8IHR5cGVvZiBzaGFycG5lc3MgPT0gJ251bWJlcicgKVxyXG4gICAgICAgIGRlZmF1bHRfc2hhcnBuZXNzID0gc2hhcnBuZXNzIHx8IDAuMjVcclxuICAgIGVsc2VcclxuICAgICAgICByZXNvbHZlVW5jYXBTaGFycG5lc3MoIHNoYXJwbmVzcyApXHJcblxyXG5cclxuICAgIHZhciBfYSA9IHB0c1sgMCBdLFxyXG4gICAgICAgICBhID0gcHRzWyAxIF0sXHJcbiAgICAgICAgYV8sIGVfLCBfZSxcclxuICAgICAgICBzXywgX3NcclxuXHJcblxyXG4gICAgdmFyIGJlemllclBhdGggPSBbXVxyXG4gICAgZm9yKCB2YXIgaT1wdHMubGVuZ3RoOyBpLS07ICl7XHJcblxyXG4gICAgICAgIC8vIF9hIGEgYV8gaXMgYSB2ZXJ0ZXhcclxuICAgICAgICAvLyAtMSAwICsxXHJcbiAgICAgICAgYV8gPSAgYVxyXG4gICAgICAgIGEgID0gX2FcclxuICAgICAgICBfYSA9IHB0c1sgaSBdXHJcblxyXG4gICAgICAgIC8vIGNvbXB1dGUgZml4ZWQgcG9pbnQgKCBkZXBlbmRzIG9uIHNoYXJwbmVzcyApXHJcblxyXG4gICAgICAgIF9zID0gZGVmYXVsdF9zaGFycG5lc3MgfHwgc2hhcnBuZXNzWyBpIF0uYmVmb3JlXHJcbiAgICAgICAgc18gPSBkZWZhdWx0X3NoYXJwbmVzcyB8fCBzaGFycG5lc3NbIGkgXS5hZnRlclxyXG5cclxuICAgICAgICBlXyA9IHUubGVycCggYSwgX2EsIF9zIClcclxuICAgICAgICBfZSA9IHUubGVycCggYSwgYV8sIHNfIClcclxuXHJcbiAgICAgICAgZV8udHlwZSA9ICdGJ1xyXG4gICAgICAgIF9lLnR5cGUgPSAnRidcclxuXHJcbiAgICAgICAgYS50eXBlID0gJ0MnXHJcblxyXG4gICAgICAgIGJlemllclBhdGgucHVzaCggX2UsIGEsIGVfIClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYmV6aWVyUGF0aFxyXG59XHJcblxyXG52YXIgZXhwYW5kTXVzdGFjaCA9IGZ1bmN0aW9uKCBwdHMsIGhzICl7XHJcbiAgICByZXR1cm4gcHRzLnJlZHVjZSggZnVuY3Rpb24oIHAsIGEsIGkgKXtcclxuICAgICAgICBpZiggaT09MCB8fCBpPT1wdHMubGVuZ3RoLTEgKXtcclxuICAgICAgICAgICAgcC5wdXNoKCBhIClcclxuICAgICAgICAgICAgcmV0dXJuIHBcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGFfID0gdS5ub3JtYWxpemUoIHUuZGlmZiggcHRzW2ktMV0sIGEgKSApLFxyXG4gICAgICAgICAgICBfYSA9IHUubm9ybWFsaXplKCB1LmRpZmYoIGEsIHB0c1tpKzFdICkgKVxyXG5cclxuICAgICAgICB2YXIgbiA9IGFfXHJcblxyXG4gICAgICAgIG4ueCA9IF9hLnggKyBhXy54XHJcbiAgICAgICAgbi55ID0gX2EueSArIGFfLnlcclxuXHJcbiAgICAgICAgdS5ub3JtYWxpemUoIG4gKVxyXG5cclxuICAgICAgICB2YXIgdG1wID0gbi54XHJcbiAgICAgICAgbi54ID0gbi55XHJcbiAgICAgICAgbi55ID0gLXRtcFxyXG5cclxuICAgICAgICBwLnVuc2hpZnQoe1xyXG4gICAgICAgICAgICB4OiBhLnggKyBuLnggKiBoc1tpXSxcclxuICAgICAgICAgICAgeTogYS55ICsgbi55ICogaHNbaV1cclxuICAgICAgICB9KVxyXG4gICAgICAgIHAucHVzaCh7XHJcbiAgICAgICAgICAgIHg6IGEueCAtIG4ueCAqIGhzW2ldLFxyXG4gICAgICAgICAgICB5OiBhLnkgLSBuLnkgKiBoc1tpXVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHJldHVybiBwXHJcbiAgICB9LCBbXSlcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgZXhwYW5kTXVzdGFjaDogZXhwYW5kTXVzdGFjaCxcclxuICAgIGJlemlmeTogYmV6aWZ5XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBpbml0OmZ1bmN0aW9uKCl7IHJldHVybiB0aGlzfSxcclxuICAgIGV4dGVuZDpmdW5jdGlvbihvKXtcclxuICAgICAgICBmb3IodmFyIGkgaW4gbyApe1xyXG4gICAgICAgICAgICB0aGlzW2ldID0gb1tpXVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgaGFzQ2xhc3MgOiBmdW5jdGlvbiggZWwgLCBjICl7XHJcblx0XHRyZXR1cm4gZWwuY2xhc3NMaXN0LmNvbnRhaW5zKGMpXHJcblx0fSxcclxuXHRhZGRDbGFzcyA6IGZ1bmN0aW9uKCBlbCAsIGMgKXtcclxuXHRcdGVsLmNsYXNzTmFtZSArPSAnICcrY1xyXG5cdH0sXHJcblx0cmVtb3ZlQ2xhc3MgOiBmdW5jdGlvbiggZWwgLCBjICl7XHJcblx0XHR2YXIgbmM9XCJcIlxyXG5cdFx0Zm9yKHZhciBpPWVsLmNsYXNzTGlzdC5sZW5ndGg7aS0tOyApXHJcblx0XHRcdGlmKCBjICE9IGVsLmNsYXNzTGlzdFtpXSApXHJcblx0XHRcdFx0bmMgKz0gJyAnK2VsLmNsYXNzTGlzdFtpXVxyXG5cdFx0ZWwuY2xhc3NOYW1lID0gbmNcclxuXHR9LFxyXG5cdGdldFBhcmVudCA6IGZ1bmN0aW9uKCBlbCAsIGMgKXtcclxuXHRcdHdoaWxlKHRydWUpXHJcblx0XHRcdGlmKCBlbCAmJiAhdGhpcy5oYXNDbGFzcyggZWwgLCBjICkgKVxyXG5cdFx0XHRcdGVsID0gZWwucGFyZW50RWxlbWVudFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRyZXR1cm4gZWxcclxuXHR9LFxyXG4gICAgb2Zmc2V0IDogZnVuY3Rpb24oIGVsICl7XHJcbiAgICAgICAgLy8gVE9ETyBjb25zaWRlciBzY3JvbGxcclxuICAgICAgICB2YXIgbyA9IHtcclxuICAgICAgICAgICAgbGVmdDowLFxyXG4gICAgICAgICAgICB0b3A6MFxyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSggZWwgJiYgZWwub2Zmc2V0TGVmdCAhPT0gbnVsbCl7XHJcbiAgICAgICAgICAgIG8ubGVmdCArPSBlbC5vZmZzZXRMZWZ0XHJcbiAgICAgICAgICAgIG8udG9wICs9IGVsLm9mZnNldFRvcFxyXG5cclxuICAgICAgICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvXHJcbiAgICB9LFxyXG5cdGJpbmQgOiBmdW5jdGlvbiggZWwgLCBldmVudE5hbWUgLCBmbiApe1xyXG5cclxuXHRcdHZhciBsID0gZXZlbnROYW1lLnNwbGl0KCcgJylcclxuXHRcdGlmKCBsLmxlbmd0aD4xICl7XHJcblx0XHRcdGZvcih2YXIgaT1sLmxlbmd0aDtpLS07KVxyXG5cdFx0XHRcdHRoaXMuYmluZCggZWwgLCBsW2ldICwgZm4gKVxyXG5cdFx0XHRyZXR1cm5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0ZWwuX2JpbmRIYW5kbGVycyA9IGVsLl9iaW5kSGFuZGxlcnMgfHwge31cclxuXHJcblx0XHR0aGlzLnVuYmluZCggZWwgLCBldmVudE5hbWUgKVxyXG5cclxuXHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZS5zcGxpdCgnLicpWzBdICwgZm4gLCBmYWxzZSApXHJcblx0XHRlbC5fYmluZEhhbmRsZXJzWyBldmVudE5hbWUgXSA9IGZuXHJcblx0fSxcclxuXHR1bmJpbmQgOiBmdW5jdGlvbiggZWwgLCBldmVudE5hbWUgKXtcclxuXHJcblx0XHR2YXIgbCA9IGV2ZW50TmFtZS5zcGxpdCgnICcpXHJcblx0XHRpZiggbC5sZW5ndGg+MSApe1xyXG5cdFx0XHRmb3IodmFyIGk9bC5sZW5ndGg7aS0tOylcclxuXHRcdFx0XHR0aGlzLnVuYmluZCggZWwgLCBsW2ldIClcclxuXHRcdFx0cmV0dXJuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYoICFlbC5fYmluZEhhbmRsZXJzIHx8ICFlbC5fYmluZEhhbmRsZXJzWyBldmVudE5hbWUgXSApXHJcblx0XHRcdHJldHVyblxyXG5cclxuXHRcdGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZS5zcGxpdCgnLicpWzBdICwgZWwuX2JpbmRIYW5kbGVyc1sgZXZlbnROYW1lIF0gLCBmYWxzZSApXHJcblx0XHRlbC5fYmluZEhhbmRsZXJzWyBldmVudE5hbWUgXSA9IG51bGxcclxuXHR9LFxyXG4gICAgZG9taWZ5IDogKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYoIHR5cGVvZiBkb2N1bWVudCAhPSAnb2JqZWN0JyApXHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpe31cclxuICAgICAgICB2YXIgdGFuayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCB0cGwgKXtcclxuICAgICAgICAgICAgdGFuay5pbm5lckhUTUwgPSB0cGxcclxuICAgICAgICAgICAgdmFyIGRvbUVsID0gdGFuay5jaGlsZHJlblsgMCBdXHJcbiAgICAgICAgICAgIHRhbmsuaW5uZXJIVE1MID0gJydcclxuICAgICAgICAgICAgcmV0dXJuIGRvbUVsXHJcbiAgICAgICAgfVxyXG4gICAgfSkoKVxyXG59XHJcbiIsIjsoZnVuY3Rpb24oKXtcclxuXHJcbnZhciBzdGFydFRpbWUsXHJcbiAgICBzdGFydEVsZW1lbnQsXHJcbiAgICBzdGFydFBvcyA9IHt9LFxyXG4gICAgcGhhc2UgPSAwXHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgIGlmICggcGhhc2UgPT0gMCB8fCBldmVudC50aW1lU3RhbXAgLSBzdGFydFRpbWUgPiA0MDAgKXtcclxuXHJcbiAgICAgICAgc3RhcnRUaW1lID0gZXZlbnQudGltZVN0YW1wXHJcbiAgICAgICAgc3RhcnRFbGVtZW50ID0gZXZlbnQudGFyZ2V0XHJcbiAgICAgICAgc3RhcnRQb3MueCA9IGV2ZW50LnBhZ2VYXHJcbiAgICAgICAgc3RhcnRQb3MueSA9IGV2ZW50LnBhZ2VZXHJcbiAgICAgICAgcGhhc2U9MVxyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGhhc2UrK1xyXG4gICAgfVxyXG59KVxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsZnVuY3Rpb24oZXZlbnQpe1xyXG5cclxuICAgIGlmKCBzdGFydEVsZW1lbnQhPWV2ZW50LnRhcmdldFxyXG4gICAgICAgIHx8IGV2ZW50LnRpbWVTdGFtcCAtIHN0YXJ0VGltZSA+IDQwMFxyXG4gICAgICAgIHx8IE1hdGguYWJzKHN0YXJ0UG9zLnggLSBldmVudC5wYWdlWCkgPiAyNVxyXG4gICAgICAgIHx8IE1hdGguYWJzKHN0YXJ0UG9zLnkgLSBldmVudC5wYWdlWSkgPiAyNVxyXG4gICAgKVxyXG4gICAgICAgIHJldHVybiB2b2lkICggcGhhc2UgPSAwIClcclxuXHJcbiAgICBpZiggcGhhc2UgPj0gMiApe1xyXG4gICAgICAgIHZhciBjbGlja2V2ZW50ID0gbmV3IE1vdXNlRXZlbnQoJ2RvdWJsZWNsaWNrJyxldmVudCk7XHJcblxyXG4gICAgICAgIGV2ZW50LnRhcmdldC5kaXNwYXRjaEV2ZW50KGNsaWNrZXZlbnQpO1xyXG5cclxuICAgICAgICBwaGFzZSA9IDA7XHJcbiAgICB9XHJcbn0pXHJcblxyXG59KSgpXHJcbiIsInZhciB1ID0ge31cclxuXHJcbnUuc2NhbGFpcmUgPSBmdW5jdGlvbiggYSwgYiApe1xyXG4gICAgcmV0dXJuIGEueCpiLnggKyBhLnkqYi55XHJcbn1cclxudS5ub3JtZSA9IGZ1bmN0aW9uKCBhICl7XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCB1LnNjYWxhaXJlKCBhLCBhICkgKVxyXG59XHJcbnUubm9ybWFsaXplID0gZnVuY3Rpb24oIGEgKXtcclxuICAgIHZhciBuID0gdS5ub3JtZSggYSApXHJcbiAgICBhLnggLz0gblxyXG4gICAgYS55IC89IG5cclxuICAgIHJldHVybiBhXHJcbn1cclxudS5kaWZmID0gZnVuY3Rpb24oIGEsIGIgKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogYS54IC0gYi54LFxyXG4gICAgICAgIHk6IGEueSAtIGIueVxyXG4gICAgfVxyXG59XHJcbnUubGVycCA9IGZ1bmN0aW9uKCBhLCBiLCBhbHBoYSApe1xyXG4gICAgdmFyIGFhbHBoYSA9IDEtYWxwaGFcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogYS54KmFhbHBoYSArIGIueCphbHBoYSxcclxuICAgICAgICB5OiBhLnkqYWFscGhhICsgYi55KmFscGhhXHJcbiAgICB9XHJcbn1cclxudS5jb3B5ID0gZnVuY3Rpb24oIGEgKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogYS54LFxyXG4gICAgICAgIHk6IGEueVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHVcclxuIl19
