var Abstract = require('../../utils/Abstract')
var u = require('../../utils/point')
var sc = require('../../system/structuralChangesMethods')
var lerpFn = require('../../system/interpolate').lerpFn

var init = function( modelBall , ed ){

    this.model = {
        face: modelBall.face,
        timeLine: modelBall.timeLine,
        timeLineState: modelBall.timeLineState
    }

    this.ed = ed

    this.ticDown = ticDown.bind( this )
    this.ticMove = ticMove.bind( this )
    this.ticUp = ticUp.bind( this )

    return this
}

var enable = function(){
    this.disable()
    this.ed.listen( 'ui-tic-mousedown', this.ticDown, this )
}
var disable = function(){
    this.ed.unlisten( 'ui-tic-mousedown', this )
    this.ed.unlisten( 'ui-zone-mousemove', this )
    this.ed.unlisten( 'ui-mouseup', this )
}


var isConstraint = (function(){

    // apply this constraint when the point is just added
    var projPoint = function( rule, a, b ){

        // precompute stuff
        var ab = u.diff( b, a )
        var l = u.norme( ab )
        ab.x /= l
        ab.y /= l
        var limit = Math.min( 5, l/2 )

        var computeK = function( p ){

            var k = u.scalaire( ab, u.diff( p, a ) )

            return Math.max( Math.min( k, l-limit ), limit ) / l
        }

        return function( p ){
            var k = rule.k = computeK( p )
            p.x = (1-k) * a.x + k * b.x
            p.y = (1-k) * a.y + k * b.y
        }
    }

    // apply this constraint when the point before is just added
    var before = function( rule, p, a ){
        var k = rule.k
        return function( b ){
            p.x = (1-k) * a.x + k * b.x
            p.y = (1-k) * a.y + k * b.y
        }
    }

    // apply this constraint when the point after is just added
    var after = function( rule, p, b ){
        var k = rule.k
        return function( a ){
            p.x = (1-k) * a.x + k * b.x
            p.y = (1-k) * a.y + k * b.y
        }
    }

    return function( timeLine, chunk, cursor, i, shape ){

        var rule

        // find the keyBefore
        var keys = timeLine.locate( chunk, cursor )

        if( keys.a && keys.a.date == cursor && ( rule = sc.isConstraint( keys.a, i ) ) ){

            // take the after and before
            var point = shape.line || shape.vertex

            var l = point.length

            var fn
            if( rule.onEdge )
                fn = projPoint( rule.onEdge, point[ (i-1+l) % l ], point[ (i+1) % l ] )
            else if( rule.before )
                fn = before( rule.before, point[ (i-1+l) % l ], point[ (i-2+l) % l ] )
            else if( rule.after )
                fn = after( rule.after, point[ (i+1) % l ], point[ (i+2) % l ] )

            return fn

        }
    }
})()

var ticDown = function( event ){
    this._shape = this.model.face.chunk[ event.chunk ]
    this._point = this._shape[ event.pool ][ event.i ]


    // check if the point is constraint
    this._constraint = isConstraint( this.model.timeLine, event.chunk, this.model.timeLineState.cursor, event.i, this._shape )

    this.ed.listen( 'ui-zone-mousemove', this.ticMove, this )
    this.ed.listen( 'ui-mouseup', this.ticUp, this )
}

var ticMove = function( event ){
    this._point.x = event.x
    this._point.y = event.y


    // do special stuff if the point has just been created or if the point after/before has just been created
    if( this._constraint )
        this._constraint( this._point )


    this.ed.dispatch( 'change:point', {
        point: this._point,
        shape: this._shape,
        wip: true
    })
}

var ticUp = function( event ){

    // TODO fix superposition

    this.ed.dispatch( 'change:point', {
        point: this._point,
        shape: this._shape,
        wip: false
    })

    this.ed.unlisten( 'ui-zone-mousemove', this )
    this.ed.unlisten( 'ui-mouseup', this )
}


module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
