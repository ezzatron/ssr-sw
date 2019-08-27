import {create} from 'react-test-renderer'

import Bar from '~/src/client/component/Bar.js'

describe('<Bar>', () => {
  let root

  beforeEach(() => {
    ({root} = create(<Bar />))
  })

  test('contains the heading "Bar"', () => {
    expect(root.findByType('h1').children).toContain('Bar')
  })

  test('contains the joke', () => {
    expect(root.findByType('img').props).toHaveProperty('src', 'Bar.jpg')
  })
})
