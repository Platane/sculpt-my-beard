var Abstract = require('../../utils/Abstract')
  , dom = require('../../utils/domHelper')


var category_tpl = [
    '<li class="tb-category">',
        '<span class="tb-category-label"></span>',
        '<ul></ul>',
    '</li>'
].join('')

var button_tpl = [
    '<li class="tb-switch">',
        '<svg class="tb-switch-back" viewBox="0 0 240 120">',
            '<use class="tb-swicth-icon-on" y="10" x="10" xlink:href = "#svg_hexagon"></use>',
            '<use class="tb-swicth-icon-off" y="10" x="130" xlink:href = "#svg_hexagon"></use>',
        '</svg>',
        '<div class="tb-switch-front-viewport">',
            '<svg class="tb-switch-front" viewBox="0 0 240 120">',
                '<use class="tb-swicth-icon-on" y="10" x="10" xlink:href = "#svg_hexagon"></use>',
                '<use class="tb-swicth-icon-off" y="10" x="130" xlink:href = "#svg_hexagon"></use>',
            '</svg>',
        '</div>',
    '</li>'
].join('')

var build = function( domContainer ){
    var tools = this.model.toolkit.options

    var uul = document.createElement('ul')
    domContainer.appendChild( uul )

    this.dom = {}

    for( var i in tools ){

        var domCat = dom.domify( category_tpl )
        domCat.querySelector('.tb-category-label').className += ' tb-category-'+i
        domCat.querySelector('.tb-category-label').innerHTML += i

        var ul = domCat.querySelector('ul')
        uul.appendChild( domCat )

        for( var k in tools[ i ] ){

            this.dom[ k ] = dom.domify( button_tpl )
            this.dom[ k ].className += ' tb-switch-'+k
            this.dom[ k ].setAttribute( 'data-category', i )
            this.dom[ k ].setAttribute( 'data-option', k )
            ul.appendChild( this.dom[ k ] )
        }
    }

    update.call( this )
}

var update = function( ){
    var tools = this.model.toolkit.options

    for( var i in tools )
    for( var k in tools[ i ] )
        dom[ tools[ i ][ k ] ? 'addClass' : 'removeClass' ]( this.dom[ k ], 'enabled' )
}

var init = function( modelBall, ed, dom ){

    this.model = {
        toolkit: modelBall.toolkit,
    }

    this.ed = ed

    build.call( this, dom )

    this.ed.listen( 'change:toolkit' , update.bind( this ) , this )

    dom.addEventListener('click', onClick.bind( this ), false )

    return this
}

var onClick = function( event ){

    var el
    if( ( el = dom.getParent( event.target, 'tb-switch') ) )
        this.ed.dispatch( 'ui-toolbar-'+event.type, {
            category: el.getAttribute( 'data-category' ),
            option: el.getAttribute( 'data-option' ),
            mouseEvent: event
        })
}

module.exports = Object.create( Abstract )
.extend({
    init: init
})
