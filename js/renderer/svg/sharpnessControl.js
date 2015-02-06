var Abstract = require('../../utils/Abstract')
  , u = require('../../utils/point')
  , pj = require('../../system/pathJob')
  , svg = require('./svg-util')

var arc = function( p, n, r ){

    var aperture = 60 / 180*Math.PI

    var r2 = Math.min( r*0.5, 10 )

    var nx = n.x*r
    var ny = n.y*r

    var n2x = n.x*r2
    var n2y = n.y*r2

    var cos = Math.cos( aperture )
    var sin = Math.sin( aperture )

    var t = svg.create('path')
    var path = 'M'+p.x+' '+p.y
              +'L'+(p.x + ny * sin + nx * cos)+' '+(p.y - nx * sin + ny * cos)
              +'A'+r+' '+r+', 0, 0, 1,'+(p.x+nx)+' '+(p.y+ny)
              +'A'+r+' '+r+', 0, 0, 1,'+(p.x - ny * sin + nx * cos)+' '+(p.y + nx * sin + ny * cos)
              +'z'

    var path = 'M'+(p.x + ny * sin + nx * cos)+' '+(p.y - nx * sin + ny * cos)
              +'A'+r+' '+r+', 0, 0, 1,'+(p.x+nx)+' '+(p.y+ny)
              +'A'+r+' '+r+', 0, 0, 1,'+(p.x - ny * sin + nx * cos)+' '+(p.y + nx * sin + ny * cos)
              +'L'+(p.x - n2y * sin + n2x * cos)+' '+(p.y + n2x * sin + n2y * cos)
              +'A'+r2+' '+r2+', 0, 0, 0,'+(p.x+n2x)+' '+(p.y+n2y)
              +'A'+r2+' '+r2+', 0, 0, 0,'+(p.x + n2y * sin + n2x * cos)+' '+(p.y - n2x * sin + n2y * cos)
              +'z'
    t.setAttribute( 'd', path )
    return t
}

var empty = function(){
    for( var i in this.dom )
        this.dom[ i ].innerHTML = ''
}

var render = function( ){

    // render only if the tool is active
    var shouldBeEmpty = !this.model.toolkit.options.tool.alterSharpness
    if ( shouldBeEmpty ){
        if ( !this._isEmpty ){
            empty.call( this )
            this._isEmpty = true
        }
        return
    } else {
        this._isEmpty = false
    }

    var face = this.model.face
    var zoom = this.model.camera._zoom
    var proj = this.model.camera.project

    // clean up
    empty.call( this )

    for( var i in face.chunk ){

        var container = this.dom[ i ]
        var shape = face.chunk[ i ]

        var vertex

        ( vertex = shape.vertex.map( proj ) ).forEach(function( p, a ){

            var a_ = (a+1)%shape.vertex.length
            var _a = (a-1+shape.vertex.length)%shape.vertex.length

            var _n = u.normalize( u.diff( vertex[ _a ] , p ))
            var n_ = u.normalize( u.diff( vertex[ a_ ] , p ))

            var _r = 15 + shape.sharpness[ a ].before * 60
            var r_ = 15 + shape.sharpness[ a ].after * 60

            var ac = arc( p, _n, _r )
            ac.setAttribute( 'class', 'control-sharpness-tic' )
            ac.setAttribute( 'data-i', a )
            ac.setAttribute( 'data-chunk', i )
            ac.setAttribute( 'data-sens', 'before' )
            container.appendChild( ac )

            var ac = arc( p, n_, r_ )
            ac.setAttribute( 'class', 'control-sharpness-tic' )
            ac.setAttribute( 'data-i', a )
            ac.setAttribute( 'data-chunk', i )
            ac.setAttribute( 'data-sens', 'after' )
            container.appendChild( ac )

        })
    }
}

var build = function( domSvg ){
    var face = this.model.face

    this.dom = {}

    var k=1
    for ( var i in face.chunk ){
        this.dom[ i ] = svg.create('g')
        this.dom[ i ].setAttribute( 'class', 'control-sharpness control-sharpness-'+i+' control-sharpness-'+(k++) )
        this.dom[ i ].setAttribute( 'data-chunk', i )
        domSvg.appendChild( this.dom[ i ] )
    }
}

var init = function( modelBall, ed, domSvg ){

    this.model = {
        face: modelBall.face,
        camera: modelBall.camera,
        toolkit: modelBall.toolkit,
    }

    this.ed = ed

    build.call( this, domSvg )

    this.ed.listen( 'render' , render.bind( this ) , this )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
    render: render
})
