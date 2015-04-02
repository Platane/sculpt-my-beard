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

var isConstraint = function( timeLine, chunk, cursor, i ){

    var rule

    // find the keyBefore
    var keys = timeLine.locate( chunk, cursor )

    if( keys.a && keys.a.date == cursor && ( rule = sc.isConstraint( keys.a, i ) ) ){

        var apack = sc.packOut( keys.a )

        // take the after and before
        var point = apack.line || apack.vertex


        var apoint = point[ (i-1+point.length) % point.length ]
        var bpoint = point[ (i+1) % point.length ]


        // precompute stuff
        var ab = u.diff( bpoint, apoint )
        var l = u.norme( ab )
        ab.x /= l
        ab.y /= l
        var limit = Math.min( 5, l/2 )
        var computeK = function( p ){

            var k = u.scalaire( ab, u.diff( p, apoint ) )

            return Math.max( Math.min( k, l-limit ), limit ) / l
        }


        return {
            proj : function( p ){
                var k = rule.k = computeK( p )
                p.x = (1-k) * apoint.x + k * bpoint.x
                p.y = (1-k) * apoint.y + k * bpoint.y
            }
        }

    }
}

var ticDown = function( event ){
    this._shape = this.model.face.chunk[ event.chunk ]
    this._point = this._shape[ event.pool ][ event.i ]


    // check if the point is constraint
    this._constraint = isConstraint( this.model.timeLine, event.chunk, this.model.timeLineState.cursor, event.i )

    this.ed.listen( 'ui-zone-mousemove', this.ticMove, this )
    this.ed.listen( 'ui-mouseup', this.ticUp, this )
}

var ticMove = function( event ){
    this._point.x = event.x
    this._point.y = event.y

    if( this._constraint )
        this._constraint.proj( this._point )


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
