var Abstract = require('../../utils/Abstract')

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
    this.ed.listen( 'ui-tic-mousedown', this.ticDown, this )
}
var disable = function(){
    this.ed.unlisten( 'ui-tic-mousedown', this )
    this.ed.unlisten( 'ui-zone-mousemove', this )
    this.ed.unlisten( 'ui-mouseup', this )
}

var ticDown = function( event ){
    this._shape = this.model.face.chunk[ event.chunk ]
    this._point = this._shape[ event.pool ][ event.i ]

    this.ed.listen( 'ui-zone-mousemove', this.ticMove, this )
    this.ed.listen( 'ui-mouseup', this.ticUp, this )
}

var ticMove = function( event ){
    this._point.x = event.x
    this._point.y = event.y

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
