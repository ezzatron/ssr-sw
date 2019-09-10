import {createDataPlugin} from './common.js'

export default function createClientDataPlugin (routes) {
  return createDataPlugin(routes, createDriver)
}

function createDriver (router) {
  return {
    getData () {
    },

    getDataState () {
    },

    handleRoute () {
    },

    subscribeToData (subscriber, currentData) {
    },

    async waitForData () {
    },
  }
}
