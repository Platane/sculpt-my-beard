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
var $tlm = document.querySelector('.app-timeLineMap')
var $cont = document.querySelector('.page-app')
var $body = document.body

var layouts_strategies = {}

layouts_strategies[0] = function( w, h ){

    var max_margin = 60
    var tl_min_h = 180

    h = Math.max(h, 550)

    // vertical

    var tlmh = 40

    var tlh = Math.max( Math.min( (h-tlmh) * 0.3, 320 ), tl_min_h )

    var mh = h - tlh - max_margin - tlmh

    if ( mh > 400 )
        mh *= 0.95

    if ( mh > 600 )
        mh = 600

    var m = ( h - mh - tlh - tlmh ) /6

    $main.style.top = m+'px'
    $main.style.height = mh+'px'

    $tlm.style.top = (m*4+mh)+'px'
    $tlm.style.height = tlmh+'px'

    $tl.style.top = (m*5+mh+tlmh)+'px'
    $tl.style.height = tlh+'px'

    $cont.style.height = h+'px'

    // horizontal

    var mw = w*0.8
    if ( mw<500 )
        mw = w*0.95
    if ( mw>1000 )
        mw = 1000

    $main.style.left =  $tlm.style.left = $tl.style.left = ((w-mw)/2)+'px'
    $main.style.width = $tlm.style.width = $tl.style.width = mw+'px'



    // css class for positionning

    $body.className = 'js-deferred-layout'
}

var renderLayout = function(){
    // /!\ hard reflow
    layouts_strategies[0]( document.body.offsetWidth, window.innerHeight );
}

var layoutTimeout = 0
var askRender = function(){
    window.clearTimeout(layoutTimeout)
    layoutTimeout = window.setTimeout( renderLayout, 200 )
}
renderLayout()

window.addEventListener('resize', askRender, false )






var $pageApp = document.querySelector('.page-app')
var autoScroll = false
var testScroll = function(){

    var scrollY = getSroll(document.body).y

    if ( Math.abs(scrollY - $pageApp.offsetTop) < 180 ) {
        autoScroll = true
        scrollTo(document.body, 0, $pageApp.offsetTop)
    }
}

var down = false
var pending = false

var scrollTimeout = 0
var askScroll = function(){
    if (autoScroll)
        return void ( autoScroll = false )

    window.clearTimeout(scrollTimeout)

    if ( down )
        pending = true
    else  {
        pending = false
        scrollTimeout = window.setTimeout( testScroll, 550 )
    }
}
var trackMouseDown = function( event ){
    if (event.type == 'mouseup') {
        if (pending) {
            pending = false
            window.clearTimeout(scrollTimeout)
            scrollTimeout = window.setTimeout( testScroll, 550 )
        }
        down = false
    } else if (event.type == 'mousedown' && event.which == 1 && event.currentTarget == document)
        down = true
}

window.addEventListener('scroll', askScroll, false )
window.addEventListener('resize', askScroll, false )

document.addEventListener('mousedown', trackMouseDown, false )
document.addEventListener('mouseup', trackMouseDown, false )
