import Sheet = GoogleAppsScript.Spreadsheet.Sheet
import Range = GoogleAppsScript.Spreadsheet.Range

function GoodreadsDownloader(options) {
    this.options = options || {};
    this.options.backgroundColor = this.options.backgroundColor || '#d88';
    this.options.firstLineIndex = this.options.firstLineIndex || 7;

    this.fillMissingBookInfoOnSheet = function (sheet: Sheet) {
        const bookData = sheet.getRange('C' + this.options.firstLineIndex + ':J').getValues();
        for (let rowIndex = 0; rowIndex < bookData.length; rowIndex++) {
            const author = bookData[rowIndex][0];
            const title = bookData[rowIndex][1];
            const goodReadsId = getGoodReadsIdFromUrl(bookData[rowIndex][2]);

            if (title && !goodReadsId) {
                fillBookInfo.call(this, title, author, sheet.getRange(this.options.firstLineIndex + rowIndex, 5, 1, 1));
                Logger.log(author + ',' + title);
            }
        }
    };

    /**
     * @param {string?} author
     * @param {string} title
     * @param {string?} goodReadsId If set, then title and author won't be used.
     */
    function fillBookInfo(title: string, author: string | undefined, dataRangeToSet: Range) {
        const xmlContent = downloadGoodReadsDataForBook.call(this, title, author);
        const cellValues = convertGoodReadsDataToCellValues.call(this, xmlContent);
        if (cellValues[0] !== '') {
            dataRangeToSet.setValues([cellValues]);
            dataRangeToSet.setBackground(this.options.backgroundColor);
        } else {
            dataRangeToSet.getCell(1, 1).setValue('NOT FOUND :(');
            dataRangeToSet.getCell(1, 1).setBackground(this.options.backgroundColor);
        }
    }

    function downloadGoodReadsDataForBook(title, author) {
        const url = `https://www.goodreads.com/search/index.xml?key=${this.options.apiKey}&q=${author} ${title}`;
        Logger.log(url);
        const xmlContent = UrlFetchApp.fetch(url);
        return xmlContent.toString();
    }

    function convertGoodReadsDataToCellValues(xmlContent) {
        const id = getGoodReadsIdFromXml(xmlContent);
        return [getGoodReadsUrl(id) || ''];
    }

    function getGoodReadsIdFromUrl(goodReadsLink) {
        return goodReadsLink.indexOf('/show/') > -1 ? goodReadsLink.slice(goodReadsLink.indexOf('/show/') + '/show/'.length, -1) : null;
    }

    function getGoodReadsIdFromXml(xmlContent) {
        // TODO: It parses the wrong ID right now!! Need to get the second one, not the first one. E.g. here:
        // https://www.goodreads.com/search/index.xml?key=2dF6FMV2K25SlZaqPQ&q=Albert Camus Közöny
        const regexpMatchResult = xmlContent.match(/<id type="integer">(\d+)<\/id>/);
        return regexpMatchResult ? regexpMatchResult[1] : null;
    }

    function getGoodReadsUrl(id) {
        return 'https://www.goodreads.com/book/show/' + id;
    }
}