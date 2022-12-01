// Compiled using scripts-for-davids-queues-and-reviews 1.0.0 (TypeScript 4.5.4)
var exports = exports || {};
var module = module || { exports: exports };
exports.makeExistRepository = void 0;
function makeExistRepository() {
    var baseUrl = 'https://exist.io/api/1/';
    function doSimpleTokenAuthentication(username, password) {
        var response = UrlFetchApp.fetch(baseUrl + 'auth/simple-token/', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            payload: JSON.stringify({ username: username, password: password })
        });
        return JSON.parse(response.getContentText()).token;
    }
    /**
     * API docs: http://developer.exist.io/#get-a-specific-attribute
     */
    function getAttributes(token, attributeNames, numberOfDaysToGet, mostRecentDateToGet) {
        if (mostRecentDateToGet === void 0) { mostRecentDateToGet = new Date(); }
        var attributeNamesAsString = attributeNames.join(',');
        var results = {};
        var date = mostRecentDateToGet;
        var lastResponseWasEmpty = false;
        while (!lastResponseWasEmpty && (Object.keys(results).length < numberOfDaysToGet)) {
            var dateAsIsoString = date.toISOString().substring(0, 10);
            var url = baseUrl + 'users/$self/attributes/' + '?attributes=' + attributeNamesAsString + '&limit=1&page=1&date_max=' + dateAsIsoString;
            var response = JSON.parse(_fetchUrlViaHttpGetWithToken(url, token));
            var parsedResponse = _convertAttributeResponseToDay(response);
            lastResponseWasEmpty = !(Object.keys(parsedResponse).length);
            if (Object.keys(parsedResponse).length) {
                results[dateAsIsoString] = parsedResponse;
            }
            date.setDate(date.getDate() - 1);
        }
        return results;
    }
    /**
     * @param {{attribute: string, values: {date: string, value: int|string|null}[]}} response
     * @returns {Object<string, string|int|null>} Key: attribute name, Value: attribute value
     */
    function _convertAttributeResponseToDay(response) {
        var namesAndValues = response.map(function (item) { return ({ name: item.attribute, value: item.values.length ? item.values[0].value : undefined }); });
        var namesAndValuesWithoutEmptyItems = namesAndValues.filter(function (item) { return item.value !== undefined; });
        return namesAndValuesWithoutEmptyItems.reduce(function (result, item) {
            result[item.name] = item.value;
            return result;
        }, {});
    }
    /**
     * @param {string} url
     * @param {string} token
     * @returns {string} The raw response as a text
     */
    function _fetchUrlViaHttpGetWithToken(url, token) {
        var response = UrlFetchApp.fetch(url, { method: 'get', headers: { Authorization: 'Token ' + token } });
        return response.getContentText();
    }
    return Object.freeze({
        doSimpleTokenAuthentication: doSimpleTokenAuthentication,
        getAttributes: getAttributes
    });
}
exports.makeExistRepository = makeExistRepository;