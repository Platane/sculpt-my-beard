var Abstract = require('../utils/Abstract')
  , dom = require('../utils/domHelper')
  , ed = require('../system/eventDispatcher')


var render = function( ){
    var face = this.model.face

}

var label_tpl = [
'<div class="tl-row">',
'</div>',
].join('')
var row_tpl = [
'<div class="tl-row">',
'</div>',
].join('')

var tpl = [
'<div class="tl">',
    '<div class="tl-block-label">',
    '</div>',
    '<div class="tl-lines-viewport">',
        '<div class="tl-block-lines">',
        '</div>',
    '</div>',
'</div>',
].join('')



var build = function( ){
    var face = this.model.face

    this.domEl = dom.domify( tpl )

    var labels = this.domEl.querySelector('.tl-block-label'),
        lines = this.domEl.querySelector('.tl-block-lines')


    var k=0
    for( var i in face.chunk ){
        var label = dom.domify( label_tpl )
        var row = dom.domify( row_tpl )

        labels.appendChild( label )
        lines.appendChild( row )
    }
}

var init = function( modelBall, body ){

    this.model = {
        face: modelBall.face,
        camera: modelBall.camera
    }

    build.call( this )

    body.appendChild( this.domEl )

    ed.listen( 'render' , render.bind( this ) , this )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
    render: render
})
