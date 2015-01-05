var Abstract = require('../utils/Abstract')
  , ed = require('../system/eventDispatcher')


/*
 * one key
 * {
 *   date,
 *   chunk: {
 *      label: packed shape
 *
 */
var init = function( type ){

    this.keys = []

    return this
}

module.exports = Object.create( Abstract )
.extend({
    init: init,
})
