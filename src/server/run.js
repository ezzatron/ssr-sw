import {main} from './main.js'

const services = {
  process,
}

main(services).catch(error => {
  console.error(error)
  process.exit(1)
})
