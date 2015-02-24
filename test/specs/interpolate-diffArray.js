var interpolate = require('../../js/system/interpolate')

describe('interpolate', function(){
    describe('diffArray', function(){
        describe('point spawned before', function(){
            beforeEach(function(){

                var a = [
                    {label: 'B'},
                    {label: 'A', spawnFrom: 'after'},
                    {label: 'C'},
                ]

                var b = [
                    {label: 'Z'},
                    {label: 'X'},
                    {label: 'Y'},
                ]

                this.res = interpolate.t.diffArray( a, b )
            })
            it('should compute the A replacement vector', function(){
                expect( this.res.a.length ).toBe( 3 )
                expect( this.res.a[ 0 ] ).toBe( 0 )
                expect( this.res.a[ 1 ] ).toBe( 2 )
                expect( this.res.a[ 2 ] ).toBe( 2 )
            })
            it('should compute the B replacement vector', function(){
                expect( this.res.b.length ).toBe( 3 )
                expect( this.res.b[ 0 ] ).toBe( 0 )
                expect( this.res.b[ 1 ] ).toBe( 1 )
                expect( this.res.b[ 2 ] ).toBe( 2 )
            })
        })
        describe('point spawned after', function(){
            beforeEach(function(){

                var a = [
                    {label: 'B'},
                    {label: 'C'},
                ]

                var b = [
                    {label: 'Z'},
                    {label: 'X', spawnFrom: 'after'},
                    {label: 'Y'},
                ]

                this.res = interpolate.t.diffArray( a, b )
            })
            it('should compute the A replacement vector', function(){
                expect( this.res.a.length ).toBe( 2 )
                expect( this.res.a[ 0 ] ).toBe( 0 )
                expect( this.res.a[ 1 ] ).toBe( 1 )
            })
            it('should compute the B replacement vector', function(){
                expect( this.res.b.length ).toBe( 2 )
                expect( this.res.b[ 0 ] ).toBe( 0 )
                expect( this.res.b[ 1 ] ).toBe( 2 )
            })
        })

        describe('point absorbed before', function(){
            beforeEach(function(){

                var a = [
                    {label: 'B'},
                    {label: 'A', absorbedBy: 'after'},
                    {label: 'C'},
                ]

                var b = [
                    {label: 'Z'},
                    {label: 'Y'},
                ]

                this.res = interpolate.t.diffArray( a, b )
            })
            it('should compute the A replacement vector', function(){
                expect( this.res.a.length ).toBe( 2 )
                expect( this.res.a[ 0 ] ).toBe( 0 )
                expect( this.res.a[ 1 ] ).toBe( 2 )
            })
            it('should compute the B replacement vector', function(){
                expect( this.res.b.length ).toBe( 2 )
                expect( this.res.b[ 0 ] ).toBe( 0 )
                expect( this.res.b[ 1 ] ).toBe( 1 )
            })
        })

        describe('point absorbed after', function(){
            beforeEach(function(){

                var a = [
                    {label: 'B'},
                    {label: 'A'},
                    {label: 'C'},
                ]

                var b = [
                    {label: 'Z'},
                    {label: 'X', absorbedBy: 'after'},
                    {label: 'Y'},
                ]

                this.res = interpolate.t.diffArray( a, b )
            })
            it('should compute the A replacement vector', function(){
                expect( this.res.a.length ).toBe( 3 )
                expect( this.res.a[ 0 ] ).toBe( 0 )
                expect( this.res.a[ 1 ] ).toBe( 1 )
                expect( this.res.a[ 2 ] ).toBe( 2 )
            })
            it('should compute the B replacement vector', function(){
                expect( this.res.b.length ).toBe( 3 )
                expect( this.res.b[ 0 ] ).toBe( 0 )
                expect( this.res.b[ 1 ] ).toBe( 2 )
                expect( this.res.b[ 2 ] ).toBe( 2 )
            })
        })

        describe('point spawned before combinaison', function(){
            beforeEach(function(){

                var a = [
                    {label: 'B', spawnFrom: 'after'},
                    {label: 'Y', spawnFrom: 'after'},
                    {label: 'C'},
                    {label: 'H'},
                    {label: 'Y', spawnFrom: 'before'},
                    {label: 'J'},
                    {label: 'N', spawnFrom: 'after'},
                ]

                var b = [
                    {label: 'Z'},
                    {label: 'X'},
                    {label: 'Y'},
                    {label: 'Y'},
                    {label: 'Y'},
                    {label: 'Y'},
                    {label: 'Y'},
                ]

                this.res = interpolate.t.diffArray( a, b )
            })
            it('should compute the A replacement vector', function(){
                expect( this.res.a.length ).toBe( 7 )
                expect( this.res.a[ 0 ] ).toBe( 2 )
                expect( this.res.a[ 1 ] ).toBe( 2 )
                expect( this.res.a[ 2 ] ).toBe( 2 )
                expect( this.res.a[ 3 ] ).toBe( 3 )
                expect( this.res.a[ 4 ] ).toBe( 3 )
                expect( this.res.a[ 5 ] ).toBe( 5 )
                expect( this.res.a[ 6 ] ).toBe( 2 )
            })
            it('should compute the B replacement vector', function(){
                expect( this.res.b.length ).toBe( 7 )
                expect( this.res.b[ 0 ] ).toBe( 0 )
                expect( this.res.b[ 1 ] ).toBe( 1 )
                expect( this.res.b[ 2 ] ).toBe( 2 )
                expect( this.res.b[ 3 ] ).toBe( 3 )
                expect( this.res.b[ 4 ] ).toBe( 4 )
                expect( this.res.b[ 5 ] ).toBe( 5 )
                expect( this.res.b[ 6 ] ).toBe( 6 )
            })
        })



        describe('point spawned after combinaison', function(){
            beforeEach(function(){

                var a = [
                    {label: 'B'},
                    {label: 'Y'},
                    {label: 'C'},
                    {label: 'H'},
                    {label: 'Y'},
                    {label: 'J'},
                    {label: 'N'},
                ]

                var b = [
                    {label: 'Z', absorbedBy: 'before'},
                    {label: 'X', absorbedBy: 'before'},
                    {label: 'Y', absorbedBy: 'after'},
                    {label: 'Y'},
                    {label: 'Y'},
                    {label: 'Y'},
                    {label: 'Y', absorbedBy: 'before'},
                ]

                this.res = interpolate.t.diffArray( a, b )
            })
            it('should compute the A replacement vector', function(){
                expect( this.res.a.length ).toBe( 7 )
                expect( this.res.a[ 0 ] ).toBe( 0 )
                expect( this.res.a[ 1 ] ).toBe( 1 )
                expect( this.res.a[ 2 ] ).toBe( 2 )
                expect( this.res.a[ 3 ] ).toBe( 3 )
                expect( this.res.a[ 4 ] ).toBe( 4 )
                expect( this.res.a[ 5 ] ).toBe( 5 )
                expect( this.res.a[ 6 ] ).toBe( 6 )
            })
            it('should compute the B replacement vector', function(){
                expect( this.res.b.length ).toBe( 7 )
                expect( this.res.b[ 0 ] ).toBe( 5 )
                expect( this.res.b[ 1 ] ).toBe( 5 )
                expect( this.res.b[ 2 ] ).toBe( 3 )
                expect( this.res.b[ 3 ] ).toBe( 3 )
                expect( this.res.b[ 4 ] ).toBe( 4 )
                expect( this.res.b[ 5 ] ).toBe( 5 )
                expect( this.res.b[ 6 ] ).toBe( 5 )
            })
        })


    })
})
