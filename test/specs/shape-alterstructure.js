var Shape = require('../../js/model/data/shape')

describe('shape', function(){

    beforeEach(function(){
        this.shape = Object.create( Shape ).init()

        this.shape.sharpness = [
            {after:0, before:0.1},
            {after:0, before:0.2},
            {after:0, before:0.3},
            {after:0, before:0.4},
        ]
        this.shape.vertex = [
            {x:0, y:100},
            {x:0, y:200},
            {x:0, y:300},
            {x:0, y:400},
        ]
    })

    describe('add point', function(){
        describe('before', function(){
            beforeEach(function(){
                this.shape.addPoint( 0, false )
            })
            it('should have add vertex and sharpness', function(){
                expect( this.shape.sharpness.length ).toBe( 5 )
                expect( this.shape.vertex.length ).toBe( 5 )
            })
            it('should have add vertex and sharpness at right position', function(){
                expect( this.shape.sharpness[ 0 ].before ).toBe( 0 )
                expect( this.shape.vertex[ 0 ].y ).toBe( 0 )
            })
            it('should have a reindexOut array set in order to have the new point merged', function(){
                expect( this.shape.reindexOut[ 0 ] ).toBe( 1 )
                expect( this.shape.reindexOut[ 1 ] ).toBe( 1 )
                expect( this.shape.reindexOut[ 2 ] ).toBe( 2 )
                expect( this.shape.reindexOut[ 3 ] ).toBe( 3 )
                expect( this.shape.reindexOut[ 4 ] ).toBe( 4 )
            })
            it('should have a reindexIn array set in order to have mask the new point', function(){
                expect( this.shape.reindexIn[ 0 ] ).toBe( 1 )
                expect( this.shape.reindexIn[ 1 ] ).toBe( 2 )
                expect( this.shape.reindexIn[ 2 ] ).toBe( 3 )
                expect( this.shape.reindexIn[ 3 ] ).toBe( 4 )
            })
        })
        describe('after', function(){
            beforeEach(function(){
                this.shape.addPoint( 0, true )
            })
            it('should have add vertex and sharpness', function(){
                expect( this.shape.sharpness.length ).toBe( 5 )
                expect( this.shape.vertex.length ).toBe( 5 )
            })
            it('should have add vertex and sharpness at right position', function(){
                expect( this.shape.sharpness[ 1 ].before ).toBe( 0 )
                expect( this.shape.vertex[ 1 ].y ).toBe( 0 )
            })
            it('should have a reindexOut array set in order to have the new point merged', function(){
                expect( this.shape.reindexOut[ 0 ] ).toBe( 0 )
                expect( this.shape.reindexOut[ 1 ] ).toBe( 0 )
                expect( this.shape.reindexOut[ 2 ] ).toBe( 2 )
                expect( this.shape.reindexOut[ 3 ] ).toBe( 3 )
                expect( this.shape.reindexOut[ 4 ] ).toBe( 4 )
            })
            it('should have a reindexIn array set in order to have mask the new point', function(){
                expect( this.shape.reindexIn[ 0 ] ).toBe( 0 )
                expect( this.shape.reindexIn[ 1 ] ).toBe( 2 )
                expect( this.shape.reindexIn[ 2 ] ).toBe( 3 )
                expect( this.shape.reindexIn[ 3 ] ).toBe( 4 )
            })
        })
    })
    describe('remove point', function(){
        describe('before', function(){
            beforeEach(function(){
                this.shape.removePoint( 0, false )
            })
            it('should have remove vertex and sharpness', function(){
                expect( this.shape.sharpness.length ).toBe( 3 )
                expect( this.shape.vertex.length ).toBe( 3 )
            })
            it('should have remove vertex and sharpness at right position', function(){
                expect( this.shape.sharpness[ 0 ].before ).toBe( 0.2 )
                expect( this.shape.sharpness[ 1 ].before ).toBe( 0.3 )
                expect( this.shape.sharpness[ 2 ].before ).toBe( 0.4 )
                expect( this.shape.vertex[ 0 ].y ).toBe( 200 )
                expect( this.shape.vertex[ 1 ].y ).toBe( 300 )
                expect( this.shape.vertex[ 2 ].y ).toBe( 400 )
            })
            it('should have a reindexOut array set in order to have the point removed', function(){
                expect( !this.shape.reindexOut || this.shape.reindexOut[ 0 ] == 0 ).toBe( true )
                expect( !this.shape.reindexOut || this.shape.reindexOut[ 1 ] == 1 ).toBe( true )
                expect( !this.shape.reindexOut || this.shape.reindexOut[ 2 ] == 2 ).toBe( true )
            })
            it('should have a reindexIn array set in order to have the removed point merged with the absorber', function(){
                expect( this.shape.reindexIn[ 0 ] ).toBe( 2 )
                expect( this.shape.reindexIn[ 1 ] ).toBe( 0 )
                expect( this.shape.reindexIn[ 2 ] ).toBe( 1 )
                expect( this.shape.reindexIn[ 3 ] ).toBe( 2 )
            })
        })
        describe('after', function(){
            beforeEach(function(){
                this.shape.removePoint( 0, true )
            })
            it('should have remove vertex and sharpness', function(){
                expect( this.shape.sharpness.length ).toBe( 3 )
                expect( this.shape.vertex.length ).toBe( 3 )
            })
            it('should have remove vertex and sharpness at right position', function(){
                expect( this.shape.sharpness[ 0 ].before ).toBe( 0.2 )
                expect( this.shape.sharpness[ 1 ].before ).toBe( 0.3 )
                expect( this.shape.sharpness[ 2 ].before ).toBe( 0.4 )
                expect( this.shape.vertex[ 0 ].y ).toBe( 200 )
                expect( this.shape.vertex[ 1 ].y ).toBe( 300 )
                expect( this.shape.vertex[ 2 ].y ).toBe( 400 )
            })
            it('should have a reindexOut array set in order to have the point removed', function(){
                expect( !this.shape.reindexOut || this.shape.reindexOut[ 0 ] == 0 ).toBe( true )
                expect( !this.shape.reindexOut || this.shape.reindexOut[ 1 ] == 1 ).toBe( true )
                expect( !this.shape.reindexOut || this.shape.reindexOut[ 2 ] == 2 ).toBe( true )
            })
            it('should have a reindexIn array set in order to have the removed point merged with the absorber', function(){
                expect( this.shape.reindexIn[ 0 ] ).toBe( 0 )
                expect( this.shape.reindexIn[ 1 ] ).toBe( 0 )
                expect( this.shape.reindexIn[ 2 ] ).toBe( 1 )
                expect( this.shape.reindexIn[ 3 ] ).toBe( 2 )
            })
        })
    })
    describe('remove then add point', function(){
        describe('remove before, add before', function(){
            beforeEach(function(){
                this.shape.removePoint( 0, false )
                this.shape.addPoint( 0, false )
            })
            it('should have vertex and sharpness array right', function(){
                expect( this.shape.sharpness[ 0 ].before ).toBe( 0 )
                expect( this.shape.sharpness[ 1 ].before ).toBe( 0.2 )
                expect( this.shape.sharpness[ 2 ].before ).toBe( 0.3 )
                expect( this.shape.sharpness[ 3 ].before ).toBe( 0.4 )
                expect( this.shape.vertex[ 0 ].y ).toBe( 0 )
                expect( this.shape.vertex[ 1 ].y ).toBe( 200 )
                expect( this.shape.vertex[ 2 ].y ).toBe( 300 )
                expect( this.shape.vertex[ 3 ].y ).toBe( 400 )
            })
            it('should have a reindex arrays null', function(){
                expect( !this.shape.reindexOut ).toBe( true )
                expect( !this.shape.reindexIn ).toBe( true )
            })
        })
        describe('remove after, add after', function(){
            beforeEach(function(){
                this.shape.removePoint( 0, true )
                this.shape.addPoint( 0, true )
            })
            it('should have vertex and sharpness array right', function(){
                expect( this.shape.sharpness[ 0 ].before ).toBe( 0 )
                expect( this.shape.sharpness[ 1 ].before ).toBe( 0.2 )
                expect( this.shape.sharpness[ 2 ].before ).toBe( 0.3 )
                expect( this.shape.sharpness[ 3 ].before ).toBe( 0.4 )
                expect( this.shape.vertex[ 0 ].y ).toBe( 0 )
                expect( this.shape.vertex[ 1 ].y ).toBe( 200 )
                expect( this.shape.vertex[ 2 ].y ).toBe( 300 )
                expect( this.shape.vertex[ 3 ].y ).toBe( 400 )
            })
            it('should have a reindex arrays null', function(){
                expect( !this.shape.reindexOut ).toBe( true )
                expect( !this.shape.reindexIn ).toBe( true )
            })
        })
    })
})
