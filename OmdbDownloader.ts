function OmdbDownloader(options) {
    this.options = options || {};
    this.options.firstLineIndex = this.options.firstLineIndex || 7;

    this.fillMissingMovieInfoOnSheet = function (sheet) {
        const movieData = sheet.getRange('B' + this.options.firstLineIndex + ':K').getValues();
        for (let rowIndex = 0; rowIndex < movieData.length; rowIndex++) {
            const englishTitle = movieData[rowIndex][0];
            const originalTitle = movieData[rowIndex][1];
            const year = movieData[rowIndex][3];
            const imdbId = getImdbId(movieData[rowIndex][9]);

            if (englishTitle && !originalTitle) {
                fillMovieInfo.call(this, englishTitle, year, imdbId, sheet.getRange(this.options.firstLineIndex + rowIndex, 3, 1, 11));
            }
        }
    };

    /**
     * @param {string} title
     * @param {string?} year
     * @param {string?} imdbId If set, then title and year won't be used.
     */
    function fillMovieInfo(title, year, imdbId, dataRangeToSet) {
        const omdbData = downloadOmdbDataForMovie.call(this, title, year, imdbId);
        const cellValues = convertOmdbDataToCellValues.call(this, omdbData);
        if (cellValues[0] !== '') {
            dataRangeToSet.setValues([cellValues]);
            dataRangeToSet.setBackground(this.options.backgroundColor);
        } else {
            dataRangeToSet.getCell(1, 1).setValue('NOT FOUND :(');
            dataRangeToSet.getCell(1, 1).setBackground(this.options.backgroundColor);
        }
    }

    function downloadOmdbDataForMovie(title?: string, year?: string, imdbId?: string) {
        let url = `https://www.omdbapi.com/?apikey=${this.options.apiKey}${title ? `&t=${title}` : ''}${year ? `&y=${year}` : ''}${imdbId ? `&i=${imdbId}` : ''}`
        return JSON.parse(UrlFetchApp.fetch(url).getContentText());
    }

    function convertOmdbDataToCellValues(omdbData) {
        return [
            omdbData.Title ? omdbData.Title : '',
            '',
            omdbData.Year ? omdbData.Year : '',
            replaceCommasWithPipes(omdbData.Director),
            replaceCommasWithPipes(omdbData.Actors),
            replaceCommasWithPipes(omdbData.Genre),
            replaceCommasWithPipes(omdbData.Country),
            replaceCommasWithPipes(omdbData.Language),
            omdbData.imdbID ? 'https://www.imdb.com/title/' + omdbData.imdbID + '/' : '',
            omdbData.Runtime ? omdbData.Runtime.replace(/[^\d]+/g, '') : '',
            omdbData.imdbRating ? omdbData.imdbRating : '',
        ];
    }

    function replaceCommasWithPipes(string) {
        return string ? string.replace(/, /g, ' | ', string) : '';
    }

    function getImdbId(imdbLink) {
        return imdbLink.indexOf('/title/') > -1 ? imdbLink.slice(imdbLink.indexOf('/title/') + '/title/'.length, -1) : null;
    }
}