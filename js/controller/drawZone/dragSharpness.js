var Abstract = require('../../utils/Abstract')
  , u = require('../../utils/point')

var init = function( modelBall , ed ){

    this.model = {
        face: modelBall.face,
        camera: modelBall.camera,
    }

    this.ed = ed

    this.ticDown = ticDown.bind( this )
    this.ticMove = ticMove.bind( this )
    this.ticUp = ticUp.bind( this )

    return this
}

var enable = function(){
    this.disable()
    this.ed.listen( 'ui-sharpness-tic-mousedown', this.ticDown, this )
}
var disable = function(){
    this.ed.unlisten( 'ui-sharpness-tic-mousedown', this )
    this.ed.unlisten( 'ui-zone-mousemove', this )
    this.ed.unlisten( 'ui-mouseup', this )
}

var ticDown = function( event ){
    this._shape = this.model.face.chunk[ event.chunk ]
    this._i = +event.i
    this._sens = event.sens

    // precompute stuff
    this._sens2 = this._sens == 'after' ? 'before' : 'after'
    this._i2 = ( this._sens == 'after' ? this._i+1 : this._i+this._shape.vertex.length-1 ) % this._shape.vertex.length

    this._val2 = this._shape.sharpness[ this._i2 ][ this._sens2 ]

    this.ed.listen( 'ui-zone-mousemove', this.ticMove, this )
    this.ed.listen( 'ui-mouseup', this.ticUp, this )
}

var ticMove = function( event ){

    var a = this.model.camera.project( this._shape.vertex[ this._i ] )
    var a2 = this.model.camera.project( this._shape.vertex[ this._i2 ] )

    var v = u.normalize( u.diff( a2, a ) )

    var p = {x:event.screenX, y:event.screenY}

    var val

    var s = u.scalaire( v, u.diff( p, a ) )

    if( s < 0 )
        val = 0
    else {
        var d = u.distance( p, a )
        if ( s/d < 0.5 )
            val = s * 2
        else
            val = d
    }

    val = Math.max( Math.min( ( val -15 )/60 , 1 ), 0 )

    if ( val == this._shape.sharpness[ this._i ][ this._sens ] )
        return


    this._shape.sharpness[ this._i ][ this._sens ] = val

    // constraint
    if ( val + this._val2 > 1 )
        this._shape.sharpness[ this._i2 ][ this._sens2 ] = 1-val
    else
        this._shape.sharpness[ this._i2 ][ this._sens2 ] = this._val2

    this.ed.dispatch( 'change:point', {
        shape: this._shape,
        wip: true
    })
}

var ticUp = function( event ){

    this.ed.dispatch( 'change:point', {
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
