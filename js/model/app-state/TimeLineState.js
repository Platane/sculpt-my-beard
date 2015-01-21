var Abstract = require('../../utils/Abstract')
  , ed = require('../../system/eventDispatcher')

var init = function( type ){

    this.origin = 0
    this.zoom = 30

    this.cursor = 0

    this.project = project.bind( this )
    this.projectQ = projectQ.bind( this )
    this.unproject = unproject.bind( this )
    this.quantify = quantify.bind( this )

    return this
}

var project = function( x ){
    return ( x - this.origin ) * this.zoom
}
var projectQ = function( x ){
    return this.quantify( this.project( x ) )
}
var unproject = function( x ){
    return  x / this.zoom  + this.origin
}
var quantify = function( x ){
    return Math.round( x )
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
})