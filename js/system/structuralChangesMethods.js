

var add = function( arr, i, k ){

    // check if this point is not removed
    var u = arr.reduce( function(p, x, i_){
        return x.type = 'del' && x.i == i ? i_ : p
    }, -1)

    if( false && u>= 0 ){
        // its removed before, readd it and ignore the rest
        // TODO maybe move it also idk

        arr.splice( u, 1 )

        // keep consistancy
        // TODO
    }



    // keep consistancy
    for(var u=arr.length; u--; )
        if( arr[u].i >= i )
            arr[u].i ++

    // push the change
    arr.push({type: 'add', i:i, k:k})
}

var del = function( arr, i, k ){

    // check if this point is not added
    var u = arr.reduce( function(p, x, i_){
        return x.type = 'add' && x.i == i ? i_ : p
    }, -1)

    if( false && u>= 0 ){
        // TODO
    }

    // push the change
    arr.push({type: 'del', i:i, k:k})
}




module.exports = {
    add: add,
    del: del,
}
