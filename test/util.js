import https from 'https'
import path from 'path'
import replay from 'replay'

replay.fixtures = path.join(__dirname, 'fixtures')

export function get (url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP Status Code: ${res.statusCode}`))
        return
      }
      res.setEncoding('utf-8')
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => { resolve(body) })
      res.on('error', (err) => { reject(err) })
    }).on('error', (err) => { reject(err) })
  })
}
