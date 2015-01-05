var Abstract = require('../utils/Abstract')

var listener = {};

var dispatch = function( eventName, data ){


    if(true)
        switch(eventName){
            case 'ui-mousemove':
            case 'render3D-camera-change':
                break;
            default:
                console.log(eventName)
        }

    var l = listener[ eventName ] || []
    for( var i = l.length; i--;)
        l[i].fn(data, eventName)

    return this
}
var listen = function( eventName, fn , key ){
    ( listener[ eventName ] = listener[ eventName ] || [] ).push({
        fn: fn,
        key: key
    })
    return this
}
var unlisten = function( eventName, key ){
    var l = ( listener[ eventName ] = listener[ eventName ] || [] )
    for( var i = l.length; i--;)
        if( l[i].key == key )
            l.splice(i,1)
    return this
}
var hasListener = function( eventName, key ){
    return ( listener[ eventName ] || [] ).length
}

module.exports = Object.create( Abstract )
.extend({
    dispatch: dispatch,
    listen: listen,
    unlisten: unlisten,
    hasListener: hasListener
})
