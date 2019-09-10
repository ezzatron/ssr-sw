/* eslint-env browser */

import {createDataPlugin} from './common.js'

export default function createClientDataPlugin (routes, initialData = {}) {
  return createDataPlugin(routes, createDriver, initialData)
}

function createDriver (router, initialData) {
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
