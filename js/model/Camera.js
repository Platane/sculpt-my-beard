var Abstract = require('../utils/Abstract')
  , ed = require('../system/eventDispatcher')
  , u = require('../utils/point')

var init = function( type ){

    this.origin = {x: 0, y: 0}
    this.zoom = 1

    this.project = project.bind( this )
    this.unproject = unproject.bind( this )

    return this
}

var project = function( p ){
    return {
        x: ( p.x - this.origin.x ) * this.zoom,
        y: ( p.y - this.origin.y ) * this.zoom
    }
}
var unproject = function( p ){
    return {
        x: ( p.x / this.zoom ) + this.origin.x,
        y: ( p.y / this.zoom ) + this.origin.y
    }
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
})
