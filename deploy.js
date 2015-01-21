var child_process = require('child_process')
  , Promise = require('promise')
  , fs = require('fs')

var willPrint = function( x ){
    return function(){ console.log( x ) }
}

var exec = function( cmd ){
    return new Promise(function(resolve, reject){
        child_process.exec( cmd, function(err, out, code){
            if( err )
                reject({
                    err: err,
                    code: code,
                    cmd: cmd
                })
            resolve( out )
        })
    })
}

var readVersion = function(){
    return Promise.resolve( JSON.parse( fs.readFileSync('./package.json') ).version )
}
var incrVersion = function(incr, version){
    var s = incr.split('.'),
        before = true
    return version.split('.').map(function(x, i){
        if ( !before )
            return 0
        else if ( i<s.length && +s[i] ){
            before = false
            return (+x)+1
        }else
            return x
    }).join('.')
}
var bumpVersion = function(incr){
    var content = fs.readFileSync('./package.json')+''
    var version = incrVersion( incr, JSON.parse( content ).version )

    content = content.split('\n').map(function(x){
        var i
        if ((i=x.indexOf('"version"')<0))
            return x
        var f=x.split(':')
        f[1]='"'+version+'",'
        return f.join(':')
    }).join('\n')

    fs.writeFile( './package.json', content )
    return Promise.resolve()
}


// parse option
var incr = "0.0.1"
process.argv.forEach(function (val, index, array) {
    if (val == '-i')
        incr = array[ index +1 ]
});
var somethingStashed


// save state
exec('git stash')
.then( function( res ){
    somethingStashed = res.indexOf('No local changes')<0
})

//change branch to gh-master and checkout master
.then( willPrint( '-- change to gh-pages and checkout master' ) )
.then( exec.bind(null, 'git fetch') )
.then( exec.bind(null, 'git checkout gh-pages') )
.then( exec.bind(null, 'git checkout master -- .') )
.then( exec.bind(null, 'git reset') )

// build
.then( willPrint( '-- build' ) )
.then( willPrint( '--    npm install' ) )
.then( exec.bind(null, 'npm install') )
.then( willPrint( '--    gulp build' ) )
.then( exec.bind(null, 'env PRODUCTION_BUILD="1" node ./node_modules/gulp/bin/gulp.js build') )

// pause
.then(function(){
    return new Promise(function(resolve, reject){
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        console.log('  is the version sane ?');

        process.stdin.on('data', function (text) {
            process.stdin.pause();
            if (text[0] == 'n' || text[0] == 'N')
                reject('interrupt by user: version not sane')
            else
                resolve()
        })
    })
})


// edit gitignore
.then( willPrint( '-- edit gitignore and refresh repo' ) )
.then( function(){
    var gitignore = [
        'js',
        'css',
        'test',
        'node_modules',
        'npm-debug.log',
        '.tmp',
        '.travis.yml',
        'gulpFile.js',
        'deploy.js',
        'package.json',
        '!js/bundle.js',
        '!css/style.css',
    ].join('\n')
    fs.writeFile( './.gitignore', gitignore )
    return Promise.resolve()
})

// refresh after gitignore edition
.then( exec.bind(null, 'git rm -r . --cached > .tmp') )
.then( exec.bind(null, 'git add . > .tmp') )
.then( exec.bind(null, 'git add -f css/style.css js/bundle.js') ) // problem with gitignore I guess neithermind go buldozer

// commit
.then( willPrint( '-- commit and push' ) )
.then( function(){
    return readVersion()
    .then(function( version ){
        return exec( 'git commit -m "v'+incrVersion( incr, version )+'"' )
    })
})
.then( exec.bind(null, 'git push') )
.then( exec.bind(null, 'git checkout master') )

// bump version on master
.then( willPrint( '-- bump version' ) )
.then( bumpVersion.bind(null, incr) )
.then( exec.bind(null, 'git add package.json') )
.then( function(){
    return readVersion()
    .then(function( version ){
        return exec( 'git commit -m "bump version to '+version+'"' )
    })
})
.then( exec.bind(null, 'git push') )


// restore state
.then(function(){
    if (somethingStashed)
        return exec('git stash pop')
    else
        return Promise.resolve()
})

// catch error
.then(null, console.log.bind( console ))
