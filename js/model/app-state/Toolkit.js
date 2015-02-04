var Abstract = require('../../utils/Abstract')

var init = function( type ){

    this.options = {
        view: {
            color: true,
            stroke: true,
        },
        tool: {
            movePoint: true,
            addPoint: true,
            removePoint: true,
            alterSharpness: true,
            alterWidth: true,
        },
        camera: {
            translate: true,
            zoom: true,
        }
    }

    return this
}

var enableTool = function( label ){

}
var disableTool = function( label ){

}


module.exports = Object.create( Abstract )
.extend({
    init: init,
    enableTool: enableTool,
    disableTool: disableTool,
})
