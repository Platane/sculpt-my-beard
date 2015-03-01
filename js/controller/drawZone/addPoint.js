var Abstract = require('../../utils/Abstract')
  , u = require('../../utils/point')

var init = function( modelBall , ed ){

    this.model = {
        face: modelBall.face,
    }

    this.ed = ed

    this.ticDown = ticDown.bind( this )
    this.ticMove = ticMove.bind( this )
    this.ticUp = ticUp.bind( this )

    return this
}

var enable = function(){
    this.disable()
    this.ed.listen( 'ui-tic-mousedown', this.ticDown )
}
var disable = function(){
    this.ed.unlisten( 'ui-tic-mousedown', this.ticDown )
    this.ed.unlisten( 'ui-zone-mousemove', this.ticMove )
    this.ed.unlisten( 'ui-mouseup', this.ticUp )
}

var ticDown = function( event ){
    this._shape = this.model.face.chunk[ event.chunk ]
    this._close = event.pool == 'vertex'
    this._addedAt = -1
    var pool = this._pool = this._shape[ event.pool ]
    var i = this._i = event.i
    this._point = {
        x:0,
        y:0
    }
    this._sharpness = { after: 0.15, before: 0.15 }
    this._sharpness2 = { after: 0.15, before: 0.15 }
    this._reindex = this._shape.reindex ? null : pool.map(function(x, i){ return i })

    // save the clicked point, the next one and the previous one

    var _p, p_

    this.p = pool[ i ]

    if( this._close ) {
    	p_ = pool[ (i+1)%pool.length ]
    	_p = pool[ (i+pool.length-1)%pool.length ]
    } else {
        p_ = i+1 < pool.length ? pool[ i+1 ] : null
        _p = i-1 >= 0  ? pool[ i-1 ] : null
    }


    // save the tangent

    var n = { x:0, y:0 }
    var tn

    if( _p ) {
        this._n = tn = u.normalize( u.diff( _p, this.p ))
        n.x += tn.x
        n.y += tn.y
    }

    if( p_ ) {
        this.n_ = tn = u.normalize( u.diff( p_, this.p ))
        n.x -= tn.x
        n.y -= tn.y
    }

    this.n = u.normalize( n )

    if( !this.n_ )
        this.n_ = n
    if( !this._n )
        this._n = n


    this.ed.unlisten( 'ui-zone-mousemove', this.ticMove )
    this.ed.listen( 'ui-zone-mousemove', this.ticMove )
    this.ed.unlisten( 'ui-mouseup', this.ticUp )
    this.ed.listen( 'ui-mouseup', this.ticUp )
}

var ticMove = function( event ){


    var v = u.diff( event, this.p )

    // if the cursor is too far or too close to the point, cancel
    var dSqrt = u.normeSqrt( v )
    var acceptable = dSqrt > 25

    // dertemine if the point should be before or after the point
    var after = u.scalaire( v, this.n ) < 0
    var i = ( this._i + ( after ? 1 :0 ) ) % this._pool.length

    // when to delete the point
    if( this._addedAt >= 0 && ( !acceptable  || i != this._addedAt ) ){
        // the point is currently on the shape, but should not be
        // or the point should be on the shape but at another place
        // delete

        this._pool.splice( this._addedAt, 1 )
        if( this._shape.width ){
            this._shape.width.splice( this._addedAt, 1 )
            var l = this._shape.sharpness.length /2 -2
            this._shape.sharpness.splice( l + this._addedAt, 1 )
            this._shape.sharpness.splice( l - this._addedAt, 1 )
        } else
            this._shape.sharpness.splice( this._addedAt, 1 )

        for( var k = this._addedAt == this._i ? this._i : this._i+2; k<this._shape.reindex.length; k++ )
            this._shape.reindex[ k ] --
        this._shape.reindex.splice( this._addedAt, 1 )
        if ( this._reindex )
            this._shape.reindex = null
    }

    // the point as been deleted
    if ( this._addedAt >= 0 && !acceptable ) {
        this._addedAt = -1

        // notify
        this.ed.dispatch('change:point', {
            point: this._point,
            shape: this._shape,
            wip: true
        })

    // add the point
    } else if( this._addedAt != i && acceptable ){

        // add the items
        this._pool.splice( (this._addedAt = i), 0, this._point )
        if( this._shape.width ){
            this._shape.width.splice( this._addedAt, 0, 0 )
            var l = this._shape.sharpness.length /2
            this._shape.sharpness.splice( l + this._addedAt, 0, this._sharpness )
            this._shape.sharpness.splice( l - this._addedAt, 0, this._sharpness2 )
        } else
            this._shape.sharpness.splice( this._addedAt, 0, this._sharpness )

        if ( this._reindex )
            this._shape.reindex = this._reindex
        this._shape.reindex.splice( this._addedAt, 0, this._i )
        for( var k = after ? this._i+2 : this._i; k<this._shape.reindex.length; k++ )
            this._shape.reindex[ k ] ++


        // set the values
        var l = 2
        var n = after ? this.n_ : this._n
        this._point.x = this.p.x + n.x * l
        this._point.y = this.p.y + n.y * l

        if( this._shape.width )
            this._shape.width[ this._addedAt ] = 0

        // notify
        this.ed.dispatch('change:point', {
            point: this._point,
            shape: this._shape,
            wip: true
        })

    }
}

var ticUp = function( event ){

    if( this._addedAt >= 0 )
        this.ed.dispatch('change:point', {
            point: this._point,
            shape: this._shape,
            wip: false
        })

    this.ed.unlisten( 'ui-zone-mousemove', this.ticMove )
    this.ed.unlisten( 'ui-mouseup', this.ticUp )
}


module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
