var Abstract = require('../../utils/Abstract')

var init = function( modelBall, ed ){

    this.model = {
        playerInfo: modelBall.playerInfo,
    }
    this.ed = ed

    this.keydown = keydown.bind( this )
    this.killOnCursorMove = killOnCursorMove.bind( this )

    return this
}

var enable = function(){
    this.disable()
    this.ed.listen( 'change:timeLineState-cursor', this.killOnCursorMove )
    this.ed.listen( 'ui-keydown', this.keydown )
}
var disable = function(){
    this.ed.unlisten( 'change:timeLineState-cursor', this.killOnCursorMove )
    this.ed.unlisten( 'ui-keydown', this.keydown )
}

var killOnCursorMove = function( event ){
    if( !event.fromPlayer && this.model.playerInfo.isPlaying )
    {
        this.model.playerInfo.isPlaying = false
        this.ed.dispatch('change:playerInfo')
    }
}
var keydown = function( event ){

    switch( event.mouseEvent.which ){
        case 32:
            this.model.playerInfo.isPlaying = !this.model.playerInfo.isPlaying
            this.ed.dispatch('change:playerInfo')
            event.mouseEvent.preventDefault()
            event.mouseEvent.stopPropagation()
    }
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
