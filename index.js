'use strict'

const jsonMask = require('json-mask')
const compile = jsonMask.compile
const filter = jsonMask.filter

/**
 *  Mask koa1 parts of the response.
 * @param {Object} opts
 * @return {Promise}
 * @api public
 */

module.exports = opts => {
  opts = opts || {}
  const name = opts.name || 'fields'

  return function * mask (next) {
    yield next

    const body = this.body

    // validate json format
    if (!body || (typeof body !== 'object')) return

    // check for query fields, should exist in query
    const fields = this.query[name] || this.fields
    if (!fields) return

    this.body = filter(this.body, compile(fields))
  }
}
