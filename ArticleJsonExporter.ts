const queuesAndReviewsUrl = 'https://docs.google.com/spreadsheets/d/15ccFkUaWRUZtLk0C0dT8EN9qYWf_1aah0WoD4ii5rpQ/';

function doGet(e) {
    e = e || {parameter: { limit : 5}};

    SpreadsheetApp.openByUrl(queuesAndReviewsUrl)
    const articleJsonExporter = new ArticleJsonExporter();
    const allArticlesInJson = articleJsonExporter.convertRawArticlesToJson(SpreadsheetApp.getActive().getSheetByName('Articles').getRange('A' + 7 + ':N').getValues(), parseInt(e.parameter.limit));
    return ContentService.createTextOutput(JSON.stringify(allArticlesInJson)).setMimeType(ContentService.MimeType.JSON);
}

function ArticleJsonExporter() {
    this.convertRawArticlesToJson = convertRawArticlesToJson;

    function convertRawArticlesToJson(data, limit) {
        const allArticlesAsJson = [];
        for (let rowIndex = 0; rowIndex < (limit ? limit : data.length); rowIndex++) {
            if (data[rowIndex][0]) {
                allArticlesAsJson.push(convertRawArticleDataToJson(data[rowIndex]));
            }
        }
        return allArticlesAsJson;
    }

    function convertRawArticleDataToJson(articleData) {
        return {
            readDate: new Date(articleData[0]),
            title: articleData[1],
            url: articleData[2],
            tags: articleData[3].toString().split(', '),
            characterCount: parseInt(articleData[4]),
            language: (articleData[6] === 'EN') ? 'English' : ((articleData[6] === 'HU') ? 'Hungarian' : articleData[6]),
            authors: articleData[7] ? articleData[7].toString().split(', ') : [],
            publicationDate: (articleData[8] !== '') ? new Date(articleData[8]) : null,
            rating: parseInt(articleData[12]),
            review: articleData[13],
        };
    }
}