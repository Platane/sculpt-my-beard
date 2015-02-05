var faceRenderer = Object.create( require('./renderer/svg/face') )
  , pointControlRenderer = Object.create( require('./renderer/svg/pointControl') )
  , zoneEventRenderer = Object.create( require('./renderer/svg/zoneEvent') )
  , basicEvent = Object.create( require('./renderer/basicEvent') )
  , timeLineRenderer = Object.create( require('./renderer/timeLine/timeLine') )
  , timeLineMapRenderer = Object.create( require('./renderer/timeLine/map') )
  , toolkitRenderer = Object.create( require('./renderer/toolbar/toolkit') )


  , ed = require('./system/eventDispatcher')


  require('./layout')
  require('./utils/doubleClick')
  require('./utils/shortClick')


// init model
var modelBall = {
    face :          require('./model/data/face'),
    camera :        require('./model/app-state/camera'),
    timeLineState : require('./model/app-state/timeLineState'),
    timeLine :      require('./model/data/timeLine'),
    toolkit :       require('./model/app-state/toolkit'),
    history :       require('./model/history')
}
for( var i in modelBall )
    modelBall[ i ] = Object.create( modelBall[ i ] ).init( )


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
var ctrlBall = {

    // react to user input
    dragPoint :                 require('./controller/drawZone/dragPoint'),
    drawZoneTranslate :         require('./controller/drawZone/translate'),
    drawZoneZoom :              require('./controller/drawZone/zoom'),
    timeLineMoveKey :           require('./controller/timeLine/key'),
    timeLineCursorDrag :        require('./controller/timeLine/cursor-drag'),
    timeLineCursorClick :       require('./controller/timeLine/cursor-click'),
    timeLineTranslate :         require('./controller/timeLine/viewport-translate'),
    toolbar :                   require('./controller/toolbar/toolkit'),
    ctrlZ :                     require('./controller/ctrlZ'),

    // react to alteration event
    applyTimeLine:              require('./staticController/applyTimeLine') ,
    recompute:                  require('./staticController/recompute') ,
}
for( var i in ctrlBall ){
    ctrlBall[ i ] = Object.create( ctrlBall[ i ] ).init( modelBall, ed, ctrlBall )
    ctrlBall[ i ].enable()
}



// bootstrap
var face = modelBall.face
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
ed.dispatch( 'change:shape', {shape:face.chunk.mustach_right} )
ed.dispatch( 'change:shape', {shape:face.chunk.mustach_left} )
