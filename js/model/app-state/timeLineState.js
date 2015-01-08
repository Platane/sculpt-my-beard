var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')

var init = function( type ){

    this.origin = 0
    this.zoom = 1

    this.cursor = 0

    this.project = project.bind( this )
    this.unproject = unproject.bind( this )

    return this
}

var project = function( x ){
    return ( x - this.origin ) * this.zoom
}
var unproject = function( x ){
    return  x / this.zoom  + this.origin
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
})
