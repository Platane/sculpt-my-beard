var Abstract = require('../utils/Abstract')
  , h = require('./mixin/historizable')
  , ed = require('../system/eventDispatcher')


var init = function( type ){

    this.stack = []
    this.undo_stack = []

    return this
}

var save = function( model ){
    this.stack.push({ model: model, pack: model.pack() })

    this.undo_stack.length = 0

    while ( this.stack.length > 50 )
        this.stack.shift()
}

var dispatch = function( model ){
    ed.dispatch( 'change:timeLine', {
        no_history: true
    })
}

var undo = function( o ){
    if ( this.stack.length<=1 )
        return false

    var o = this.stack.pop()

    var last = this.stack[ this.stack.length-1 ]

    o.model.unpack( h.deepCopy( last.pack ) )

    dispatch( o.model )


    this.undo_stack.push( o )
}

var redo = function( o ){

    if ( !this.undo_stack.length )
        return false

    var o = this.undo_stack.pop()

    o.model.unpack( h.deepCopy( o.pack ) )

    this.stack.push( o )

    dispatch( o.model )
}

module.exports = Object.create( Abstract )
.extend( h )
.extend({
    init: init,
    undo: undo,
    redo: redo,
    save: save,
})
