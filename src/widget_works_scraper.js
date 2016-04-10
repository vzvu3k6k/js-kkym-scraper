import WidgetWorkScraper from './widget_work_scraper'

export default class Scraper {
  constructor ($elem) {
    this.$elem = $elem
  }

  getItems () {
    return [...this.eachItem()]
  }

  * eachItem () {
    const itemSelector = '.widget-work[itemtype="https://schema.org/CreativeWork"]'
    for (const node of this.$elem.querySelectorAll(itemSelector)) {
      yield this.scrapeItem(node)
    }
  }

  scrapeItem ($work) {
    return new WidgetWorkScraper($work)
  }
}
