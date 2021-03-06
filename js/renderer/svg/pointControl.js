var Abstract = require('../../utils/Abstract')
  , svg = require('./svg-util')

var tic = function( x, y ){
    var t = svg.create('circle')
    t.setAttribute( 'cx', x )
    t.setAttribute( 'cy', y )
    t.setAttribute( 'r', 5 )
    t.setAttribute( 'class', 'control-tic' )
    return t
}

var render = function( ){
    var face = this.model.face
    var proj = this.model.camera.project
    var displayCtrl = this.model.toolkit.options.tool.movePoint || this.model.toolkit.options.tool.addPoint

    for( var i in face.chunk ){

        var container = this.dom[ i ]
        var shape = face.chunk[ i ]

        container.innerHTML = ''

        var pts, c, d

        if( shape.line ){
            // is a line
            pts = shape.line
            c = 'control-line'
            d = 'line'
        } else {
            // is a path
            pts = shape.vertex
            c = 'control-path'
            d = 'vertex'
        }

        if ( !displayCtrl )
            continue

        pts.map( proj ).forEach(function( p, index ){
            var t = tic( p.x, p.y )
            t.setAttribute( 'class', 'control-tic '+c )
            t.setAttribute( 'data-i', index )
            t.setAttribute( 'data-chunk', i )
            t.setAttribute( 'data-pool', d )
            container.appendChild( t )
        })
    }
}

var build = function( domSvg ){
    var face = this.model.face

    this.dom = {}

    var k=1
    for( var i in face.chunk ){
        this.dom[ i ] = svg.create('g')
        this.dom[ i ].setAttribute( 'class', 'control control-'+i+' control-'+(k++) )
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
