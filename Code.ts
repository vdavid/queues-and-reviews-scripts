import { ArticleJsonExporter } from './articles/ArticleJsonExporter'
import { AylienDownloader } from './articles/AylienDownloader'
import { GoodreadsDownloader } from './books/GoodreadsDownloader'
import { ExistDownloader } from './diary/ExistDownloader'
import { ExistRepository } from './diary/ExistRepository'
import { LujzaSicknessChecker } from './diary/LujzaSicknessChecker'
import { OmdbDownloader } from './movies/OmdbDownloader'

const aylienApplicationID = PropertiesService.getScriptProperties().getProperty('aylienApplicationID')
const aylienApplicationKey = PropertiesService.getScriptProperties().getProperty('aylienApplicationKey')
const existUsername = PropertiesService.getScriptProperties().getProperty('existUsername')
const existPassword = PropertiesService.getScriptProperties().getProperty('existPassword')
const goodreadsApiKey = PropertiesService.getScriptProperties().getProperty('goodreadsApiKey')
const omdbApiKey = PropertiesService.getScriptProperties().getProperty('omdbApiKey')
const geminiApiKey = PropertiesService.getScriptProperties().getProperty('geminiApiKey')
const queuesAndReviewsUrl = PropertiesService.getScriptProperties().getProperty('queuesAndReviewsUrl')
const articleReviewsSheetId = PropertiesService.getScriptProperties().getProperty('articleReviewsSheetId')

const backgroundColor = '#d88'

export function onOpen(): void {
    SpreadsheetApp.getUi()
        .createMenu('Scripts')
        .addItem('Fill missing movie info for movie queue', 'fillMissingMovieQueueInfo')
        .addItem('Fill missing movie info for movie reviews', 'fillMissingMovieReviewInfo')
        .addItem('Fill missing info for article reviews', 'fillMissingArticleInfo')
        .addItem('Fill missing info for fiction books', 'fillMissingBookInfo')
        .addItem('Update last 7 days Exist data', 'fillExistDiaryItems')
        .addItem("Check Lujza's sickness for selection", 'checkLujzaSickness')
        // .addItem('Export all articles in JSON', 'exportAllArticlesInJson') // Deployed as a web app here: https://script.google.com/macros/s/AKfycby6iNqW8-KWFiudJqWZEiGR-nRa38sJ0uMDs7-Da4KFlZ4gRKM/exec?limit=5
        .addToUi()
}

export function fillMissingMovieReviewInfo(): void {
    OmdbDownloader.fillMissingMovieInfoOnSheet(
        omdbApiKey,
        1000, // 1-based
        backgroundColor,
        SpreadsheetApp.getActive().getSheetByName('🎬⭐')
    )
}

export function fillMissingMovieQueueInfo(): void {
    OmdbDownloader.fillMissingMovieInfoOnSheet(
        omdbApiKey,
        170, // 1-based
        backgroundColor,
        SpreadsheetApp.getActive().getSheetByName('🎬💡')
    )
}

export function fillMissingArticleInfo(): void {
    AylienDownloader.fillMissingInfo(
        aylienApplicationID,
        aylienApplicationKey,
        2190, // 1-based
        backgroundColor,
        SpreadsheetApp.getActive().getSheetByName('📰⭐')
    )
}

export function fillMissingBookInfo(): void {
    GoodreadsDownloader.fillMissingBookInfoOnSheet(
        goodreadsApiKey,
        7,
        backgroundColor,
        SpreadsheetApp.getActive().getSheetByName('📚f')
    )
}

export function fillExistDiaryItems(): void {
    const token = ExistRepository.doSimpleTokenAuthentication(existUsername, existPassword)
    const sheet = SpreadsheetApp.getActive().getSheetByName('Exist')
    const attributeLists = ExistRepository.getAttributeLists(token, 14, 'all', new Date())
    ExistDownloader.fillMissingDatesOnSheet(sheet, attributeLists)
}

export function checkLujzaSickness(): void {
    const sheet = SpreadsheetApp.getActive().getSheetByName('Exist')
    const range = sheet.getRange('A1383:B1498') // Set the range to fill here. Must be A:B.
    LujzaSicknessChecker.checkSickness(sheet, range, geminiApiKey, 9) // Allows max 10 calls per minute to the Gemini API.
}

// Web app entry point. See https://developers.google.com/apps-script/guides/web for details.
// To use this script, publish it as a web app, and then visit the URL provided.
export function doGet(event: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
    const sheet = SpreadsheetApp.openByUrl(queuesAndReviewsUrl)
        .getSheets()
        .find(sheet => sheet.getSheetId() === parseInt(articleReviewsSheetId, 10)) // Sheet "📰⭐", but it didn't seem to work by name.
    const data = sheet.getRange('A7:M').getValues() as string[][]
    const articles = ArticleJsonExporter.parseRaw(data, parseInt(event.parameter.limit ?? '0', 10))
    return ContentService.createTextOutput(JSON.stringify(articles)).setMimeType(ContentService.MimeType.JSON)
}

// Test function for the web app.
export function testDoGet(): void {
    const textOutput = doGet({
        queryString: 'limit=5',
        parameter: {
            limit: '5',
        },
        contextPath: '',
        parameters: {
            limit: ['5'],
        },
        contentLength: -1,
        pathInfo: '',
    })
    Logger.log(textOutput.getContent())
}
