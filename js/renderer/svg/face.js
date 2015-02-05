var Abstract = require('../../utils/Abstract')
  , dom = require('../../utils/domHelper')
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

    renderStyle.call( this )
}
var renderStyle = function( ){

    var face = this.model.face

    var stroke = this.model.toolkit.options.view.stroke
    var color = this.model.toolkit.options.view.color

    for( var i in face.chunk ) {

        dom[ stroke ? 'addClass' : 'removeClass' ]( this.dom[ i ], 'stroke' )
        dom[ color ? 'addClass' : 'removeClass' ]( this.dom[ i ], 'color' )
    }
}

var build = function( domSvg ){
    var face = this.model.face

    this.dom = {}

    var k=1
    for( var i in face.chunk ){
        this.dom[ i ] = svg.create('path')
        this.dom[ i ].setAttribute('class', 'hair-chunk '+i+' hair-chunk-'+(k++))
        domSvg.appendChild( this.dom[ i ] )
    }
}

var init = function( modelBall, ed, domSvg ){

    this.model = {
        face: modelBall.face,
        camera: modelBall.camera,
        toolkit: modelBall.toolkit,
    }

    build.call( this, domSvg )

    this.ed = ed

    ed.listen( 'render' , render.bind( this ) , this )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
    render: render
})
