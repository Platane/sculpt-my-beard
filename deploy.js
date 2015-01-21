var child_process = require('child_process')
  , Stream = require('stream').Stream
  , Promise = require('promise')
  , fs = require('fs')

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

// save state
exec('git stash')

//change branch to gh-master and checkout master
.then( exec.bind(null, 'git fetch') )
.then( exec.bind(null, 'git checkout gh-pages') )
.then( exec.bind(null, 'git checkout master -- .') )
.then( exec.bind(null, 'git reset') )

// build
.then( exec.bind(null, 'npm install') )
.then( exec.bind(null, 'node ./node_modules/gulp/bin/gulp.js build') )

// edit gitignore
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
        'deploy.sh',
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

.then( function(){
    return readVersion()
    .then(function( version ){
        return exec( 'git commit -m v'+version )
    })
})
.then(null, console.log.bind( console ))
