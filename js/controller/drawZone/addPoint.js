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

    // detect collision with the edges
    // if a collision is detected, delegate to the addpoint function

    var shapes = this.model.face.chunk

    var tol = 8

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

            // check if the new point is not to close to another point
            if( s<10 || l-s<10 )
                continue

            // alpha=s/l,  p = (1-alpha)*a + alpha*b
            addPoint.call( this, k , i , 1-s/l )

            return
        }
    }
}

/**
 * find the pack before and after the current point,
 * delegate to structuralChange to actually add the point
 * @private
 */
var addPoint = function( chunk, pointIndex, k ){

    var timeLine = this.model.timeLine
    var face = this.model.face
    var cursor = this.model.timeLineState.cursor
    var keys = timeLine.keys[ chunk ]

    // find the interval
    var bKey = timeLine.locate( chunk, cursor ).b

    // grab the current pack or create it if needed
    var aKey = timeLine.addOrSetKey( chunk, cursor, face.chunk[ chunk ].pack() )

    // add the point
    sc.add( aKey, bKey, pointIndex, k )

    // notify
    this.ed.dispatch('change:timeLine')

    // TODO better route to force interpolation recomputing
    this.ed.dispatch('change:timeLineState-cursor')
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
