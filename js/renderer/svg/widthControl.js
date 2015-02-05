var Abstract = require('../../utils/Abstract')
  , u = require('../../utils/point')
  , pj = require('../../system/pathJob')
  , svg = require('./svg-util')

var tic = function( x, y ){
    var t = svg.create('circle')
    t.setAttribute( 'cx', x )
    t.setAttribute( 'cy', y )
    t.setAttribute( 'r', 5 )
    return t
}
var line = function( x1, y1, x2, y2 ){
    var t = svg.create('line')
    t.setAttribute( 'x1', x1 )
    t.setAttribute( 'y1', y1 )
    t.setAttribute( 'x2', x2 )
    t.setAttribute( 'y2', y2 )
    t.setAttribute( 'class', 'control-line' )
    return t
}

var empty = function(){
    for( var i in this.dom )
        this.dom[ i ].innerHTML = ''
}

var render = function( ){

    // render only if the tool is active
    var shouldBeEmpty = !this.model.toolkit.options.tool.alterWidth
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
    var proj = this.model.camera.project

    // clean up
    empty.call( this )

    for( var i in face.chunk ){

        var container = this.dom[ i ]
        var shape = face.chunk[ i ]

        if ( !shape.line )
            // is a path
            continue

        var exp = pj.expandMustach( shape.line, shape.width ).map( proj )

        shape.line.map( proj ).forEach(function( p, index ){

            if( index==0 || index==shape.line.length-1 )
                return

            var a = (shape.line.length-2) + index
            var b = (shape.line.length-2) - index


            var l = line( exp[ a ].x, exp[ a ].y, exp[ b ].x, exp[ b ].y )
            container.appendChild( l )

            var ta = tic( exp[ a ].x, exp[ a ].y )
            ta.setAttribute( 'class', 'control-width-tic' )
            ta.setAttribute( 'data-i', index )
            ta.setAttribute( 'data-chunk', i )
            container.appendChild( ta )


            var tb = tic( exp[ b ].x, exp[ b ].y )
            tb.setAttribute( 'class', 'control-width-tic' )
            tb.setAttribute( 'data-i', index )
            tb.setAttribute( 'data-chunk', i )
            container.appendChild( tb )

        })
    }
}

var build = function( domSvg ){
    var face = this.model.face

    this.dom = {}

    var k=1
    for ( var i in face.chunk ){
        if ( face.chunk[ i ].line ){
            this.dom[ i ] = svg.create('g')
            this.dom[ i ].setAttribute( 'class', 'control-width control-width-'+i+' control-width-'+(k++) )
            this.dom[ i ].setAttribute( 'data-chunk', i )
            domSvg.appendChild( this.dom[ i ] )
        }
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
