import cheerio from 'cheerio'
import extend from './cheerio_extend'
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

function scrapeUserNode ($node) {
  return {
    name: $node.textrim(),
    userId: parseUserUrl($node.attr('href'))
  }
}

export default class Scraper {
  constructor (html) {
    if (typeof html === 'string') {
      this.$ = extend(cheerio.load(html))
    } else {
      this.$ = extend(html)
    }
  }

  getItems () {
    return [...this.eachItem()]
  }

  * eachItem () {
    const itemSelector = '.widget-work[itemtype="https://schema.org/CreativeWork"]'
    for (const that of this.$(itemSelector).get()) {
      yield this.scrapeWorkNode(this.$(that))
    }
  }

  scrapeWorkNode ($work) {
    const work = {}
    const self = this
    work.name = $work.fetchAt('[itemprop="name"]').textrim()
    work.workId = $work.fetchAt('[itemprop="name"]').attr('href').match(/^\/works\/(\d+)$/)[1] // Number型だとオーバーフローする
    work.author = scrapeUserNode($work.fetchAt('.widget-workCard-authorLabel'))
    work.reviewPoints = parseSeparatedDecimal($work.fetchAt('.widget-workCard-reviewPoints').textrim().match(/^★([\d,]+)$/)[1])
    work.genre = $work.fetchAt('[itemprop="genre"]').textrim()
    work.status = $work.fetchAt('.widget-workCard-statusLabel').textrim()
    work.episodeCount = parseSeparatedDecimal($work.fetchAt('.widget-workCard-episodeCount').textrim().match(/^([\d,]+)話$/)[1])
    work.characterCount = parseSeparatedDecimal($work.fetchAt('[itemprop="characterCount"]').textrim().match(/^([\d,]+)文字$/)[1])
    work.dateModified = parseDate($work.fetchAt('[itemprop="dateModified"]').textrim().match(/^(.+) 更新$/)[1])
    work.introductionSnippet = $work.findAt('.widget-workCard-introduction').textrim() || null
    work.flags = $work.find('.widget-workCard-flags [itemprop="keywords"]')
      .map(function () { return self.$(this).textrim() }).get()
    work.keywords = $work.find('.widget-workCard-tags [itemprop="keywords"]')
      .map(function () { return self.$(this).textrim() }).get()
    work.reviews = $work.find('[itemtype="https://schema.org/Review"]')
      .map(function () {
        const $review = self.$(this)
        return {
          // <a>にはitemprop="name"がないのでhrefを使う
          author: scrapeUserNode($review.fetchAt('a[href^="/users/"]')),

          body: $review.fetchAt('[itemprop="reviewBody"]').textrim()
        }
      }).get()
    work.imageColor = $work.findAt('.widget-workCard-workColor[style]').attr('style').match(/background-color:\s*([^;]+)/)[1]
    return work
  }
}
