import cheerio from 'cheerio'

// "2015年12月25日 10:30"という形式の文字列をDateオブジェクトにする
function parseDate (str) {
  const m = str.match(/^(\d+)年(\d+)月(\d+)日 (\d+):(\d+)$/)
  if (!m) throw new Error(`Invalid date string: ${str}`)
  let [year, month, day, hour, minute] = m.slice(1).map((n) => parseInt(n, 10))
  month-- // monthは0から始まる
  return new Date(year, month, day, hour, minute)
}

// "/users/kaku-yomu"という形式の文字列を"kakuyomu"にする
function parseUserUrl (str) {
  const m = str.match(/^\/users\/([-_0-9a-zA-Z]+)$/)
  if (!m) throw new Error(`Invalid user URL: ${str}`)
  return m[1]
}

function scrapeUserNode ($node) {
  return {
    name: $node.text(),
    userId: parseUserUrl($node.attr('href'))
  }
}

export default class Scraper {
  constructor (html) {
    this.$ = cheerio.load(html)
  }

  getItems () {
    const itemSelector = '.widget-media-genresWorkList .widget-work[itemtype="https://schema.org/CreativeWork"]'
    const self = this
    return this.$(itemSelector).map(function () {
      return self.scrapeWorkNode(self.$(this))
    }).get()
  }

  scrapeWorkNode ($work) {
    const work = {}
    const self = this
    work.name = $work.find('[itemprop="name"]').text()
    work.workId = $work.find('[itemprop="name"]').attr('href').match(/^\/works\/(\d+)$/)[1] // Number型だとオーバーフローする
    work.author = scrapeUserNode($work.find('[itemprop="author"]').eq(0))
    work.reviewPoints = parseInt($work.find('.widget-work-reviewPoints').text().match(/^★(\d+)$/)[1], 10)
    work.genre = $work.find('[itemprop="genre"]').text()
    work.status = $work.find('.widget-work-statusLabel').text()
    work.episodeCount = parseInt($work.find('.widget-work-episodeCount').text().match(/^(\d+)話$/)[1], 10)
    work.characterCount = parseInt($work.find('[itemprop="characterCount"]').text().match(/^([\d,]+)文字$/)[1].replace(',', ''), 10)
    work.dateModified = parseDate($work.find('[itemprop="dateModified"]').text().match(/^(.+) 更新$/)[1])
    work.introductionSnippet = $work.find('.widget-work-introduction').text()
    work.flags = $work.find('.widget-work-flags [itemprop="keywords"]')
      .map(function () { return self.$(this).text() }).get()
    work.keywords = $work.find('.widget-work-tags [itemprop="keywords"]')
      .map(function () { return self.$(this).text() }).get()
    work.reviews = $work.find('[itemtype="https://schema.org/Review"]')
      .map(function () {
        const $review = self.$(this)
        return {
          // <a>にはitemprop="name"がないのでhrefを使う
          author: scrapeUserNode($review.find('a[href^="/users/"]')),

          body: $review.find('[itemprop="reviewBody"]').text()
        }
      }).get()
    work.imageColor = $work.find('[itemtype="https://schema.org/Review"] [style*=color]').attr('style').match(/color:\s*([^;]+)/)[1]
    return work
  }
}
