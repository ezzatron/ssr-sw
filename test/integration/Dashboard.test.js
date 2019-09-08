import {create} from 'react-test-renderer'

import Dashboard from '~/src/client/component/Dashboard.js'

describe('<Dashboard>', () => {
  let root

  beforeEach(() => {
    ({root} = create(<Dashboard />))
  })

  test('contains the heading "Dashboard"', () => {
    expect(root.findByType('h1').children).toContain('Dashboard')
  })
})
