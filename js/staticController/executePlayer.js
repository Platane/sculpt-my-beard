var Abstract = require('../utils/Abstract')

var init = function( modelBall, ed ){

    this.ed = ed

    this.model = {
        timeLineState : modelBall.timeLineState,
        playerInfo : modelBall.playerInfo,
    }

    this.run = false
    this.waitingToBeKilled = false
    this.playpause = playpause.bind( this )
    this.cycle = cycle.bind( this )

    return this
}

var enable = function(){
    this.disable()
    this.ed.listen( 'change:playerInfo', this.playpause )
}
var disable = function(){
    this.ed.unlisten( 'change:playerInfo', this.playpause )
}
var stop = function(){

    this.waitingToBeKilled = true
    this.run = false

    // set the cursor to a rounded value
    var fl = Math.round( this.model.timeLineState.cursor )
    if ( fl != this.model.timeLineState.cursor )
    {
        this.model.timeLineState.cursor = fl
        this.ed.dispatch( 'change:timeLineState-cursor', {fromPlayer: true} )
    }
}
var play = function(){

    this.run = true
    // if running, then get killed, then re run before the cycle is called. Then waiting to killed is still true and the cycle is not launched twice
    if( !this.waitingToBeKilled ){
        this._lastDate = Date.now()
        this.cycle()
    }
}
var playpause = function( event ){

    if ( this.model.playerInfo.isPlaying != this.run )
    {
        if( this.run )
            stop.call( this )
        else
            play.call( this )
    }
}
var cycle = function(){

    // return if paused
    if ( !this.run ){
        this.waitingToBeKilled = false
        return
    }

    // compute delta
    var now = Date.now()
    var delta = now - this._lastDate
    this._lastDate = now

    // set the cursor
    this.model.timeLineState.cursor += delta*this.model.playerInfo.speed
    this.ed.dispatch( 'change:timeLineState-cursor', {fromPlayer: true} )

    // loop
    requestAnimationFrame( this.cycle )
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
