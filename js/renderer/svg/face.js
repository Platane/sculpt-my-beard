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