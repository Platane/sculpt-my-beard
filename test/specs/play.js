var TimeLineState = require('../../js/model/app-state/timeLineState')
  , PlayerInfo = require('../../js/model/app-state/playerInfo')
  , ExecutePlayer = require('../../js/staticController/executePlayer')
  , ed = require('../../js/system/eventDispatcher')

describe('player', function(){
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
        // mock
        var fns = []
        requestAnimationFrame = function( fn ){
            fns.push( fn )
        }
        this.tickAnimationFrame = function(){
            var f=fns.slice()
            fns.length = 0
            f.forEach(function(c){
                c() })
        }
    })
    beforeEach(function(){
        this.ed = Object.create( ed )
        this.tls = Object.create( TimeLineState ).init()
        this.playerInfo = Object.create( PlayerInfo ).init()

        Object.create( ExecutePlayer ).init(
            {
                timeLineState: this.tls,
                playerInfo: this.playerInfo
            },
            this.ed
        ).enable()
    })
    describe('play pause play problem', function(){
        beforeEach(function(){


            // play
            this.playerInfo.isPlaying = true
            this.ed.dispatch('change:playerInfo')

            // pause
            this.playerInfo.isPlaying = false
            this.ed.dispatch('change:playerInfo')

            // play
            this.playerInfo.isPlaying = true
            this.ed.dispatch('change:playerInfo')


            this.ed.listen('change:timeLineState-cursor', this.cb.fn)
            this.tickAnimationFrame()
            this.tickAnimationFrame()
        })
        it('should have only one cycle running', function(){
            expect( this.cb.called() ).toBe( 2 )
        })
    })
})
