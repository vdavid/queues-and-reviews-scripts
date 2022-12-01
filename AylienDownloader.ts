import Sheet = GoogleAppsScript.Spreadsheet.Sheet

type AylienResponse = {
    author: string,
    publishDate: string,
    title: string,
    article: string,
}

type ArticleData = {
    authors: string,
    publicationDate: string,
    title: string,
    content: string,
}

function AylienDownloader(options) {
    options = options || {};

    const BACKGROUND_COLOR = options.backgroundColor || '#d88';
    const FIRST_LINE_INDEX = options.firstLineIndex || 7;

    const APPLICATION_ID = options.applicationId;
    const APPLICATION_KEY = options.applicationKey;

    this.fillMissingInfo = function (sheet: Sheet): void {
        const input = sheet.getRange('C' + FIRST_LINE_INDEX + ':H').getValues();
        for (let rowIndex = 0; rowIndex < input.length; rowIndex++) {
            const articleUrl = input[rowIndex][0];
            const isParsed = input[rowIndex][3] !== '';
            const author = input[rowIndex][5];
            Logger.log(author);

            if (articleUrl && !isParsed) {
                try {
                    const articleData = downloadDataForArticle(articleUrl);
                    if (author) {
                        articleData.authors = author;
                    } /* Overwrites author if it's manually specified */

                    const cellValues = convertArticleDataToCellValues(articleData);

                    const targetRange = sheet.getRange(FIRST_LINE_INDEX + rowIndex, 5, 1, 5);
                    targetRange.setValues([cellValues]);
                    targetRange.setBackground(BACKGROUND_COLOR);
                } catch (error) {
                    Logger.log('Failed: ' + articleUrl + ' – ' + error.message);
                }
            }
        }
    };

    function downloadDataForArticle(articleUrl: string): ArticleData {
        const extractCallResponse = callAylienApi('extract', {articleUrl: articleUrl});

        return {
            authors: extractCallResponse.author,
            publicationDate: extractCallResponse.publishDate ? extractCallResponse.publishDate.slice(0, 10) : null,
            title: extractCallResponse.title,
            content: extractCallResponse.article,
        };
    }

    function callAylienApi(endpoint: string, parameters: {articleUrl: string}): AylienResponse {
        return JSON.parse(UrlFetchApp.fetch('https://api.aylien.com/api/v1/' + endpoint, {
            method: 'post',
            headers: {
                'X-AYLIEN-TextAPI-Application-Key': APPLICATION_KEY,
                'X-AYLIEN-TextAPI-Application-ID': APPLICATION_ID,
            },
            payload: parameters,
        }).getContentText());
    }

    function convertArticleDataToCellValues(articleData: ArticleData): (string | number)[] {
        return [
            // articleData.title,
            // '',
            // '',
            articleData.content.length,
            getWordCount(articleData.content),
            guessLanguage(articleData.content),
            articleData.authors,
            articleData.publicationDate ? articleData.publicationDate : '',
        ];
    }

    function getWordCount(string): number {
        return string.trim().split(/\s+/).length;
    }

    function guessLanguage(content: string): string {
        const mostCommonEnglishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'why']
        const likelyHU = ['á', 'é', 'í', 'ó', 'ö', 'ő', 'ú', 'ü', 'ű'].some(character => content.includes(character));
        const likelyEN = mostCommonEnglishWords.some(word => containsWord(content, word));

        return likelyHU ? (likelyEN ? '' : 'HU') : (likelyEN ? 'EN' : '');

    }

    function containsWord(content: string, word: string): boolean {
        return new RegExp('\\b' + word + '\\b', 'i').test(content);
    }
}