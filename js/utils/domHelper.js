module.exports = {
    hasClass : function( el , c ){
		return el.classList.contains(c)
	},
	addClass : function( el , c ){
		el.className += ' '+c
	},
	removeClass : function( el , c ){
		var nc=""
		for(var i=el.classList.length;i--; )
			if( c != el.classList[i] )
				nc += ' '+el.classList[i]
		el.className = nc
	},
	getParent : function( el , c ){
		while(true)
			if( el && !this.hasClass( el , c ) )
				el = el.parentElement
			else
				break;
		return el
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
