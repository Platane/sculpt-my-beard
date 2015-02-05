var Abstract = require('../utils/Abstract')

var init = function( modelBall , ed , ctrlBall ){

    this.model = {
        toolkit: modelBall.toolkit
    }

    this.ctrls = ctrlBall

    this.changeToolkit = changeToolkit.bind( this )

    this.ed = ed

    this._previous = {}
    for ( var i in table )
        this._previous[ table[ i ] ] = true

    return this
}

var enable = function(){
    this.disable()
    this.ed.listen( 'change:toolkit', this.changeToolkit )
}
var disable = function(){
    this.ed.unlisten( 'change:toolkit', this.changeToolkit )
}


var table = {
    'camera-zoom' : 'drawZoneZoom',
    'camera-translate' : 'drawZoneTranslate',

    'tool-movePoint' : 'dragPoint',
}

var changeToolkit = function( event ){

    var options = this.model.toolkit.options

    for( var k in options )
    for( var i in options[ k ] )
    {
        var ctrl = table[ k+'-'+i ]
        var enable = options[ k ][ i ]
        if ( ctrl && this._previous[ ctrl ] != enable ) {
            this.ctrls[ ctrl ][ enable ? 'enable' : 'disable' ]()
            this._previous[ ctrl ] = enable
        }
    }
}



 module.exports = Object.create( Abstract ).extend({
     init: init,
     enable: enable,
     disable: disable,
 })
