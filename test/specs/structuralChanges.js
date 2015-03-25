var sc = require('../../js/system/structuralChangesMethods')
  , deepEqual = require('./deepEqual')

describe('structural changes', function(){

    beforeEach(function(){

        this.aKey = {
            pack: {
                vertex: [
                    {x:0,y:100},
                    {x:0,y:200},
                    {x:0,y:300},
                ]
            },
            structuralChanges:[]
        }

        this.bKey = {
            pack: {
                vertex: [
                    {x:1,y:100},
                    {x:1,y:200},
                    {x:1,y:300},
                ]
            },
            structuralChanges:[]
        }

        this.pack = {
            vertex: {x:2,y:0}
        }
        this.pack = {
            vertex: {x:3,y:0}
        }
    })

    describe('add point', function(){

        describe('in blank context', function(){

            beforeEach(function(){
                sc.add( this.aKey, this.bKey, 1, 0.4 )
            })

            it('should keep consistency before', function(){
                deepEqual(
                    sc.packIn( this.aKey ).vertex,
                    [
                        {x:0,y:100},
                        {x:0,y:200},
                        {x:0,y:300},
                    ]
                )
            })

            it('should keep consistency after', function(){
                deepEqual(
                    sc.packOut( this.bKey ).vertex,
                    [
                        {x:1,y:100},
                        {x:1,y:200},
                        {x:1,y:300},
                    ]
                )
            })

            it('should keep consistency between', function(){
                deepEqual(
                    sc.packOut( this.aKey ).vertex,
                    [
                        {x:0,y:100},
                        {x:0,y:140},
                        {x:0,y:200},
                        {x:0,y:300},
                    ]
                )

                deepEqual(
                    sc.packIn( this.bKey ).vertex,
                    [
                        {x:1,y:100},
                        {x:1,y:140},
                        {x:1,y:200},
                        {x:1,y:300},
                    ]
                )
            })
        })
    })
    /*
    describe('remove point', function(){

        describe('in blank context', function(){

            beforeEach(function(){
                sc.del( this.aKey, this.bKey, 1, 0.5 )
            })

            it('should keep consistency before', function(){
                deepEqual(
                    sc.packIn( this.aKey ).vertex,
                    [
                        {x:0,y:100},
                        {x:0,y:200},
                        {x:0,y:300},
                    ]
                )
            })

            it('should keep consistency after', function(){
                deepEqual(
                    sc.packOut( this.bKey ).vertex,
                    [
                        {x:1,y:100},
                        {x:1,y:200},
                        {x:1,y:300},
                    ]
                )
            })

            it('should keep consistency between', function(){
                deepEqual(
                    sc.packOut( this.aKey ).vertex,
                    [
                        {x:0,y:100},
                        {x:0,y:300},
                    ]
                )

                deepEqual(
                    sc.packIn( this.bKey ).vertex,
                    [
                        {x:1,y:100},
                        {x:1,y:300},
                    ]
                )
            })
        })
    })
    */

    describe('add/remove point composition', function(){

        describe('add two', function(){

            beforeEach(function(){
                sc.add( this.aKey, this.bKey, 1, 0.3 )
                sc.add( this.aKey, this.bKey, 1, 0.7 )
            })

            it('should keep consistency after and before', function(){
                deepEqual(
                    sc.packIn( this.aKey ).vertex,
                    [
                        {x:0,y:100},
                        {x:0,y:200},
                        {x:0,y:300},
                    ]
                )
                deepEqual(
                    sc.packOut( this.bKey ).vertex,
                    [
                        {x:1,y:100},
                        {x:1,y:200},
                        {x:1,y:300},
                    ]
                )
            })

            it('should keep consistency between', function(){
                deepEqual(
                    sc.packOut( this.aKey ).vertex,
                    [
                        {x:0,y:100},
                        {x:0,y:121},
                        {x:0,y:130},
                        {x:0,y:200},
                        {x:0,y:300},
                    ]
                )

                deepEqual(
                    sc.packIn( this.bKey ).vertex,
                    [
                        {x:1,y:100},
                        {x:1,y:121},
                        {x:1,y:130},
                        {x:1,y:200},
                        {x:1,y:300},
                    ]
                )
            })
        })
    })

})
