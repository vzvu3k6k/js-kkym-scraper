import assert from 'assert'
import Scraper from '../src/widget_works_scraper'
import { getDocument } from './util'

describe('WidgetWorksScraper', () => {
  it('https://kakuyomu.jp/users/pureone/works を正しくパースする', () => {
    return getDocument('https://kakuyomu.jp/users/pureone/works')
      .then((document) => {
        const scraper = new Scraper(document)
        const works = [...scraper.getItems()]
        assert.equal(works.length, 1)

        const work = works[0].toPlainObject()
        assert.deepEqual(work, {
          name: 'テスト',
          workId: '4852201425154936607',
          author: {
            userId: 'pureone',
            name: '@pureone'
          },
          reviewPoints: 0,
          genre: { id: 'others', name: 'その他' },
          status: '連載中',
          episodeCount: 1,
          characterCount: 41,
          dateModified: new Date(2016, 1 - 1, 31, 18, 17),
          introductionSnippet: null,
          flags: [],
          keywords: [],
          reviews: [],
          imageColor: '#000000'
        })
      })
  })

  it('https://kakuyomu.jp/users/kawango/works を正しくパースする', () => {
    return getDocument('https://kakuyomu.jp/users/kawango/works')
      .then((document) => {
        const scraper = new Scraper(document)
        const works = [...scraper.getItems()]
        assert.equal(works.length, 1)

        const work = works[0].toPlainObject()

        assert(work.reviewPoints > 0)
        delete work.reviewPoints

        assert(work.name.length > 0)
        delete work.name

        assert(work.episodeCount >= 3)
        delete work.episodeCount

        assert(work.characterCount >= 4322)
        delete work.characterCount

        assert(work.dateModified >= new Date(2016, 3 - 1, 7, 8, 1))
        delete work.dateModified

        assert(work.introductionSnippet.length > 0)
        delete work.introductionSnippet

        assert.strictEqual(work.reviews.length, 2)
        assert.deepStrictEqual(work.reviews[0].author, {
          userId: 'kawango',
          name: 'かわんご'
        })
        assert(work.reviews[0].body.length > 0)
        delete work.reviews

        assert.deepStrictEqual(work, {
          workId: '1177354054880357352',
          author: {
            userId: 'kawango',
            name: 'かわんご'
          },
          genre: { id: 'horror', name: 'ホラー' },
          status: '連載中',
          flags: ['残酷描写有り', '暴力描写有り', '性描写有り'],
          keywords: ['ハートフルシリーズ', 'ピアピア動画', 'ＳＦ'],
          imageColor: '#FF9D00'
        })
      })
  })
})
