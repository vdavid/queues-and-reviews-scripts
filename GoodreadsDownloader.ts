namespace GoodreadsDownloader {
    import Sheet = GoogleAppsScript.Spreadsheet.Sheet
    import Range = GoogleAppsScript.Spreadsheet.Range

    export function fillMissingBookInfoOnSheet(
        apiKey: string,
        firstLineIndex: number,
        backgroundColor: string,
        sheet: Sheet
    ): void {
        const bookData = sheet.getRange(`C${firstLineIndex}:J`).getValues() as string[][]
        for (let rowIndex = 0; rowIndex < bookData.length; rowIndex++) {
            const author = bookData[rowIndex][0]
            const title = bookData[rowIndex][1]
            const goodreadsId = getGoodreadsIdFromUrl(bookData[rowIndex][2])

            if (title && !goodreadsId) {
                fillBookInfo.call(
                    apiKey,
                    backgroundColor,
                    title,
                    author,
                    sheet.getRange(firstLineIndex + rowIndex, 5, 1, 1)
                )
            }
        }
    }

    // If goodreadsId is set, then title and author won't be used.
    function fillBookInfo(
        apiKey: string,
        backgroundColor: string,
        title: string,
        author: string | undefined,
        dataRangeToSet: Range
    ): void {
        const xmlContent = downloadGoodreadsDataForBook(apiKey, title, author)
        const cellValues = convertGoodreadsDataToCellValues(xmlContent)
        if (cellValues[0] === '') {
            dataRangeToSet.getCell(1, 1).setValue('NOT FOUND :(')
            dataRangeToSet.getCell(1, 1).setBackground(backgroundColor)
        } else {
            dataRangeToSet.setValues([cellValues])
            dataRangeToSet.setBackground(backgroundColor)
        }
    }

    function downloadGoodreadsDataForBook(apiKey: string, title: string, author: string | undefined): string {
        const url = `https://www.goodreads.com/search/index.xml?key=${apiKey}&q=${author} ${title}`
        const xmlContent = UrlFetchApp.fetch(url).getContentText()
        return xmlContent.toString()
    }

    function convertGoodreadsDataToCellValues(xmlContent): string[] {
        const id = getGoodreadsIdFromXml(xmlContent)
        return [getGoodreadsUrl(id) || '']
    }

    function getGoodreadsIdFromUrl(goodreadsLink: string): string | null {
        return goodreadsLink.includes('/show/')
            ? goodreadsLink.slice(goodreadsLink.indexOf('/show/') + '/show/'.length, -1)
            : null
    }

    function getGoodreadsIdFromXml(xmlContent: string): string | null {
        // TODO: It parses the wrong ID right now!! Need to get the second one, not the first one. E.g. here:
        // https://www.goodreads.com/search/index.xml?key=2dF6FMV2K25SlZaqPQ&q=Albert Camus Közöny (don't worry, this is an invalid API key)
        const regexpMatchResult = xmlContent.match(/<id type="integer">(\d+)<\/id>/)
        return regexpMatchResult ? regexpMatchResult[1] : null
    }

    function getGoodreadsUrl(id: string): string {
        return 'https://www.goodreads.com/book/show/' + id
    }
}
