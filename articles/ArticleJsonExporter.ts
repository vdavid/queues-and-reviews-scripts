namespace ArticleJsonExporter {
    import TextOutput = GoogleAppsScript.Content.TextOutput

    interface Article {
        readDate: Date
        title: string
        url: string
        tags: string[]
        characterCount: number
        language: string
        authors: string[]
        publicationDate: Date | null
        rating: number
        review: string
    }

    function doGet(limit = 5): TextOutput {
        const queuesAndReviewsUrl =
            'https://docs.google.com/spreadsheets/d/15ccFkUaWRUZtLk0C0dT8EN9qYWf_1aah0WoD4ii5rpQ/'
        const sheet = SpreadsheetApp.openByUrl(queuesAndReviewsUrl).getSheetByName('📰⭐')
        const data = sheet.getRange('A7:N').getValues()
        const articles = parseRaw(data, limit)
        return ContentService.createTextOutput(JSON.stringify(articles)).setMimeType(ContentService.MimeType.JSON)
    }

    export function parseRaw(data: string[][], limit: number): Article[] {
        const allArticlesAsJson = []
        for (let rowIndex = 0; rowIndex < (limit ?? data.length); rowIndex++) {
            if (data[rowIndex][0]) {
                allArticlesAsJson.push(convertRawArticleDataToJson(data[rowIndex]))
            }
        }
        return allArticlesAsJson
    }

    function convertRawArticleDataToJson(articleData: string[]): Article {
        return {
            readDate: new Date(articleData[0]),
            title: articleData[1],
            url: articleData[2],
            tags: articleData[3].toString().split(', '),
            characterCount: parseInt(articleData[4], 10),
            language: articleData[6] === 'EN' ? 'English' : articleData[6] === 'HU' ? 'Hungarian' : articleData[6],
            authors: articleData[7] ? articleData[7].toString().split(', ') : [],
            publicationDate: articleData[8] === '' ? null : new Date(articleData[8]),
            rating: parseInt(articleData[12], 10),
            review: articleData[13],
        }
    }
}
