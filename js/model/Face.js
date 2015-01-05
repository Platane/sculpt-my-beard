var Abstract = require('../utils/Abstract')
  , ed = require('../system/eventDispatcher')

  , Shape = require('../model/Shape')
  , Line = require('../model/Line')

var init = function( type ){

    this.chunk = {
        mustach_left: Object.create( Line ).init(),
        mustach_right: Object.create( Line ).init(),

        beard_left: Object.create( Shape ).init(),
        beard_right: Object.create( Shape ).init(),
        beard_mid: Object.create( Shape ).init(),
    }

    return this
}

var pack = function(){
    var o = {}
    for( var i in this.chunk )
        o[ i ] = this.chunck[ i ].pack()
    return o
}

var unpack = function( o ){
    for( var i in this.chunk )
        this.chunck[ i ].unpack( o[ i ] )
    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
    pack: pack,
    unpack: unpack,
})
