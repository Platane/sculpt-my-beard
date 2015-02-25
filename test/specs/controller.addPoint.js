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
        this.face = Object.create( Face ).init()

        Object.create( AddPoint )
        .init({
            face: this.face,
            }, this.ed )
        .enable()


        this.la = Object.keys( this.face.chunk )[0]
        this.shape = this.face.chunk[ this.la ]
        this.shape.sharpness = [{before:0, after:0}, {before:0, after:0}, {before:0, after:0}]
        this.shape.width = [10,20,30]
        this.shape.line = [{x:50, y:50}, {x:-50, y:-50}, {x:50, y:-50}]
    })
    describe('add point ', function(){
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
            expect( this.shape.sharpness.length ).toBe( 4 )
        })
        it('should have create a point with the spawnFrom flag', function(){
            expect( this.shape.line[1].spawnFrom ).toBe( 'after' )
        })
        it('should be placed between the right points', function(){
            expect( this.shape.line[0].x ).toBe( 50 )
            expect( this.shape.line[0].y ).toBe( 50 )
            expect( this.shape.line[2].x ).toBe( -50 )
            expect( this.shape.line[2].y ).toBe( -50 )
        })
        it('should have emit change:point event twice (on move wip and at the end not wip)', function(){
            expect( this.cb.called() ).toBe( 2 )
            expect( !!this.cb.args[ 0 ][0].wip ).toBe( true )
            expect( !!this.cb.args[ 1 ][0].wip ).toBe( false )
        })
    })
})
