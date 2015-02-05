module.exports = {
    hasClass : function( el , c ){
		return el.classList.contains(c)
	},
	addClass : function( el , c ){
        if( !this.hasClass( el, c ) )
		      el.setAttribute('class', el.getAttribute('class') +' '+ c )
	},
	removeClass : function( el , c ){
        if( !this.hasClass( el, c ) )
            return
		var nc = ''
        var cs = el.getAttribute('class').trim().split(' ')
		for(var i=cs.length;i--; )
			if( c != cs[i] )
				nc += ' '+cs[i]
        el.setAttribute('class', nc )
	},
	getParent : function( el , c ){
		while(true)
			if( el && !this.hasClass( el , c ) )
				el = el.parentElement
			else
				break;
		return el
	},
    offset : function( el ){
        // TODO consider scroll
        var o = {
            left:0,
            top:0
        }
        while( el && el.offsetLeft !== null){
            o.left += el.offsetLeft
            o.top += el.offsetTop

            el = el.parentElement
        }
        return o
    },
	bind : function( el , eventName , fn ){

		var l = eventName.split(' ')
		if( l.length>1 ){
			for(var i=l.length;i--;)
				this.bind( el , l[i] , fn )
			return
		}


		el._bindHandlers = el._bindHandlers || {}

		this.unbind( el , eventName )

		el.addEventListener( eventName.split('.')[0] , fn , false )
		el._bindHandlers[ eventName ] = fn
	},
	unbind : function( el , eventName ){

		var l = eventName.split(' ')
		if( l.length>1 ){
			for(var i=l.length;i--;)
				this.unbind( el , l[i] )
			return
		}

		if( !el._bindHandlers || !el._bindHandlers[ eventName ] )
			return

		el.removeEventListener( eventName.split('.')[0] , el._bindHandlers[ eventName ] , false )
		el._bindHandlers[ eventName ] = null
	},
    domify : (function(){
        if( typeof document != 'object' )
            return function(){}
        var tank = document.createElement('div')
        return function( tpl ){
            tank.innerHTML = tpl
            var domEl = tank.children[ 0 ]
            tank.innerHTML = ''
            return domEl
        }
    })()
}
