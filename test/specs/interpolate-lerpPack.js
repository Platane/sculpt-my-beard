var Face = require('../../js/model/data/face')
  , Shape = require('../../js/model/data/shape')
  , Line = require('../../js/model/data/line')
  , historizable = require('../../js/model/mixin/historizable')
  , interpolate = require('../../js/system/interpolate')

describe('interpolate', function(){
    describe('lerpPack', function(){
        describe('shape', function(){
            /*
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
            })
            describe('spawn point', function(){
                beforeEach(function(){

                    var shape1 = Object.create( Shape ).init()
                    var shape2 = Object.create( Shape ).init()

                    shape1.vertex = [
                        {x:0, y:0},
                        {x:100, y:200, spawnFrom:'after'},
                        {x:100, y:100},
                    ]
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
                        {x:100, y:200, absorbedBy:'after'},
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
            })
            */
        })
    })
})
