var Abstract = require('../../utils/Abstract')

var init = function( type ){

    this.options = {
        view: {
            color: true,
            stroke: false,
        },
        tool: {
            movePoint: true,
            //addPoint: true,
            //removePoint: true,
            alterWidth: false,
            alterSharpness: false,
        },
        camera: {
            translate: true,
            zoom: false,
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
