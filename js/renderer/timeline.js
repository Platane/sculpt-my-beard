var Abstract = require('../utils/Abstract')
  , dom = require('../utils/domHelper')
  , ed = require('../system/eventDispatcher')


var render = function( ){
    var face = this.model.face
    var camera = this.model.camera
    var proj = function( p ){
        var pp = camera.project( p )
        pp.type = p.type
        return pp
    }

    for( var i in face.chunk )
        this.dom[ i ].setAttribute( 'd',
            svg.renderBezier( face.chunk[ i ].bezierPath.map( proj ) )
        )
}

var label_tpl = [
'<div class="row">',
'</div>',
]
var row_tpl = [
'<div class="row">',
'</div>',
]

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

    for( var i in face.chunk ){
        var label = dom.domify( label_tpl )
        var row = dom.domify( row_tpl )

        labels.appendChild( label )
        lines.appendChild( row )
    }
}

var init = function( modelBall, domSvg ){

    this.model = {
        face: modelBall.face,
        camera: modelBall.camera
    }

    build.call( this, domSvg )

    ed.listen( 'render' , render.bind( this ) , this )

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
    render: render
})
