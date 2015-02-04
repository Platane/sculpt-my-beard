var Abstract = require('../../utils/Abstract')

var init = function( modelBall, ed ){

    this.model = {
        toolkit: modelBall.toolkit,
    }

    this.ed = ed

    this.click = click.bind( this )

    return this
}

var enable = function(){
    this.disable()
    this.ed.listen( 'ui-toolbar-click', this.click, this )
}
var disable = function(){
    this.ed.unlisten( 'ui-toolbar-click', this )
}

var click = function( event ){

    this.model.toolkit.options[ event.category ][ event.option ] = !this.model.toolkit.options[ event.category ][ event.option ]


    this.ed.dispatch( 'change:toolkit', {
        wip: false,
        category: event.category,
        option: event.option,
    })
}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
