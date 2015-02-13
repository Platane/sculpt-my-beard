var Abstract = require('../../utils/Abstract')

var init = function( type ){

    this.speed = 1/90
    this.isPlaying = false

    return this
}


module.exports = Object.create( Abstract )
.extend({
    init: init,
})
