var Abstract = require('../../utils/Abstract')
  , historizable = require('../mixin/historizable')


/*
 * keys is a set labeld by chunk each item is a array containing { date, pack }
 *
 */
var init = function( type ){

    this.keys = {}

    return this
}

var sortFn = function(a, b){return a.date<b.date ? -1 : 1}

var addOrSetKey = function( chunk, date, pack ){

    // TODO smart thing

    if( !this.keys[ chunk ] )
        this.keys[ chunk ] = []

    for(var i=this.keys[ chunk ].length; i--;)
        if( this.keys[ chunk ][ i ].date == date ){
            this.keys[ chunk ][ i ].pack = pack
            return this.keys[ chunk ][ i ]
        }

    var k
    this.keys[ chunk ].push(k = {
        date: date,
        pack: pack,
        structuralChanges: []
    })
    this.keys[ chunk ].sort( sortFn )

    return k
}
var removeKey = function( chunk, key ){
    var i
    if( !this.keys[ chunk ] || ( i=this.keys[ chunk ].indexOf( key ) ) <=-1 )
        return
    return this.keys[ chunk ].splice( i, 1 )[ 0 ]
}
var setKeyDate = function( chunk, key, date ){

    // TODO smart thing

    key.date = date
    this.keys[ chunk ].sort( sortFn )

    return key
}

var locate = function( chunk, date ){

    var keys = this.keys[ chunk ]

    // dichotomie

    var a = 0
    var b = keys.length-1
    var e

    if ( date < keys[ a ].date ){

        return { a: null, b: keys[ a ] }

    }else if ( keys[ b ].date <= date ){

        return { a: keys[ b ], b: null }

    }else{

        do{

            e = (a+b)>>1

            if( keys[ e ].date <= date )

                a = e

            else

                b = e

        }while( b-a>1 )

        return { a: keys[ e ], b: keys[ e +1 ] }
    }
}

module.exports = Object.create( Abstract )
.extend( historizable )
.extend({
    init: init,
    addOrSetKey: addOrSetKey,
    setKeyDate: setKeyDate,
    removeKey: removeKey,

    locate: locate
})
