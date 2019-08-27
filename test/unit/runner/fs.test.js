import {readFile} from '~/src/runner/fs.js'

describe('readFile()', () => {
  test('reads files', async () => {
    const content = await readFile(require.resolve('~/test/fixture/text.txt'))

    expect(content.toString()).toBe('What are you looking at?\n')
  })
})
