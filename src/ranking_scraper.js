import WidgetWorkScraper from './widget_work_scraper'
import WidgetWorksScraper from './widget_works_scraper'

export default class Scraper extends WidgetWorksScraper {
  getItems () {
    return [...this.eachItem()]
  }

  scrapeItem ($item) {
    const work = new WidgetWorkScraper($item)
    const rank = parseInt($item.querySelector('.widget-work-rank').textContent, 10)
    return { rank, work }
  }
}
