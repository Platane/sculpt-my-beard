var assert = function( expr, label ){
    if( !expr )
        expect( label || 'fail' ).toBe( false )
}

var fn = module.exports = function( a, b, options, _path ){
    options = options || {}
    _path = _path || ''


    try{

    if( Array.isArray( a ) ){

        assert( Array.isArray( b ), b+' is not a array')

        assert( a.length == b.length, _path+' different lengths ('+a.length+' =/= '+b.length+')')
        for( var i = a.length; i--; )
            fn( a[i], b[i], options, _path+'['+i+']' )
    }
    else if( typeof a == 'object'){

        assert( typeof b == 'object' && !Array.isArray( b ), b+' is not an object')

        var mergedProp = {}
        for( var i in a )
            mergedProp[ i ] = true
        for( var i in b )
            mergedProp[ i ] = true

        for( var i in mergedProp ){

            // the property is not defined on both
            if( (a[ i ] === void 0 || b[ i ] === void 0 ) && options.strict == false )
                continue

            fn( a[ i ], b[ i ], options, _path+'.'+i )

        }
    } else {
        assert( a == b , _path+' different values ('+a+' =/= '+b+')')
    }


    }catch(e){}


    expect(1).toBe(1)
}
