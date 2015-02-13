var Abstract = require('../../utils/Abstract')
  , u = require('../../utils/point')

var init = function( modelBall , ed ){

    this.model = {
        face: modelBall.face,
    }

    this.ed = ed

    this.click = click.bind( this )

    return this
}

var enable = function(){
    this.disable()
    this.ed.listen( 'ui-zone-mousedown', this.click )
}
var disable = function(){
    this.ed.unlisten( 'ui-zone-mousedown', this.click )
}

var click = function( event ){

    var shapes = this.model.face.chunk

    var tol = 15

    for( var k in shapes )
    {

        // is line or shape
        var points
        var closed
        if( shapes[ k ].line ){
            closed = false
            points = shapes[ k ].line
        }else{
            closed = true
            points = shapes[ k ].vertex
        }

        // iterate throught edges
        var a = points[ points.length-1 ]
        var b

        var i_max = points.length - ( closed ? 0 : 1 )
        for( var i = 0; i<i_max ; i++ ){

            b = a
            a = points[ i ]


            // test colision with line

            var n = u.diff( b, a )
            var l = u.norme( n )
            n.x /= l
            n.y /= l

            var t = {
                x: n.y,
                y: -n.x
            }

            var h = u.diff( event, a )

            var s
            if( (s= u.scalaire( h, n ) ) < 0 || s> l || Math.abs( u.scalaire( h, t ) ) > tol )
                continue

            // contact

            var p = u.lerp( a, b, s/l )
            p.isNew = true

            console.log( p, s, l )

            //points.splice( i, 0, p )

            return
        }



    }

}

module.exports = Object.create( Abstract ).extend({
    init: init,
    enable: enable,
    disable: disable,
})
