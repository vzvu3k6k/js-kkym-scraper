import url from 'url'

// "2015年12月25日 10:30"という形式の文字列をDateオブジェクトにする
function parseDate (str) {
  const m = str.match(/^(\d+)年(\d+)月(\d+)日 (\d+):(\d+)$/)
  if (!m) throw new Error(`Invalid date string: ${str}`)
  let [year, month, day, hour, minute] = m.slice(1).map((n) => parseInt(n, 10))
  month-- // monthは0から始まる
  return new Date(year, month, day, hour, minute)
}

// "1,234,567"という形式の文字列を123456という数値にする
function parseSeparatedDecimal (str) {
  return parseInt(str.replace(/,/g, ''), 10)
}

// "/users/kaku-yomu"という形式の文字列を"kakuyomu"にする
function parseUserUrl (str) {
  const u = url.parse(str)
  const m = u.pathname.match(/^\/users\/([-_0-9a-zA-Z]+)$/)
  if (!m) throw new Error(`Invalid user URL: ${str}`)
  return m[1]
}

function scrapeGenreNode ($node) {
  const u = url.parse($node.getAttribute('href'))
  const m = u.pathname.match(/^\/genres\/([^/]+)/)
  if (!m) throw new Error(`Invalid genre URL: ${u.pathname}`)
  return {
    id: m[1],
    name: $node.textContent
  }
}

function scrapeUserNode ($node) {
  return {
    id: parseUserUrl($node.getAttribute('href')),
    name: $node.textContent.trim()
  }
}

export default class Scraper {
  constructor ($elem) {
    this.$elem = $elem
  }

  toPlainObject (properties = this.properties) {
    const obj = {}
    for (const key of properties) {
      obj[key] = this[key]
    }
    return obj
  }

  get name () {
    return this.$elem.querySelector('[itemprop="name"]').textContent.trim()
  }

  // NumberだとオーバーフローするのでStringで返す
  get workId () {
    const href = this.$elem.querySelector('[itemprop="name"]').getAttribute('href')
    return href.match(/^\/works\/(\d+)$/)[1]
  }

  get author () {
    return scrapeUserNode(this.$elem.querySelector('.widget-workCard-authorLabel'))
  }

  get reviewPoints () {
    const label = this.$elem.querySelector('.widget-workCard-reviewPoints').textContent.trim()
    return parseSeparatedDecimal(label.match(/^★([\d,]+)$/)[1])
  }

  get genre () {
    return scrapeGenreNode(this.$elem.querySelector('[itemprop="genre"]'))
  }

  get status () {
    return this.$elem.querySelector('.widget-workCard-statusLabel').textContent.trim()
  }

  get episodeCount () {
    const label = this.$elem.querySelector('.widget-workCard-episodeCount').textContent.trim()
    return parseSeparatedDecimal(label.match(/^([\d,]+)話$/)[1])
  }

  get characterCount () {
    const label = this.$elem.querySelector('[itemprop="characterCount"]').textContent.trim()
    return parseSeparatedDecimal(label.match(/^([\d,]+)文字$/)[1])
  }

  get dateModified () {
    const label = this.$elem.querySelector('[itemprop="dateModified"]').textContent.trim()
    return parseDate(label.match(/^(.+) 更新$/)[1])
  }

  get introductionSnippet () {
    const node = this.$elem.querySelector('.widget-workCard-introduction')
    if (node) {
      return node.textContent.trim()
    }
    return null
  }

  get flags () {
    const nodes = this.$elem.querySelectorAll('.widget-workCard-flags [itemprop="keywords"]')
    return Array.from(nodes, (node) => node.textContent.trim())
  }

  get keywords () {
    const nodes = this.$elem.querySelectorAll('.widget-workCard-tags [itemprop="keywords"]')
    return Array.from(nodes, (node) => node.textContent.trim())
  }

  get reviews () {
    const nodes = this.$elem.querySelectorAll('[itemtype="https://schema.org/Review"]')
    return Array.from(nodes, (node) => {
      return {
        // <a>にはitemprop="name"がないのでhrefを使う
        author: scrapeUserNode(node.querySelector('a[href^="/users/"]')),
        body: node.querySelector('[itemprop="reviewBody"]').textContent.trim()
      }
    })
  }

  get imageColor () {
    return this.$elem.querySelector('.widget-workCard-workColor[style]')
      .getAttribute('style').match(/background-color:\s*([^;]+)/)[1]
  }
}

Scraper.prototype.properties = [
  'name',
  'workId',
  'author',
  'reviewPoints',
  'genre',
  'status',
  'episodeCount',
  'characterCount',
  'dateModified',
  'introductionSnippet',
  'flags',
  'keywords',
  'reviews',
  'imageColor'
]
