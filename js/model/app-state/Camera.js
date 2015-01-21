var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')
  , u = require('../../utils/point')

var init = function( type ){

    this.project = project.bind( this )
    this.unproject = unproject.bind( this )

    this.origin = {x: 0, y: 0}
    this.zoom = 2
    this._zoom = computeZoom( this.zoom )

    return this
}

var project = function( p ){
    return {
        x: ( p.x - this.origin.x ) * this._zoom,
        y: ( p.y - this.origin.y ) * this._zoom
    }
}
var unproject = function( p ){
    return {
        x: ( p.x / this._zoom ) + this.origin.x,
        y: ( p.y / this._zoom ) + this.origin.y
    }
}

// the x y point ( on screen ) will remain unchanged
// return true if any change
var setZoom = function( zoom, x, y ){

    var max = 5
    zoom = Math.min( Math.max( 0, +zoom), max )

    if ( zoom == this.zoom )
        return false

    var p = this.unproject({x:+x, y:+y})

    var _zoom = computeZoom( zoom )

    this.origin.x = p.x - x / _zoom
    this.origin.y = p.y - y / _zoom
    this.zoom = zoom
    this._zoom = _zoom

    return true
}
var computeZoom = function( x ){
    return 1<<x
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
    setZoom: setZoom
})
