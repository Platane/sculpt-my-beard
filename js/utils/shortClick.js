;(function(){

var startTime,
    startElement,
    startPos = {}

document.addEventListener('mousedown',function(event){
    startTime =event.timeStamp
    startElement = event.target
    startPos.x = event.pageX
    startPos.y = event.pageY
})

document.addEventListener('mouseup',function(event){
    if( startElement!=event.target
        || event.timeStamp - startTime > 200
        || Math.abs(startPos.x - event.pageX) > 25
        || Math.abs(startPos.y - event.pageY) > 25
    )
        return

    var clickevent = new MouseEvent('shortclick',event);

    event.target.dispatchEvent(clickevent);
})

})()
