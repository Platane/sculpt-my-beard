var Abstract = require('../utils/Abstract')
  , ed = require('../system/eventDispatcher')
  , interpolate = require('../system/interpolate')
  , sc = require('../system/structuralChangesMethods')

 var init = function( modelBall ){

     this.model = {
         face: modelBall.face,
         timeLine: modelBall.timeLine,
         timeLineState: modelBall.timeLineState
     }

     this.changeShape = changeShape.bind( this )
     this.changeCursor = changeCursor.bind( this )

     return this
 }

 var enable = function(){
     this.disable()
     ed.listen( 'change:shape', this.changeShape, this )
     ed.listen( 'change:timeLineState-cursor', this.changeCursor, this )
 }
 var disable = function(){
     ed.unlisten( 'change:shape', this )
     ed.unlisten( 'change:timeLineState-cursor', this )
 }

 var changeShape = function( event ){

     if(event.wip || event.is_interpolation)
         return

     for( var chunk in this.model.face.chunk )
         if( this.model.face.chunk[chunk] == event.shape )
             break

     this.model.timeLine.addOrSetKey( chunk, this.model.timeLineState.cursor, event.shape.pack() )

     ed.dispatch( 'change:timeLine', {
         wip: false
     })
 }
 var changeCursor = function( event ){

     var fchunk = this.model.face.chunk,
         date = this.model.timeLineState.cursor,
         keys = this.model.timeLine.keys

     if( this._cursor == date )
         return

     for( var chunk in keys ){

         // TODO detect when the shape does not change, dont ask for redraw then

         var key = this.model.timeLine.locate( chunk, date )

         if( !key.a ){
             fchunk[ chunk ].unpack( sc.packIn( key.b ) )
         }
         else if( !key.b ){
             fchunk[ chunk ].unpack( sc.packOut( key.a ) )
         }
         else {

             var alpha = ( date - key.a.date )/( key.b.date - key.a.date )

             fchunk[ chunk ].unpack( interpolate.lerpPack( key.a, key.b , alpha ) )
         }

         // notify
         ed.dispatch( 'change:point', {
             wip: event.wip,
             shape: fchunk[ chunk ],
             is_interpolation: true
         })
     }
 }



 module.exports = Object.create( Abstract ).extend({
     init: init,
     enable: enable,
     disable: disable,
 })
