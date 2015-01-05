
var floor = function( x ){
    return (0|(x*100))/100;
}
var point = function( p ){
   return floor(p.x)+' '+floor(p.y)
}
var renderBezier = function( pts ){
    if( !pts.length )
        return ''
    var d='M'+point( pts[0] )
    for( var i = 1; i<pts.length ; i++ )
        switch( pts[i].type ){
            case 'F': d+='L'+point( pts[i] ); break
            case 'C': d+='Q'+point( pts[i++] )+' '+point( pts[i] ); break
        }
    return d+'z'
}
var renderLine = function( pts, close ){
    return 'M'+pts.reduce(function(p, c){
        return p+'L'+point(c)
    },'').slice(1)+( close ? 'z' : '' )
}


var svgNS = "http://www.w3.org/2000/svg";
var create = function( type ){
    return document.createElementNS( svgNS, type )
}

module.exports = {
    renderBezier : renderBezier,
    renderLine: renderLine,
    create: create,

    svgNS: svgNS
}
