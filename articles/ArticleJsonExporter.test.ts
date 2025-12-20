import { ArticleJsonExporter } from './ArticleJsonExporter'

describe('ArticleJsonExporter', () => {
    it('can read a line of the spreadsheet', () => {
        const data = [
            ['2002-02-02', 'Title', 'url', 'x, y', '9999', '999', 'EN', 'X', '2001-01-01', '99', '9', 'Hm.', 'health'],
        ]

        const articles = ArticleJsonExporter.parseRaw(data, 1)
        expect(articles.length).toBe(1)
        expect(articles[0].readDate).toEqual(new Date('2002-02-02'))
        expect(articles[0].title).toBe('Title')
        expect(articles[0].url).toBe('url')
        expect(articles[0].tags).toEqual(['x', 'y'])
        expect(articles[0].characterCount).toBe(9999)
        expect(articles[0].language).toBe('English')
        expect(articles[0].authors).toEqual(['X'])
        expect(articles[0].publicationDate).toEqual(new Date('2001-01-01'))
        expect(articles[0].rating).toBe(9)
        expect(articles[0].review).toBe('Hm.')
    })
})
