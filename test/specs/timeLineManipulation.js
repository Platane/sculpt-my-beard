var TimeLine = require('../../js/model/data/TimeLine')
  , Face = require('../../js/model/data/Face')
  , TimeLineState = require('../../js/model/app-state/TimeLineState')
  , ed = require('../../js/system/eventDispatcher')
  , ApplyTimeLine = require('../../js/staticController/applyTimeLine')

describe('applyTimeLine', function(){

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

        ed.reset()

        //bootstrap

        this.face = Object.create( Face ).init()
        this.timeLine = Object.create( TimeLine ).init()
        this.timeLineState = Object.create( TimeLineState ).init()

        this.applyTimeLine = Object.create( ApplyTimeLine ).init({
            face: this.face,
            timeLine: this.timeLine,
            timeLineState: this.timeLineState,
        }).enable()


        this.la = Object.keys( this.face.chunk )[0]
        this.shape = this.face.chunk[ this.la ]
    })
    describe('change face shape ', function(){
        beforeEach(function(){
            this.shape.width = [4]
            this.shape.line = [{x:100, y:100}]

            this.timeLineState.cursor = 17


            ed.listen('change:timeLine', this.cb.fn)

            ed.dispatch('change:shape',{
                shape: this.shape
            })
        })

        it('should create a key', function(){
            expect( this.timeLine.keys[ this.la ].length ).toBe( 1 )
        })
        it('should create a key at the cursor position as date', function(){
            expect( this.timeLine.keys[ this.la ][ 0 ].date ).toBe( 17 )
        })
        it('should create a key with the current shape state', function(){
            expect( this.timeLine.keys[ this.la ][ 0 ].pack.width.length ).toBe( 1 )
            expect( this.timeLine.keys[ this.la ][ 0 ].pack.line.length ).toBe( 1 )
            expect( this.timeLine.keys[ this.la ][ 0 ].pack.width[ 0 ] ).toBe( 4 )
            expect( this.timeLine.keys[ this.la ][ 0 ].pack.line[ 0 ].x ).toBe( 100 )
        })
        it('should create a key with a deep copy as pack', function(){
            this.shape.width[ 0 ] = 5
            this.shape.line[ 0 ].x = 5
            expect( this.timeLine.keys[ this.la ][ 0 ].pack.width[ 0 ] ).toBe( 4 )
            expect( this.timeLine.keys[ this.la ][ 0 ].pack.line[ 0 ].x ).toBe( 100 )
        })
        it('should throw change:timeLine once', function(){
            expect( this.cb.called() ).toBe( 1 )
        })
    })

    describe('change cursor, interpolate face ', function(){

        describe('two keys, ', function(){

            beforeEach(function(){
                this.shape.width = [100]
                this.shape.line = [{x:100, y:100}]
                this.timeLineState.cursor = 10
                ed.dispatch('change:shape',{
                    shape: this.shape
                })

                this.shape.width = [200]
                this.shape.line = [{x:200, y:100}]
                this.timeLineState.cursor = 20
                ed.dispatch('change:shape',{
                    shape: this.shape
                })

                ed.listen('change:point', this.cb.fn)

            })
            describe('between ', function(){
                beforeEach(function(){
                    this.timeLineState.cursor = 12
                    ed.dispatch('change:timeLineState',{
                        shape: this.shape
                    })
                })

                it('should throw change:shape once', function(){
                    expect( this.cb.called() ).toBe( 1 )
                })
                it('shape params should be interpolated', function(){
                    expect( this.shape.width[0] ).toBe( 120 )
                    expect( this.shape.line[0].x ).toBe( 120 )
                })
                it('keys params should remained unchanged', function(){
                    expect( this.timeLine.keys[ this.la ][ 0 ].pack.width.length ).toBe( 1 )
                    expect( this.timeLine.keys[ this.la ][ 1 ].pack.width.length ).toBe( 1 )
                    expect( this.timeLine.keys[ this.la ][ 0 ].pack.width[0] ).toBe( 100 )
                    expect( this.timeLine.keys[ this.la ][ 1 ].pack.width[0] ).toBe( 200 )

                    expect( this.timeLine.keys[ this.la ][ 0 ].pack.line.length ).toBe( 1 )
                    expect( this.timeLine.keys[ this.la ][ 1 ].pack.line.length ).toBe( 1 )
                    expect( this.timeLine.keys[ this.la ][ 0 ].pack.line[0].x ).toBe( 100 )
                    expect( this.timeLine.keys[ this.la ][ 1 ].pack.line[0].x ).toBe( 200 )
                })
            })
        })

        describe('many keys, ', function(){

            beforeEach(function(){
                this.shape.width = [100]
                this.timeLineState.cursor = 10
                ed.dispatch('change:shape',{
                    shape: this.shape
                })

                this.shape.width = [200]
                this.timeLineState.cursor = 20
                ed.dispatch('change:shape',{
                    shape: this.shape
                })

                this.shape.width = [300]
                this.timeLineState.cursor = 30
                ed.dispatch('change:shape',{
                    shape: this.shape
                })

                this.shape.width = [400]
                this.timeLineState.cursor = 40
                ed.dispatch('change:shape',{
                    shape: this.shape
                })

                ed.listen('change:point', this.cb.fn)

            })
            describe('between ', function(){
                beforeEach(function(){
                    this.timeLineState.cursor = 12
                    ed.dispatch('change:timeLineState',{
                        shape: this.shape
                    })
                })

                it('should throw change:shape once', function(){
                    expect( this.cb.called() ).toBe( 1 )
                })
                it('shape params should be interpolated', function(){
                    expect( this.shape.width[0] ).toBe( 120 )
                })
            })
            describe('between others', function(){
                beforeEach(function(){
                    this.timeLineState.cursor = 36
                    ed.dispatch('change:timeLineState',{
                        shape: this.shape
                    })
                })

                it('should throw change:shape once', function(){
                    expect( this.cb.called() ).toBe( 1 )
                })
                it('shape params should be interpolated', function(){
                    expect( this.shape.width[0] ).toBe( 360 )
                })
            })
            describe('before all', function(){
                beforeEach(function(){
                    this.timeLineState.cursor = 3
                    ed.dispatch('change:timeLineState',{
                        shape: this.shape
                    })
                })

                it('should throw change:shape once', function(){
                    expect( this.cb.called() ).toBe( 1 )
                })
                it('shape params should be interpolated', function(){
                    expect( this.shape.width[0] ).toBe( 100 )
                })
            })
            describe('after all', function(){
                beforeEach(function(){
                    this.timeLineState.cursor = 124
                    ed.dispatch('change:timeLineState',{
                        shape: this.shape
                    })
                })

                it('should throw change:shape once', function(){
                    expect( this.cb.called() ).toBe( 1 )
                })
                it('shape params should be interpolated', function(){
                    expect( this.shape.width[0] ).toBe( 400 )
                })
            })
        })

    })

})
