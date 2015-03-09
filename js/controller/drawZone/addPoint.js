var Abstract = require('../../utils/Abstract')
  , u = require('../../utils/point')
  , sc = require('../../system/structuralChangesMethods')

var init = function( modelBall , ed ){

    this.model = {
        face: modelBall.face,
        timeLine: modelBall.timeLine,
        timeLineState: modelBall.timeLineState,
    }

    this.ed = ed

    this.click = click.bind( this )

    return this
}

var enable = function(){
    this.disable()
    this.ed.listen( 'ui-zone-mousedown', this.click )
}
var disable = function(){
    this.ed.unlisten( 'ui-zone-mousedown', this.click )
}

var click = function( event ){

    var shapes = this.model.face.chunk

    var tol = 15

    for( var k in shapes ){

        // is line or shape
        var points
        var closed
        if( shapes[ k ].line ){
            closed = false
            points = shapes[ k ].line
        }else{
            closed = true
            points = shapes[ k ].vertex
        }

        // iterate throught edges
        var a = points[ points.length-1 ]
        var b

        var i_max = points.length - ( closed ? 0 : 1 )
        for( var i = 0; i<i_max ; i++ ){

            b = a
            a = points[ i ]


            // test colision with line

            var n = u.diff( b, a )
            var l = u.norme( n )
            n.x /= l
            n.y /= l

            var t = {
                x: n.y,
                y: -n.x
            }

            var h = u.diff( event, a )

            var s
            if( (s= u.scalaire( h, n ) ) < 0 || s> l || Math.abs( u.scalaire( h, t ) ) > tol )
                continue

            // contact

            // alpha=s/l,  p = (1-alpha)*a + alpha*b
            addPoint.call( this, k , ( i+points.length-1 )%points.length, 1-s/l )

            return
        }
    }
}

var addPoint = function( chunk, pointIndex, k ){

    var timeLine = this.model.timeLine
    var face = this.model.face
    var c = this.model.timeLineState.cursor
    var keys = timeLine.keys[ chunk ]

    // find the interval
    var _ax=-1, bx=-1

    if ( c <= keys[0].date ){
        //bx = 0
    } else if ( c >= keys[ keys.length-1 ].date ){
        //_ax = keys.length-1
    } else {
        for( bx=0; keys[ bx ].date<c; bx++ );
        //_ax = i-1
    }

    // grab the far pack
    var farPack
    if ( bx>=0 ){
        farPack = keys[bx]
    }

    // add the point
    face.chunk[ chunk ].addPoint( pointIndex, k )

    // grab the current pack or create it if needed
    var curPack = timeLine.addOrSetKey( chunk, c, face.chunk[ chunk ].pack() )

    // add on curPack
    sc.add( curPack.structuralChanges, pointIndex+1, k )

    // remove on farPack
    if( farPack ){
        sc.del( farPack.structuralChanges, pointIndex+1, k )
        // TODO add as barycenter
        
    }

    this.ed.dispatch('change:timeLine')
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
