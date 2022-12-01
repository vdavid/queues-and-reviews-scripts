const aylienApplicationID = PropertiesService.getScriptProperties().getProperty('aylienApplicationID')
const aylienApplicationKey = PropertiesService.getScriptProperties().getProperty('aylienApplicationKey')
const existUsername = PropertiesService.getScriptProperties().getProperty('existUsername')
const existPassword = PropertiesService.getScriptProperties().getProperty('existPassword')
const goodreadsApiKey = PropertiesService.getScriptProperties().getProperty('goodreadsApiKey')
const omdbApiKey = PropertiesService.getScriptProperties().getProperty('omdbApiKey')

const backgroundColor = '#d88'

// noinspection JSUnusedGlobalSymbols
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Scripts')
        .addItem('Fill missing movie info for movie queue', 'fillMissingMovieQueueInfo')
        .addItem('Fill missing movie info for movie reviews', 'fillMissingMovieReviewInfo')
        .addItem('Fill missing info for article reviews', 'fillMissingArticleInfo')
        .addItem('Fill missing info for fiction books', 'fillMissingBookInfo')
        .addItem('Update last 7 days Exist data', 'fillExistDiaryItems')
        //.addItem('Export all articles in JSON', 'exportAllArticlesInJson') // Deployed as a web app here: https://script.google.com/macros/s/AKfycby6iNqW8-KWFiudJqWZEiGR-nRa38sJ0uMDs7-Da4KFlZ4gRKM/exec?limit=5
        .addToUi();
}
function fillMissingMovieReviewInfo() {
    const omdbDownloader = new OmdbDownloader({
        backgroundColor,
        firstLineIndex: 820, // 1-based
        apiKey: omdbApiKey,
    })
    omdbDownloader.fillMissingMovieInfoOnSheet(SpreadsheetApp.getActive().getSheetByName('🎬⭐'));
}
function fillMissingMovieQueueInfo() {
    const omdbDownloader = new OmdbDownloader({
        backgroundColor,
        firstLineIndex: 7, // 1-based
        apiKey: omdbApiKey,
    });
    omdbDownloader.fillMissingMovieInfoOnSheet(SpreadsheetApp.getActive().getSheetByName('🎬📃'));
}
function fillMissingArticleInfo() {
    const aylienDownloader = new AylienDownloader({
        backgroundColor,
        firstLineIndex: 2190, // 1-based
        applicationId: aylienApplicationID,
        applicationKey: aylienApplicationKey,
    });
    aylienDownloader.fillMissingInfo(SpreadsheetApp.getActive().getSheetByName('📰⭐'));
}
function fillMissingBookInfo() {
    const goodReadsDownloader = new GoodreadsDownloader({
        backgroundColor,
        apiKey: goodreadsApiKey,
        firstLineIndex: 7 // 1-based
    })
    goodReadsDownloader.fillMissingBookInfoOnSheet(SpreadsheetApp.getActive().getSheetByName('📚f'));
}
function fillExistDiaryItems() {
    const existDownloader = makeExistDownloader({
        username: existUsername,
        password: existPassword,
        existRepository: makeExistRepository(),
        numberOfDaysToFetch: 14
    })
    existDownloader.fillMissingDatesOnSheet(SpreadsheetApp.getActive().getSheetByName('Exist'));
}