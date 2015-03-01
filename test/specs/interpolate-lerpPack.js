var Face = require('../../js/model/data/face')
  , Line = require('../../js/model/data/line')
  , Shape = require('../../js/model/data/shape')
  , historizable = require('../../js/model/mixin/historizable')
  , interpolate = require('../../js/system/interpolate')

describe('interpolate', function(){
    describe('lerpPack', function(){
        describe('shape', function(){
            describe('no structural changes', function(){
                beforeEach(function(){

                    var shape1 = Object.create( Shape ).init()
                    var shape2 = Object.create( Shape ).init()

                    shape1.vertex = [
                        {x:0, y:0},
                        {x:100, y:100},
                    ]
                    shape2.vertex = [
                        {x:0, y:100},
                        {x:100, y:100},
                    ]

                    shape1.sharpness = [
                        {before: 0, after: 0},
                        {before: 0, after: 0},
                    ]
                    shape2.sharpness = [
                        {before: 1, after: 0},
                        {before: 1, after: 0},
                    ]

                    this.res = interpolate.lerpPack( shape1.pack(), shape2.pack(), 0.4 )

                    this.shape3 = Object.create( Shape ).init()
                    this.shape3.unpack( this.res )
                })
                it('should lerp vertex', function(){
                    expect( this.shape3.vertex.length ).toBe( 2 )
                    expect( this.shape3.vertex[0].x ).toBe( 0 )
                    expect( this.shape3.vertex[0].y ).toBe( 40 )
                    expect( this.shape3.vertex[1].x ).toBe( 100 )
                    expect( this.shape3.vertex[1].y ).toBe( 100 )
                })
                it('should lerp sharpness', function(){
                    expect( this.shape3.sharpness.length ).toBe( 2 )
                    expect( this.shape3.sharpness[0].before ).toBe( 0.4 )
                    expect( this.shape3.sharpness[0].after ).toBe( 0 )
                    expect( this.shape3.sharpness[1].before ).toBe( 0.4 )
                    expect( this.shape3.sharpness[1].after ).toBe( 0 )
                })
                it('reindex should be null', function(){
                    expect( !this.shape3.reindex ).toBe( true )
                })
            })
            describe('spawn point', function(){
                beforeEach(function(){

                    var shape1 = Object.create( Shape ).init()
                    var shape2 = Object.create( Shape ).init()

                    shape1.vertex = [
                        {x:0, y:0},
                        {x:100, y:200},
                        {x:100, y:100},
                    ]
                    shape1.reindex = [ 0,2,2 ]
                    shape2.vertex = [
                        {x:0, y:100},
                        {x:100, y:200},
                        {x:100, y:100},
                    ]

                    shape1.sharpness = [
                        {before: 0, after: 0},
                        {before: 0, after: 1},
                        {before: 0, after: 0},
                    ]
                    shape2.sharpness = [
                        {before: 1, after: 0},
                        {before: 0, after: 1},
                        {before: 0, after: 1},
                    ]

                    this.res = interpolate.lerpPack( shape1.pack(), shape2.pack(), 0.4 )

                    this.shape3 = Object.create( Shape ).init()
                    this.shape3.unpack( this.res )
                })
                it('should lerp vertex', function(){
                    expect( this.shape3.vertex.length ).toBe( 3 )
                    expect( this.shape3.vertex[0].x ).toBe( 0 )
                    expect( this.shape3.vertex[0].y ).toBe( 40 )
                    expect( this.shape3.vertex[1].x ).toBe( 100 )
                    expect( this.shape3.vertex[1].y ).toBe( 140 )
                    expect( this.shape3.vertex[2].x ).toBe( 100 )
                    expect( this.shape3.vertex[2].y ).toBe( 100 )
                })
                it('should lerp sharpness', function(){
                    expect( this.shape3.sharpness.length ).toBe( 3 )
                    expect( this.shape3.sharpness[0].before ).toBe( 0.4 )
                    expect( this.shape3.sharpness[0].after ).toBe( 0 )
                    expect( this.shape3.sharpness[1].before ).toBe( 0 )
                    expect( this.shape3.sharpness[1].after ).toBe( 0.4 )
                    expect( this.shape3.sharpness[2].after ).toBe( 0.4 )
                    expect( this.shape3.sharpness[2].before ).toBe( 0 )
                })
                it('reindex should be null', function(){
                    expect( !this.shape3.reindex ).toBe( true )
                })
            })

            describe('absorb point', function(){
                beforeEach(function(){

                    var shape1 = Object.create( Shape ).init()
                    var shape2 = Object.create( Shape ).init()

                    shape1.vertex = [
                        {x:0, y:0},
                        {x:100, y:200},
                        {x:100, y:100},
                    ]
                    shape2.vertex = [
                        {x:0, y:100},
                        {x:100, y:200},
                        {x:100, y:100},
                    ]
                    shape2.reindex = [ 0,2,2 ]

                    shape1.sharpness = [
                        {before: 0, after: 0},
                        {before: 0, after: 1},
                        {before: 0, after: 0},
                    ]
                    shape2.sharpness = [
                        {before: 1, after: 0},
                        {before: 0, after: 1},
                        {before: 1, after: 0},
                    ]

                    this.res = interpolate.lerpPack( shape1.pack(), shape2.pack(), 0.4 )

                    this.shape3 = Object.create( Shape ).init()
                    this.shape3.unpack( this.res )
                })
                it('should lerp vertex', function(){
                    expect( this.shape3.vertex.length ).toBe( 3 )
                    expect( this.shape3.vertex[0].x ).toBe( 0 )
                    expect( this.shape3.vertex[0].y ).toBe( 40 )
                    expect( this.shape3.vertex[1].x ).toBe( 100 )
                    expect( this.shape3.vertex[1].y ).toBe( 160 )
                    expect( this.shape3.vertex[2].x ).toBe( 100 )
                    expect( this.shape3.vertex[2].y ).toBe( 100 )
                })
                it('should lerp sharpness', function(){
                    expect( this.shape3.sharpness.length ).toBe( 3 )
                    expect( this.shape3.sharpness[0].before ).toBe( 0.4 )
                    expect( this.shape3.sharpness[0].after ).toBe( 0 )
                    expect( this.shape3.sharpness[1].before ).toBe( 0.4 )
                    expect( this.shape3.sharpness[1].after ).toBe( 0.6 )
                    expect( this.shape3.sharpness[2].after ).toBe( 0 )
                    expect( this.shape3.sharpness[2].before ).toBe( 0.4 )
                })
                it('reindex should be null', function(){
                    expect( !this.shape3.reindex ).toBe( true )
                })
            })
            describe('interpolate on exact same point', function(){
                beforeEach(function(){

                    var shape1 = Object.create( Shape ).init()
                    var shape2 = Object.create( Shape ).init()

                    shape1.vertex = [
                        {x:0, y:0},
                        {x:100, y:200},
                        {x:100, y:100},
                    ]
                    shape2.vertex = [
                        {x:0, y:100},
                        {x:100, y:200},
                        {x:100, y:100},
                    ]
                    shape2.reindex = [ 0,1,2 ]

                    shape1.sharpness = [
                        {before: 0, after: 0},
                        {before: 0, after: 1},
                        {before: 0, after: 0},
                    ]
                    shape2.sharpness = [
                        {before: 1, after: 0},
                        {before: 0, after: 1},
                        {before: 1, after: 0},
                    ]

                    this.res = interpolate.lerpPack( shape1.pack(), shape2.pack(), 1 )

                    this.shape3 = Object.create( Shape ).init()
                    this.shape3.unpack( this.res )
                })
                it('should lerp vertex', function(){
                    expect( this.shape3.vertex.length ).toBe( 3 )
                    expect( this.shape3.vertex[0].x ).toBe( 0 )
                    expect( this.shape3.vertex[0].y ).toBe( 100 )
                    expect( this.shape3.vertex[1].x ).toBe( 100 )
                    expect( this.shape3.vertex[1].y ).toBe( 200 )
                    expect( this.shape3.vertex[2].x ).toBe( 100 )
                    expect( this.shape3.vertex[2].y ).toBe( 100 )
                })
                it('should lerp sharpness', function(){
                    expect( this.shape3.sharpness.length ).toBe( 3 )
                    expect( this.shape3.sharpness[0].before ).toBe( 1 )
                    expect( this.shape3.sharpness[0].after ).toBe( 0 )
                    expect( this.shape3.sharpness[1].before ).toBe( 0 )
                    expect( this.shape3.sharpness[1].after ).toBe( 1 )
                    expect( this.shape3.sharpness[2].before ).toBe( 1 )
                    expect( this.shape3.sharpness[2].after ).toBe( 0 )
                })
                it('reindex should not be null', function(){
                    expect( !!this.shape3.reindex ).toBe( true )
                })
                it('reindex should be the same as b', function(){
                    expect( this.shape3.reindex.length ).toBe( 3 )
                    expect( this.shape3.reindex[0] ).toBe( 0 )
                    expect( this.shape3.reindex[1] ).toBe( 1 )
                    expect( this.shape3.reindex[2] ).toBe( 2 )
                })
            })
        })
        describe('line', function(){
            beforeEach(function(){

                var line1 = Object.create( Line ).init()
                var line2 = Object.create( Line ).init()

                line1.line = [
                    {x:100, y:100},
                    {x:101, y:101},
                    {x:102, y:102},
                    {x:103, y:103},
                ]
                line2.line = [
                    {x:200, y:200},
                    {x:201, y:201},
                    {x:202, y:202},
                    {x:203, y:203},
                ]

                line1.width = [100, 101, 102, 103]
                line2.width = [200, 201, 202, 203]

                line1.sharpness = [

                    {before: 0.121, after: 0},
                    {before: 0.111, after: 0},

                    {before: 0.1, after: 0},

                    {before: 0.112, after: 0},
                    {before: 0.122, after: 0},

                    {before: 0.13, after: 0},
                ]
                line2.sharpness = [

                    {before: 0.221, after: 0},
                    {before: 0.211, after: 0},

                    {before: 0.2, after: 0},

                    {before: 0.212, after: 0},
                    {before: 0.222, after: 0},

                    {before: 0.23, after: 0},
                ]

                this.line1 = line1
                this.line2 = line2
            })
            describe('with structural no change', function(){

                beforeEach(function(){
                    this.res = interpolate.lerpPack( this.line1.pack(), this.line2.pack(), 0.4 )

                    this.shape3 = Object.create( Shape ).init()
                    this.shape3.unpack( this.res )
                })
                it('should lerp line', function(){
                    expect( this.shape3.line.length ).toBe( 4 )
                    expect( this.shape3.line[0].x ).toBe( 140 )
                    expect( this.shape3.line[0].y ).toBe( 140 )
                })
                it('should lerp width', function(){
                    expect( this.shape3.width.length ).toBe( 4 )
                    expect( this.shape3.width[0] ).toBe( 140 )
                })
                it('should lerp sharpness', function(){
                    expect( this.shape3.sharpness.length ).toBe( 6 )
                    expect( this.shape3.sharpness[0].before ).toBe( 0.161 )
                    expect( this.shape3.sharpness[1].before ).toBe( 0.151 )

                    expect( this.shape3.sharpness[2].before ).toBe( 0.14 )

                    expect( this.shape3.sharpness[3].before ).toBe( 0.152 )
                    expect( this.shape3.sharpness[4].before ).toBe( 0.162 )

                    expect( this.shape3.sharpness[5].before ).toBe( 0.17 )
                    for( var i=6; i--; )
                        expect( this.shape3.sharpness[i].after ).toBe( 0 )
                })
            })
            describe('with structural on line body change', function(){

                beforeEach(function(){

                    this.line1.reindex = [0, 1, 1, 3]


                    this.res = interpolate.lerpPack( this.line1.pack(), this.line2.pack(), 0.4 )

                    this.shape3 = Object.create( Shape ).init()
                    this.shape3.unpack( this.res )
                })
                it('should lerp sharpness', function(){
                    expect( this.shape3.sharpness.length ).toBe( 6 )
                    expect( this.shape3.sharpness[0].before ).toBe( 0.111 * 0.6 + 0.221 * 0.4 ) // impacted by 2
                    expect( this.shape3.sharpness[1].before ).toBe( 0.151 ) // impacted by 1

                    expect( this.shape3.sharpness[2].before ).toBe( 0.14 ) // impacted by 0

                    expect( this.shape3.sharpness[3].before ).toBe( 0.152 ) // impacted by 1
                    expect( this.shape3.sharpness[4].before ).toBe( 0.112 * 0.6 + 0.222 * 0.4 ) // impacted by 2

                    expect( this.shape3.sharpness[5].before ).toBe( 0.17 ) // impacted by 3
                    for( var i=6; i--; )
                        expect( this.shape3.sharpness[i].after ).toBe( 0 )
                })
            })
            describe('with structural on extrema change', function(){

                beforeEach(function(){

                    this.line1.reindex = [0, 1, 2, 0]


                    this.res = interpolate.lerpPack( this.line1.pack(), this.line2.pack(), 0.4 )

                    this.shape3 = Object.create( Shape ).init()
                    this.shape3.unpack( this.res )
                })
                it('should lerp sharpness', function(){
                    expect( this.shape3.sharpness.length ).toBe( 6 )
                    expect( this.shape3.sharpness[0].before ).toBe( 0.161 ) // impacted by 2
                    expect( this.shape3.sharpness[1].before ).toBe( 0.151 ) // impacted by 1

                    expect( this.shape3.sharpness[2].before ).toBe( 0.14 ) // impacted by 0

                    expect( this.shape3.sharpness[3].before ).toBe( 0.152 ) // impacted by 1
                    expect( this.shape3.sharpness[4].before ).toBe( 0.162 ) // impacted by 2

                    expect( this.shape3.sharpness[5].before ).toBe( 0.10 * 0.6 + 0.23 * 0.4 ) // impacted by 3
                    for( var i=6; i--; )
                        expect( this.shape3.sharpness[i].after ).toBe( 0 )
                })
            })
        })
    })
})
