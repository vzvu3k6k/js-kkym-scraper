export const properties = {
  textrim: function () {
    return this.text().trim()
  },
  findAt: function (selector) {
    return this.find(selector).eq(0)
  },
  fetchAt: function (selector) {
    return this.fetch(selector).eq(0)
  },
  fetch: function (selector) {
    const retval = this.find(selector)
    if (!retval.length) throw new Error(`Can't find ${selector}`)
    return retval
  }
}

export const extend = ($) => {
  for (const name of Object.keys(properties)) {
    Object.defineProperty(
      $.prototype,
      name,
      {
        value: properties[name]
      }
    )
  }
  return $
}

export default extend
