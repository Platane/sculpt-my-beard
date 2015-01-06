var faceRenderer = Object.create( require('./renderer/svg/face') )
  , pointControlRenderer = Object.create( require('./renderer/svg/pointControl') )
  , basicEvent = Object.create( require('./renderer/basicEvent') )
  , timeLineRenderer = Object.create( require('./renderer/timeline') )


  , face = Object.create( require('./model/Face') )
  , timeLine = Object.create( require('./model/timeLine') )

  , camera = Object.create( require('./model/app-state/Camera') )
  , timeLineState = Object.create( require('./model/app-state/timeLineState') )


  , dragPointCtrl = Object.create( require('./controller/dragPoint') )
  , timeLineKeyPointCtrl = Object.create( require('./controller/timeLine/key') )


  , ed = require('./system/eventDispatcher')

  require('./utils/doubleClick')

// init model
face.init()
camera.init()
timeLineState.init()
timeLine.init()

// init system
var modelBall = {
    face: face,
    camera: camera,
    timeLineState: timeLineState,
    timeLine: timeLine,
}

// init renderer
var domSvg = document.querySelector('svg')
faceRenderer.init( modelBall, domSvg )
pointControlRenderer.init( modelBall, domSvg )

basicEvent.init( modelBall )

timeLineRenderer.init( modelBall, document.body )

// controller
dragPointCtrl.init( modelBall ).enable()
timeLineKeyPointCtrl.init( modelBall ).enable()


// start render loop



function render(){

    //ed.dispatch('pre-render')
    ed.dispatch('render')
    //ed.dispatch('post-render')

}

// TODO throttle this
ed.listen( 'please-render' , render.bind( this ) , this )


// bootstrap
face.chunk.mustach_left.line = [
    {x: 50, y: 100},
    {x: 150, y: 130},
    {x: 270, y: 200},
    {x: 400, y: 120},
    {x: 500, y: 120},
    {x: 600, y: 160},
]
face.chunk.mustach_left.width = [
    40,
    20,
    35,
    61,
    25,
]
face.chunk.mustach_left.recompute()

render()




//

var pl_render = function(){
    ed.dispatch( 'please-render' )
}
ed.listen( 'change:shape', pl_render )
ed.listen( 'change:camera:zoom', pl_render )
ed.listen( 'change:camera:origin', pl_render )
