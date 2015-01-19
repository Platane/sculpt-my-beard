var TimeLine = require('../../js/model/data/TimeLine')
  , Face = require('../../js/model/data/Face')
  , Shape = require('../../js/model/data/Shape')
  , Line = require('../../js/model/data/Line')
  , historizable = require('../../js/model/mixin/historizable')

describe('deep copy', function(){
    describe('object', function(){
        beforeEach(function(){
            this.object = {a: 5, b: {c: 1}}
            this.copy = historizable.deepCopy(this.object)

            this.object.a = 0
            this.object.u = 1
            this.object.b.c = 0
            this.object.b.u = 1
        })
        it('is not a reference', function(){
            expect( this.copy.a ).toBe(5);
            expect( Object.keys(this.copy).length ).toBe(2);
            expect( this.copy.b.c ).toBe(1);
            expect( Object.keys(this.copy.b ).length ).toBe(1);
        })
    })
    describe('array', function(){
        beforeEach(function(){
            this.array = [{a:1},2,3]
            this.copy = historizable.deepCopy(this.array)

            this.array[0].a = 0
            this.array.push(6)
        })
        it('is not a reference', function(){
            expect( this.copy.length ).toBe(3);
            expect( this.copy[0].a ).toBe(1);
        })
    })
})

describe('pack stuff', function(){
    beforeEach(function(){
        this.face = Object.create(Face).init()
        this.shape = Object.create(Shape).init()
        this.line = Object.create(Line).init()
    })
    describe('pack Line', function(){
        describe('points', function(){
            beforeEach(function(){
                this.point = {x: 6, y:4}
                this.arr = [this.point]
                this.line.line = this.arr

                this.pack = this.line.pack()

                this.point.x = 0
                this.arr.push({x: 0, y:0})
            })
            it('packed object should not hold reference', function(){
                expect( this.pack.line.length ).toBe(1);
                expect( this.pack.line[0].x ).toBe(6);
            })
        })
        describe('number', function(){
            beforeEach(function(){
                this.arr = [6]
                this.line.width = this.arr

                this.pack = this.line.pack()

                this.arr.push({x: 0, y:0})
                this.arr[0] = 8
            })
            it('packed object should not hold reference', function(){
                expect( this.pack.width.length ).toBe(1);
                expect( this.pack.width[0] ).toBe(6);
            })
        })
    })
})

describe('unpack stuff', function(){
    beforeEach(function(){
        this.face = Object.create(Face).init()
        this.shape = Object.create(Shape).init()
        this.line = Object.create(Line).init()
    })
    describe('pack Line', function(){
        describe('points', function(){
            beforeEach(function(){
                this.line.line = [{x: 6, y:4}]

                this.pack = this.line.pack()
            })
            beforeEach(function(){
                this.line.unpack( this.pack )

                this.line.line[0].x = 0
            })
            it('unpacked object should not be linked to the pack', function(){
                expect( this.pack.line[0].x ).toBe(6);
                expect( this.line.line[0].x ).toBe(0);
            })
        })
    })
})
