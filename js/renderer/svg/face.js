var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')
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
        //dom.removeClass( this.dom[ i ], 'color-filled' )
        //dom.removeClass( this.dom[ i ], 'color-stroked' )

        //dom.addClass( this.dom[ i ], 'color-filled' )
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
        dom.addClass( this.dom[ i ], 'color-filled' )
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
