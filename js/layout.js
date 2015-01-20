var scrollTo=function(el,scrollx,scrolly){
    if(el.scrollTo){
        el.scrollTo(scrollx,scrolly);
        return;
    }
    if(el.scrollLeft !== null && el.scrollTop !== null){
        el.scrollLeft=scrollx;
        el.scrollTop=scrolly;
        return;
    }
    if(el.scrollX !== null && el.scrollY !== null){
        el.scrollX=scrollx;
        el.scrollY=scrolly;
        return;
    }
    throw 'unable to scroll';
};

var getSroll=function(el){
    if(el.scrollLeft !== null && el.scrollTop !== null)
        return {
            x:el.scrollLeft,
            y:el.scrollTop
        };
    if(el.scrollX !== null && el.scrollY !== null)
        return {
            x:el.scrollX,
            y:el.scrollY
        };
    if (el.pageXOffset !== null && el.pageYOffset !== null)
        return {
            x:el.pageXOffset,
            y:el.pageYOffset
        };
    throw 'unable to scroll';
};



var $main = document.querySelector('.app-draw-zone')
var $tl = document.querySelector('.app-timeLine')
var $cont = document.querySelector('.page-app')
var $body = document.body

var layouts_strategies = {}

layouts_strategies[0] = function( w, h ){

    var max_margin = 30
    var tl_min_h = 200

    h = Math.max(h, 550)

    // vertical

    var tlh = tl_min_h

    var mh = h - tlh - max_margin

    if ( mh > 400 )
        mh *= 0.95

    if ( mh > 600 )
        mh = 600

    var m = ( h - mh - tlh ) /4

    $main.style.top = m+'px'
    $main.style.height = mh+'px'

    $tl.style.top = (m*3+mh)+'px'
    $tl.style.height = tlh+'px'

    $cont.style.height = h+'px'

    // horizontal

    var mw = w*0.8
    if ( mw<500 )
        mw = w*0.95
    if ( mw>1000 )
        mw = 1000

    $main.style.left = $tl.style.left = ((w-mw)/2)+'px'
    $main.style.width = $tl.style.width = mw+'px'



    // css class for positionning

    $body.className = 'js-deferred-layout'
}

var renderLayout = function(){
    // /!\ hard reflow
    layouts_strategies[0]( document.body.offsetWidth, window.innerHeight );
}

var timeout = 0
var askRender = function(){
    window.clearTimeout(timeout)
    timeout = window.setTimeout( renderLayout, 200 )
}

window.addEventListener('resize', askRender, false )

module.exports = {
    render: renderLayout
}
