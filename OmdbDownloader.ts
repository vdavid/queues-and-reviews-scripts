namespace OmdbDownloader {
    import Range = GoogleAppsScript.Spreadsheet.Range
    import Sheet = GoogleAppsScript.Spreadsheet.Sheet

    interface OmdbResponse {
        Title: string // "Matrix",
        Year: string // "1993",
        Rated: string // "N/A",
        Released: string // "01 Mar 1993",
        Runtime: string // "60 min",
        Genre: string // "Action, Drama, Fantasy",
        Director: string // "N/A",
        Writer: string // "Donald Case",
        Actors: string // "Nick Manner, Phillip Jarrett, Carrie-Anne Moss",
        Plot: string // "Steven Matrix is one of the underworld's foremost...",
        Language: string // "English",
        Country: string // "Canada",
        Awards: string // "1 win",
        Poster: string // "https://m.media-amazon.com/images/M/MV5BYzUzOTA5ZTMtMTdlZS00MmQ5LWFmNjEtMjE5MTczN2RjNjE3XkEyXkFqcGdeQXVyNTc2ODIyMzY@._V1_SX300.jpg",
        Ratings: {
            Source: string // "Internet Movie Database"
            Value: string // "7.7/10"
        }[]
        Metascore: string // "N/A",
        imdbRating: string // "7.7",
        imdbVotes: string // "196",
        imdbID: string // "tt0106062",
        Type: string // "series",
        totalSeasons: string // "N/A",
        Response: string // "True"
    }

    export function fillMissingMovieInfoOnSheet(
        apiKey: string,
        firstLineIndex: number,
        backgroundColor: string,
        sheet: Sheet
    ): void {
        const movieData = sheet.getRange(`B${firstLineIndex}:K`).getValues() as string[][]
        for (let rowIndex = 0; rowIndex < movieData.length; rowIndex++) {
            const englishTitle = movieData[rowIndex][0]
            const originalTitle = movieData[rowIndex][1]
            const year = movieData[rowIndex][3]
            const imdbId = getImdbId(movieData[rowIndex][9])

            if (englishTitle && !originalTitle) {
                fillMovieInfo(
                    apiKey,
                    backgroundColor,
                    sheet.getRange(firstLineIndex + rowIndex, 3, 1, 11),
                    englishTitle,
                    year,
                    imdbId
                )
            }
        }
    }

    // If imdbId is set, title and year won't be used.
    function fillMovieInfo(
        apiKey: string,
        bgColor: string,
        target: Range,
        title?: string,
        year?: string,
        imdbId?: string
    ): void {
        const omdbData = downloadOmdbDataForMovie(apiKey, title, year, imdbId)
        const cellValues = toCellValues(omdbData)
        if (cellValues[0] === '') {
            target.getCell(1, 1).setValue('NOT FOUND :(')
            target.getCell(1, 1).setBackground(bgColor)
        } else {
            target.setValues([cellValues])
            target.setBackground(bgColor)
        }
    }

    function downloadOmdbDataForMovie(apiKey: string, title?: string, year?: string, imdbId?: string): OmdbResponse {
        const url = `https://www.omdbapi.com/?apikey=${apiKey}${title ? `&t=${title}` : ''}${year ? `&y=${year}` : ''}${
            imdbId ? `&i=${imdbId}` : ''
        }`
        return JSON.parse(UrlFetchApp.fetch(url).getContentText())
    }

    function toCellValues(omdbData: OmdbResponse): (string | number)[] {
        return [
            omdbData.Title ?? '',
            '',
            omdbData.Year ?? '',
            replaceCommasWithPipes(omdbData.Director),
            replaceCommasWithPipes(omdbData.Actors),
            replaceCommasWithPipes(omdbData.Genre),
            replaceCommasWithPipes(omdbData.Country),
            replaceCommasWithPipes(omdbData.Language),
            omdbData.imdbID ? `https://www.imdb.com/title/${omdbData.imdbID}/` : '',
            omdbData.Runtime ? omdbData.Runtime.replace(/\D+/g, '') : '',
            omdbData.imdbRating ?? '',
        ]
    }

    function replaceCommasWithPipes(string: string): string {
        return string ? string.replace(/, /g, ' | ') : ''
    }

    function getImdbId(imdbLink: string): string | null {
        return imdbLink.includes('/title/') ? imdbLink.slice(imdbLink.indexOf('/title/') + '/title/'.length, -1) : null
    }
}
