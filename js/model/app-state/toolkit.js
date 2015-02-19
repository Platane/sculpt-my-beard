var Abstract = require('../../utils/Abstract')

var init = function( type ){

    this.options = {
        view: {
            color: false,
            stroke: false,
        },
        tool: {
            movePoint: true,
            addPoint: false,
            //removePoint: false,
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

var enableTool = function( category, option ){
    switch( category+':'+option ){
        case 'tool:movePoint':
            this.options.tool.addPoint = false
            break
        case 'tool:addPoint':
            this.options.tool.movePoint = false
            break
    }
    this.options[ category ][ option ] = true
}
var disableTool = function( category, option ){
    this.options[ category ][ option ] = false
}


module.exports = Object.create( Abstract )
.extend({
    init: init,
    enableTool: enableTool,
    disableTool: disableTool,
})
