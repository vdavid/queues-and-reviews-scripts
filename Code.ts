import { ExistDownloader } from './ExistDownloader'
import { ExistRepository } from './ExistRepository'

const aylienApplicationID = PropertiesService.getScriptProperties().getProperty('aylienApplicationID')
const aylienApplicationKey = PropertiesService.getScriptProperties().getProperty('aylienApplicationKey')
const existUsername = PropertiesService.getScriptProperties().getProperty('existUsername')
const existPassword = PropertiesService.getScriptProperties().getProperty('existPassword')
const goodreadsApiKey = PropertiesService.getScriptProperties().getProperty('goodreadsApiKey')
const omdbApiKey = PropertiesService.getScriptProperties().getProperty('omdbApiKey')

const backgroundColor = '#d88'

// noinspection JSUnusedLocalSymbols
function onOpen(): void {
    SpreadsheetApp.getUi()
        .createMenu('Scripts')
        .addItem('Fill missing movie info for movie queue', 'fillMissingMovieQueueInfo')
        .addItem('Fill missing movie info for movie reviews', 'fillMissingMovieReviewInfo')
        .addItem('Fill missing info for article reviews', 'fillMissingArticleInfo')
        .addItem('Fill missing info for fiction books', 'fillMissingBookInfo')
        .addItem('Update last 7 days Exist data', 'fillExistDiaryItems')
        // .addItem('Export all articles in JSON', 'exportAllArticlesInJson') // Deployed as a web app here: https://script.google.com/macros/s/AKfycby6iNqW8-KWFiudJqWZEiGR-nRa38sJ0uMDs7-Da4KFlZ4gRKM/exec?limit=5
        .addToUi()
}

function fillMissingMovieReviewInfo(): void {
    OmdbDownloader.fillMissingMovieInfoOnSheet(
        omdbApiKey,
        820, // 1-based
        backgroundColor,
        SpreadsheetApp.getActive().getSheetByName('🎬⭐')
    )
}

function fillMissingMovieQueueInfo(): void {
    OmdbDownloader.fillMissingMovieInfoOnSheet(
        omdbApiKey,
        7, // 1-based
        backgroundColor,
        SpreadsheetApp.getActive().getSheetByName('🎬📃')
    )
}

function fillMissingArticleInfo(): void {
    AylienDownloader.fillMissingInfo(
        aylienApplicationID,
        aylienApplicationKey,
        2190, // 1-based
        backgroundColor,
        SpreadsheetApp.getActive().getSheetByName('📰⭐')
    )
}

function fillMissingBookInfo(): void {
    GoodreadsDownloader.fillMissingBookInfoOnSheet(
        goodreadsApiKey,
        7,
        backgroundColor,
        SpreadsheetApp.getActive().getSheetByName('📚f')
    )
}

function fillExistDiaryItems(): void {
    const token = ExistRepository.doSimpleTokenAuthentication(existUsername, existPassword)
    const sheet = SpreadsheetApp.getActive().getSheetByName('Exist')
    const attributeLists = ExistRepository.getAttributeLists(token, 14, 'all', new Date())
    ExistDownloader.fillMissingDatesOnSheet(sheet, attributeLists)
}
