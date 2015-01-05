var faceRenderer = Object.create( require('./renderer/svg/face') )
  , pointControlRenderer = Object.create( require('./renderer/svg/pointControl') )
  , basicEvent = Object.create( require('./renderer/svg/basicEvent') )

  , face = Object.create( require('./model/Face') )
  , camera = Object.create( require('./model/Camera') )

  , dragPointCtrl = Object.create( require('./controller/dragPoint') )

  , ed = require('./system/eventDispatcher')

// init model
face.init()
camera.init()

// init system
var modelBall = {
    face: face,
    camera: camera,
}

// init renderer
var width=window.innerWidth,
    height=window.innerHeight

var domSvg = document.querySelector('svg')
domSvg.setAttribute('width', width)
domSvg.setAttribute('height', height)
faceRenderer.init( modelBall, domSvg )
pointControlRenderer.init( modelBall, domSvg )
basicEvent.init( modelBall, domSvg )

// controller
dragPointCtrl.init( modelBall ).enable()


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
