var Abstract = require('../../utils/Abstract')
  , u = require('../../utils/point')
  , pj = require('../../system/pathJob')
  , svg = require('./svg-util')

var arc = function( p, n, r ){
    var t = svg.create('circle')
    t.setAttribute( 'cx', p.x )
    t.setAttribute( 'cy', p.y )
    t.setAttribute( 'r', r )
    return t

    var t = svg.create('path')
    var nx = n.x*r
    var ny = n.y*r
    var path = 'M'+(p.x+n.y)+' '+(p.y-n.x)+'A'+(p.x+n.x+n.y)+' '+(p.y+n.y-n.x)+' 0 0,1 '+(p.x+n.x)+' '+(p.y+n.y)
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

        shape.vertex.map( proj ).forEach(function( p, a ){

            var a_ = (a+1)%shape.vertex.length
            var _a = (a-1+shape.vertex.length)%shape.vertex.length

            var ac = arc( p, {x:1, y:1}, 6*zoom )
            ac.setAttribute( 'class', 'control-sharpness-tic' )
            ac.setAttribute( 'data-i', a )
            ac.setAttribute( 'data-chunk', i )
            ac.setAttribute( 'data-sens', 'before' )
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
