;(function(){

var startTime,
    startElement,
    startPos = {},
    phase = 0

document.addEventListener('mousedown',function(event){
    if ( phase == 0 || event.timeStamp - startTime > 400 ){

        startTime = event.timeStamp
        startElement = event.target
        startPos.x = event.pageX
        startPos.y = event.pageY
        phase=1

    } else {
        phase++
    }
})

document.addEventListener('mouseup',function(event){

    if( startElement!=event.target
        || event.timeStamp - startTime > 400
        || Math.abs(startPos.x - event.pageX) > 25
        || Math.abs(startPos.y - event.pageY) > 25
    )
        return void ( phase = 0 )

    if( phase >= 2 ){
        var clickevent = new MouseEvent('doubleclick',event);

        event.target.dispatchEvent(clickevent);

        phase = 0;
    }
})

})()
