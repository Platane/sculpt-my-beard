var Face = require('../../js/model/data/face')
  , Ed = require('../../js/system/eventDispatcher')
  , AddPoint = require('../../js/controller/drawZone/addPoint')

describe('controller', function(){

    beforeEach(function(){
        this.cb = {
            fn: function(){
                this.args.push(arguments)
            },
            args :[],
            called: function(){
                return this.args.length
            }
        }
        this.cb.fn = this.cb.fn.bind(this.cb)
    })

    beforeEach(function(){

        //bootstrap
        this.ed = Object.create( Ed )
        var face = this.face = Object.create( Face ).init()

        Object.create( AddPoint )
        .init({
            face: this.face,
            }, this.ed )
        .enable()


        this.la = Object.keys( this.face.chunk ).reduce(function(p,x){
            return face.chunk[ x ].line ? x : p
        })
        this.shape = this.face.chunk[ this.la ]
        this.shape.sharpness = [{before:0, after:0.10}, {before:0, after:0.11}, {before:0, after:0.12}, {before:0, after:0.13}]
        this.shape.width = [10,20,30]
        this.shape.line = [{x:50, y:50}, {x:-50, y:-50}, {x:50, y:-50}]
    })
    describe('add point from after', function(){
        beforeEach(function(){

            this.ed.listen('change:point', this.cb.fn)

            this.ed.dispatch('ui-tic-mousedown',{
                chunk: this.la,
                pool: 'line',
                i:1,
                x:-50,
                y:-50,
            })

            this.ed.dispatch('ui-zone-mousemove',{
                x:-50,
                y:-20,
            })

            this.ed.dispatch('ui-mouseup',{})
        })

        it('should have create a point', function(){
            expect( this.shape.line.length ).toBe( 4 )
            expect( this.shape.width.length ).toBe( 4 )
            expect( this.shape.sharpness.length ).toBe( 6 )
        })
        it('should be placed between the right points', function(){
            expect( this.shape.line[0].x ).toBe(  50 )
            expect( this.shape.line[0].y ).toBe(  50 )
            expect( this.shape.line[2].x ).toBe( -50 )
            expect( this.shape.line[2].y ).toBe( -50 )
            expect( this.shape.line[3].x ).toBe(  50 )
            expect( this.shape.line[3].y ).toBe( -50 )
        })
        it('should have create the reindex array', function(){
            expect( !!this.shape.reindex ).toBe( true )
        })
        it('should have set the reindex array', function(){
            expect( this.shape.reindex[0] ).toBe( 0 )
            expect( this.shape.reindex[1] ).toBe( 2 )
            expect( this.shape.reindex[2] ).toBe( 2 )
            expect( this.shape.reindex[3] ).toBe( 3 )
        })
        it('should have emit change:point event twice (on move wip and at the end not wip)', function(){
            expect( this.cb.called() ).toBe( 2 )
            expect( !!this.cb.args[ 0 ][0].wip ).toBe( true )
            expect( !!this.cb.args[ 1 ][0].wip ).toBe( false )
        })
    })
    describe('add point from before', function(){
        beforeEach(function(){

            this.ed.listen('change:point', this.cb.fn)

            this.ed.dispatch('ui-tic-mousedown',{
                chunk: this.la,
                pool: 'line',
                i:1,
                x:-50,
                y:-50,
            })

            this.ed.dispatch('ui-zone-mousemove',{
                x:-50,
                y:-100,
            })

            this.ed.dispatch('ui-mouseup',{})
        })

        it('should have create a point', function(){
            expect( this.shape.line.length ).toBe( 4 )
            expect( this.shape.width.length ).toBe( 4 )
            expect( this.shape.sharpness.length ).toBe( 6 )
        })
        it('should be placed between the right points', function(){
            expect( this.shape.line[0].x ).toBe(  50 )
            expect( this.shape.line[0].y ).toBe(  50 )
            expect( this.shape.line[1].x ).toBe( -50 )
            expect( this.shape.line[1].y ).toBe( -50 )
            expect( this.shape.line[3].x ).toBe(  50 )
            expect( this.shape.line[3].y ).toBe( -50 )
        })
        it('should have create the reindex array', function(){
            expect( !!this.shape.reindex ).toBe( true )
        })
        it('should have set the reindex array', function(){
            expect( this.shape.reindex[0] ).toBe( 0 )
            expect( this.shape.reindex[1] ).toBe( 1 )
            expect( this.shape.reindex[2] ).toBe( 1 )
            expect( this.shape.reindex[3] ).toBe( 3 )
        })
        it('should have emit change:point event twice (on move wip and at the end not wip)', function(){
            expect( this.cb.called() ).toBe( 2 )
            expect( !!this.cb.args[ 0 ][0].wip ).toBe( true )
            expect( !!this.cb.args[ 1 ][0].wip ).toBe( false )
        })
    })
    describe('add point from after then cancel', function(){
        beforeEach(function(){

            this.ed.listen('change:point', this.cb.fn)

            this.shape.reindex = [0,1,2]

            this.ed.dispatch('ui-tic-mousedown',{
                chunk: this.la,
                pool: 'line',
                i:1,
                x:-50,
                y:-50,
            })

            this.ed.dispatch('ui-zone-mousemove',{
                x:-50,
                y:-20,
            })
            this.ed.dispatch('ui-zone-mousemove',{
                x:-50,
                y:-50,
            })

            this.ed.dispatch('ui-mouseup',{})
        })
        it('should have not create a point', function(){
            expect( this.shape.line.length ).toBe( 3 )
            expect( this.shape.width.length ).toBe( 3 )
            expect( this.shape.sharpness.length ).toBe( 4 )
        })
        it('sharpness array should have not changed', function(){
            //expect( this.shape.sharpness[ 0 ].after ).toBe( 0.10 )
            //expect( this.shape.sharpness[ 1 ].after ).toBe( 0.11 )
            //expect( this.shape.sharpness[ 2 ].after ).toBe( 0.12 )
            //expect( this.shape.sharpness[ 3 ].after ).toBe( 0.13 )
        })
        it('should have reset the reindex array', function(){
            expect( this.shape.reindex[0] ).toBe( 0 )
            expect( this.shape.reindex[1] ).toBe( 1 )
            expect( this.shape.reindex[2] ).toBe( 2 )
        })
        it('should have emit change:point event twice (two move wip)', function(){
            expect( this.cb.called() ).toBe( 2 )
            expect( !!this.cb.args[ 0 ][0].wip ).toBe( true )
            expect( !!this.cb.args[ 1 ][0].wip ).toBe( true )
        })
    })
    describe('add point from before then cancel', function(){
        beforeEach(function(){

            this.ed.listen('change:point', this.cb.fn)

            this.shape.reindex = [0,1,2]

            this.ed.dispatch('ui-tic-mousedown',{
                chunk: this.la,
                pool: 'line',
                i:1,
                x:-50,
                y:-50,
            })

            this.ed.dispatch('ui-zone-mousemove',{
                x:-50,
                y:-100,
            })
            this.ed.dispatch('ui-zone-mousemove',{
                x:-50,
                y:-50,
            })

            this.ed.dispatch('ui-mouseup',{})
        })
        it('should have not create a point', function(){
            expect( this.shape.line.length ).toBe( 3 )
            expect( this.shape.width.length ).toBe( 3 )
            expect( this.shape.sharpness.length ).toBe( 4 )
        })
        it('sharpness array should have not changed', function(){
            //expect( this.shape.sharpness[ 0 ].after ).toBe( 0.10 )
            //expect( this.shape.sharpness[ 1 ].after ).toBe( 0.11 )
            //expect( this.shape.sharpness[ 2 ].after ).toBe( 0.12 )
            //expect( this.shape.sharpness[ 3 ].after ).toBe( 0.13 )
        })
        it('should have reset the reindex array', function(){
            expect( this.shape.reindex[0] ).toBe( 0 )
            expect( this.shape.reindex[1] ).toBe( 1 )
            expect( this.shape.reindex[2] ).toBe( 2 )
        })
        it('should have emit change:point event twice (two move wip)', function(){
            expect( this.cb.called() ).toBe( 2 )
            expect( !!this.cb.args[ 0 ][0].wip ).toBe( true )
            expect( !!this.cb.args[ 1 ][0].wip ).toBe( true )
        })
    })
})
