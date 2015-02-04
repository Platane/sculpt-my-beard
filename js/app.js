var faceRenderer = Object.create( require('./renderer/svg/face') )
  , pointControlRenderer = Object.create( require('./renderer/svg/pointControl') )
  , zoneEventRenderer = Object.create( require('./renderer/svg/zoneEvent') )
  , basicEvent = Object.create( require('./renderer/basicEvent') )
  , timeLineRenderer = Object.create( require('./renderer/timeLine/timeLine') )
  , timeLineMapRenderer = Object.create( require('./renderer/timeLine/map') )
  , toolkitRenderer = Object.create( require('./renderer/toolbar/toolkit') )


  , face = Object.create( require('./model/data/Face') )
  , timeLine = Object.create( require('./model/data/TimeLine') )

  , camera = Object.create( require('./model/app-state/Camera') )
  , timeLineState = Object.create( require('./model/app-state/TimeLineState') )
  , toolkitState = Object.create( require('./model/app-state/Toolkit') )

  , history = Object.create( require('./model/history') )


  , dragPointCtrl = Object.create( require('./controller/drawZone/dragPoint') )
  , cameraCtrl = Object.create( require('./controller/drawZone/camera') )
  , timeLineKeyPointCtrl = Object.create( require('./controller/timeLine/key') )
  , timeLineCursorDragCtrl = Object.create( require('./controller/timeLine/cursor-drag') )
  , timeLineCursorClickCtrl = Object.create( require('./controller/timeLine/cursor-click') )
  , viewportTrCtrl = Object.create( require('./controller/timeLine/viewport-translate') )
  , toolkitCtrl = Object.create( require('./controller/toolbar/toolkit') )
  , ctrlZ = Object.create( require('./controller/ctrlZ') )

  , staticApplyCtrl = Object.create( require('./staticController/applyTimeLine') )
  , staticRecomputeCtrl = Object.create( require('./staticController/recompute') )


  , ed = require('./system/eventDispatcher')


  require('./layout')
  require('./utils/doubleClick')
  require('./utils/shortClick')

// init model
face.init()
timeLine.init()
camera.init()
timeLineState.init()
toolkitState.init()
history.init()

// init system
var modelBall = {
    face: face,
    camera: camera,
    timeLineState: timeLineState,
    timeLine: timeLine,
    toolkit: toolkitState,
    history: history
}
window.modelBall = modelBall

// init renderer
var domSvg = document.querySelector('.app-draw-zone')
faceRenderer.init( modelBall, ed, domSvg )
pointControlRenderer.init( modelBall, ed, domSvg )
zoneEventRenderer.init( modelBall, ed, domSvg )

basicEvent.init( modelBall ,ed )

timeLineRenderer.init( modelBall, ed , document.querySelector('.app-timeLine') )
timeLineMapRenderer.init( modelBall, ed , document.querySelector('.app-timeLineMap') )

toolkitRenderer.init( modelBall, ed , document.querySelector('.app-vertical-toolbar') )

// controller
dragPointCtrl.init( modelBall, ed ).enable()
cameraCtrl.init( modelBall, ed ).enable()
timeLineKeyPointCtrl.init( modelBall, ed ).enable()
ctrlZ.init( modelBall, ed ).enable()
timeLineCursorDragCtrl.init( modelBall, ed ).enable()
timeLineCursorClickCtrl.init( modelBall, ed ).enable()
viewportTrCtrl.init( modelBall, ed ).enable()
toolkitCtrl.init( modelBall, ed ).enable()


staticApplyCtrl.init( modelBall, ed ).enable()
staticRecomputeCtrl.init( modelBall, ed ).enable()



// bootstrap
face.chunk.mustach_left.line = [
    {x: 99, y: 25},
    {x: 130, y: 36.5},
    {x: 189.75, y: 36.7},
    {x: 201.5, y: 84}
]
face.chunk.mustach_left.width = [
    10,
    12,
    15,
    6
]

face.chunk.mustach_right.line = [
    {x: 200-99, y: 25},
    {x: 200-130, y: 36.5},
    {x: 200-189.75, y: 36.7},
    {x: 200-201.5, y: 84}
]
face.chunk.mustach_right.width = [
    10,
    12,
    15,
    6
]



face.chunk.mustach_left.recompute()
face.chunk.mustach_right.recompute()



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
ed.listen( 'change:camera', pl_render )


var pl_historize = function( event ){
    if( !event.wip && !event.no_history )
        history.save( timeLine )
}
history.save( timeLine )
ed.listen( 'change:shape', pl_historize )
ed.listen( 'change:timeLine', pl_historize )
