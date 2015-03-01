var ed = require('./system/eventDispatcher')


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
    history :       require('./model/history'),
    playerInfo :    require('./model/app-state/playerInfo')
}
for( var i in modelBall )
    modelBall[ i ] = Object.create( modelBall[ i ] ).init( )


// init renderer
var domDrawZone = document.querySelector('.app-draw-zone')
var domTimeLine = document.querySelector('.app-timeLine')
var domTimeLineMap = document.querySelector('.app-timeLineMap')
var domToolbar = document.querySelector('.app-vertical-toolbar')

var renderBall = {
    face :                  require('./renderer/svg/face'),
    pointControl :          require('./renderer/svg/pointControl'),
    widthControl :          require('./renderer/svg/widthControl'),
    sharpnessControl :      require('./renderer/svg/sharpnessControl'),
    zoneEvent :             require('./renderer/svg/zoneEvent'),

    basicEvent :            require('./renderer/basicEvent'),

    timeLine :              require('./renderer/timeLine/timeLine'),
    timeLineMap :           require('./renderer/timeLine/map'),

    toolkit :               require('./renderer/toolbar/toolkit'),
}
renderBall.face.init( modelBall, ed, domDrawZone )
renderBall.sharpnessControl.init( modelBall, ed, domDrawZone )
renderBall.widthControl.init( modelBall, ed, domDrawZone )
renderBall.pointControl.init( modelBall, ed, domDrawZone )
renderBall.zoneEvent.init( modelBall, ed, domDrawZone )
renderBall.basicEvent.init( modelBall, ed )
renderBall.timeLine.init( modelBall, ed, domTimeLine )
renderBall.timeLineMap.init( modelBall, ed, domTimeLineMap )
renderBall.toolkit.init( modelBall, ed, domToolbar )



// controller
var ctrlBall = {

    // react to user input
    dragPoint :                 require('./controller/drawZone/dragPoint'),
    addPoint :                  require('./controller/drawZone/addPoint'),
    dragWidth :                 require('./controller/drawZone/dragWidth'),
    dragSharpness :             require('./controller/drawZone/dragSharpness'),
    drawZoneTranslate :         require('./controller/drawZone/translate'),
    drawZoneZoom :              require('./controller/drawZone/zoom'),
    timeLineMoveKey :           require('./controller/timeLine/key'),
    timeLineCursorDrag :        require('./controller/timeLine/cursor-drag'),
    timeLineCursorClick :       require('./controller/timeLine/cursor-click'),
    timeLineTranslate :         require('./controller/timeLine/viewport-translate'),
    spaceToPlay :               require('./controller/timeLine/spaceToPlay'),
    toolbar :                   require('./controller/toolbar/toolkit'),
    ctrlZ :                     require('./controller/ctrlZ'),

    // react to alteration event
    applyTimeLine:              require('./staticController/applyTimeLine'),
    recompute:                  require('./staticController/recompute'),
    optionnalCtrl:              require('./staticController/optionnalCtrl'),
    executePlayer:              require('./staticController/executePlayer'),
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
face.chunk.mustach_left.sharpness = [
    {before: 0.15, after: 0.15},
    {before: 0.15, after: 0.15},
    {before: 0.15, after: 0.15},
    {before: 0.15, after: 0.15},
    {before: 0.15, after: 0.15},
    {before: 0.15, after: 0.15},
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
ed.listen( 'change:toolkit', pl_render ) // TODO only catch relevant stuff



ed.dispatch( 'change:shape', {shape:face.chunk.mustach_left} )
ed.dispatch( 'change:toolkit' )
