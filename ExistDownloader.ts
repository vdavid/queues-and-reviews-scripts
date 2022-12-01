// Compiled using scripts-for-davids-queues-and-reviews 1.0.0 (TypeScript 4.5.4)
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};

var exports = exports || {};
var module = module || { exports: exports };
exports.makeExistDownloader = void 0;
//import {ExistRepository} from './ExistRepository';
function makeExistDownloader(_a) {
    var username = _a.username, password = _a.password, existRepository = _a.existRepository, numberOfDaysToFetch = _a.numberOfDaysToFetch;
    function fillMissingDatesOnSheet(sheet) {
        var e_1, _a;
        /* Get data */
        var token = existRepository.doSimpleTokenAuthentication(username, password);
        var dateAsIsoStringToMoodNoteMap = existRepository.getAttributes(token, ['mood', 'mood_note'], numberOfDaysToFetch);
        var allDatesOnSheet = sheet.getRange('A2:A').getValues()
            .map(function (values) { return values[0]; })
            .filter(function (x) { return x; })
            .map(function (value) { return getISODateString(new Date(value)); });
        var allTargetCells = sheet.getRange('B2:C');
        try {
            /* Update all fields with data */
            for (var _b = __values(allDatesOnSheet.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), relativeRowIndex = _d[0], dateAsIsoString = _d[1];
                if (dateAsIsoStringToMoodNoteMap[dateAsIsoString]) {
                    allTargetCells.getCell(relativeRowIndex + 1, 1).setValue(dateAsIsoStringToMoodNoteMap[dateAsIsoString]['mood_note']);
                    allTargetCells.getCell(relativeRowIndex + 1, 2).setValue(dateAsIsoStringToMoodNoteMap[dateAsIsoString]['mood']);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    function getISODateString(date) {
        return (date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + (date.getDate())).slice(-2));
    }
    return Object.freeze({
        fillMissingDatesOnSheet: fillMissingDatesOnSheet
    });
}
exports.makeExistDownloader = makeExistDownloader;