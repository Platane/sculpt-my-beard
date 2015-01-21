var faceRenderer = Object.create( require('./renderer/svg/face') )
  , pointControlRenderer = Object.create( require('./renderer/svg/pointControl') )
  , zoneEventRenderer = Object.create( require('./renderer/svg/zoneEvent') )
  , basicEvent = Object.create( require('./renderer/basicEvent') )
  , timeLineRenderer = Object.create( require('./renderer/timeLine/timeLine') )


  , face = Object.create( require('./model/data/Face') )
  , timeLine = Object.create( require('./model/data/TimeLine') )

  , camera = Object.create( require('./model/app-state/Camera') )
  , timeLineState = Object.create( require('./model/app-state/TimeLineState') )

  , history = Object.create( require('./model/history') )


  , dragPointCtrl = Object.create( require('./controller/drawZone/dragPoint') )
  , cameraCtrl = Object.create( require('./controller/drawZone/camera') )
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
zoneEventRenderer.init( modelBall, domSvg )

basicEvent.init( modelBall )

timeLineRenderer.init( modelBall, document.querySelector('.app-timeLine') )

// controller
dragPointCtrl.init( modelBall ).enable()
cameraCtrl.init( modelBall ).enable()
timeLineKeyPointCtrl.init( modelBall ).enable()
ctrlZ.init( modelBall ).enable()
timeLineCursorCtrl.init( modelBall ).enable()


staticApplyCtrl.init( modelBall ).enable()
staticRecomputeCtrl.init( modelBall ).enable()



// bootstrap
face.chunk.mustach_left.line = [
    {x: 50, y: 20},
    {x: 50, y: 30},
    {x: 70, y: 20}
]
face.chunk.mustach_left.width = [
    40,
    20,
    35
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
ed.listen( 'change:camera', pl_render )


var pl_historize = function( event ){
    if( !event.wip && !event.no_history )
        history.save( timeLine )
}
history.save( timeLine )
ed.listen( 'change:shape', pl_historize )
ed.listen( 'change:timeLine', pl_historize )
