/* eslint-env browser */

import {createDataPlugin} from './common.js'

export default function createClientDataPlugin (routes, data = {}) {
  return createDataPlugin(routes, createDriver, data)
}

function createDriver (router, data) {
  return {
    getData () {
    },

    getDataState () {
    },

    handleRoute () {
    },

    subscribeToData (subscriber, currentData) {
    },
  }
}
