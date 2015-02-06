var u = require('../utils/point')


var resolveUncapSharpness = function( sharpness ){

    var _a = sharpness[ 0 ],
         a,
         t

    for( var i = sharpness.length; i--; ){
        a  = _a
        _a = sharpness[ i ]

        // _a a
        // -1 0

        if( t = ( _a.after + a.before ) > 1 ){
            _a.after /= t
            a.before /= t
        }
    }

    return sharpness
}
var bezify = function( pts, sharpness ){

    var default_sharpness

    if( pts.length<2 )
        return []

    if( !sharpness || typeof sharpness == 'number' )
        default_sharpness = sharpness || 0.25
    else
        resolveUncapSharpness( sharpness )


    var _a = pts[ 0 ],
         a = pts[ 1 ],
        a_, e_, _e,
        s_, _s,
        k

    var bezierPath = []
    for( var i=pts.length; i--; ){

        // _a a a_ is a vertex
        // -1 0 +1
        a_ =  a
        a  = _a
        _a = pts[ i ]

        // compute fixed point ( depends on sharpness )
        k = (i+1)%pts.length

        _s = default_sharpness || sharpness[ k ].before
        s_ = default_sharpness || sharpness[ k ].after

        e_ = u.lerp( a, _a, _s )
        _e = u.lerp( a, a_, s_ )

        e_.type = 'F'
        _e.type = 'F'

        a.type = 'C'

        bezierPath.push( _e, a, e_ )
    }

    return bezierPath
}

var expandMustach = function( pts, hs ){
    return pts.reduce( function( p, a, i ){
        if( i==0 || i==pts.length-1 ){
            p.push( a )
            return p
        }
        var a_ = u.normalize( u.diff( pts[i-1], a ) ),
            _a = u.normalize( u.diff( a, pts[i+1] ) )

        var n = a_

        n.x = _a.x + a_.x
        n.y = _a.y + a_.y

        u.normalize( n )

        var tmp = n.x
        n.x = n.y
        n.y = -tmp

        p.unshift({
            x: a.x + n.x * hs[i],
            y: a.y + n.y * hs[i]
        })
        p.push({
            x: a.x - n.x * hs[i],
            y: a.y - n.y * hs[i]
        })

        return p
    }, [])
}


module.exports = {
    expandMustach: expandMustach,
    bezify: bezify
}
