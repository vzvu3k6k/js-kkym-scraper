import assert from 'assert'
import fs from 'fs'
import path from 'path'
import Scraper from '../src/recent-works-scraper'

{
  const html = fs.readFileSync(path.resolve(__dirname, './fixtures/mini.html'))
  const scraper = new Scraper(html)
  assert.deepEqual(scraper.getItems(), [{
    name: '我輩は猫である',
    workId: '1',
    author: {
      userId: 'natsumesouseki',
      name: '夏目漱石'
    },
    reviewPoints: 0,
    genre: 'ファンタジー',
    status: '連載中',
    episodeCount: 1,
    characterCount: 100,
    dateModified: new Date(1905, 9, 6, 6, 0),
    introductionSnippet: null,
    flags: [],
    keywords: [],
    firstEpisodeId: '2',
    reviews: [],
    imageColor: null
  }])
}

{
  const html = fs.readFileSync(path.resolve(__dirname, './fixtures/full.html'))
  const scraper = new Scraper(html)
  assert.deepEqual(scraper.getItems(), [{
    name: '羅生門',
    workId: '1234567890123456789',
    author: {
      userId: 'akutagawa-ryunosuke',
      name: '芥川龍之介'
    },
    reviewPoints: 5,
    genre: '歴史・時代',
    status: '完結済',
    episodeCount: 1,
    characterCount: 12345,
    dateModified: new Date(2015, 11, 25, 10, 15),
    introductionSnippet: 'ある日の暮方の事である。\n一人の下人が、羅生門の下で雨やみを待っていた。',
    flags: ['残酷描写有り', '暴力描写有り'],
    keywords: ['ホラー', '短編'],
    firstEpisodeId: '9876543210987654321',
    reviews: [
      {
        author: {
          userId: 'akutagawa-ryunosuke',
          name: '芥川龍之介'
        },
        body: '自分はそれだけで満足であった。'
      },
      {
        author: {
          userId: 'ge_nin',
          name: '下人'
        },
        body: '何をしていた。云え。云わぬと、これだぞよ。'
      }
    ],
    imageColor: '#0033C4'
  }])
}
