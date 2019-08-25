export function asyncMiddleware (middleware) {
  return (...args) => {
    const next = args[args.length - 1]
    const result = middleware(...args)

    if (typeof result !== 'object' || typeof result.catch !== 'function') return

    result.catch(next)
  }
}
