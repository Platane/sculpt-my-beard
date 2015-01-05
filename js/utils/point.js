var u = {}

u.scalaire = function( a, b ){
    return a.x*b.x + a.y*b.y
}
u.norme = function( a ){
    return Math.sqrt( u.scalaire( a, a ) )
}
u.normalize = function( a ){
    var n = u.norme( a )
    a.x /= n
    a.y /= n
    return a
}
u.diff = function( a, b ){
    return {
        x: a.x - b.x,
        y: a.y - b.y
    }
}
u.lerp = function( a, b, alpha ){
    var aalpha = 1-alpha
    return {
        x: a.x*aalpha + b.x*alpha,
        y: a.y*aalpha + b.y*alpha
    }
}
u.copy = function( a ){
    return {
        x: a.x,
        y: a.y
    }
}

module.exports = u
