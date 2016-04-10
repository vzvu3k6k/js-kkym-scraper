import assert from 'assert'
import Scraper from '../src/ranking_scraper'
import { getDocument } from './util'

describe('RankingScraper', () => {
  it('https://kakuyomu.jp/rankings/fantasy/weekly を正しくパースする', () => {
    return getDocument('https://kakuyomu.jp/rankings/fantasy/weekly')
      .then((document) => {
        const scraper = new Scraper(document)
        const items = [...scraper.getItems()]
        assert.equal(items.length, 100)

        let rank = 1
        for (const item of items) {
          assert.strictEqual(item.rank, rank++)
        }

        const work = items[0].work.toPlainObject()
        assert(work.workId.length === 19)
        assert.deepStrictEqual(work.genre, {
          id: 'fantasy',
          name: 'ファンタジー'
        })
        assert(work.reviewPoints > 0)
        assert(work.name.length > 0)
        assert(work.episodeCount > 0)
        assert(work.characterCount > 0)
        assert(work.dateModified > new Date(2015, 12 - 1, 24, 0, 0))
        assert(work.introductionSnippet.length > 0)
        assert.strictEqual(work.reviews.length, 2)
        assert(work.reviews[0].body.length > 0)
      })
  })
})
