import { ExistDownloader } from './ExistDownloader'
import Sheet = GoogleAppsScript.Spreadsheet.Sheet

describe('ExistDownloader', () => {
    it('fills missing dates on sheet', () => {
        // Create mock sheet
        const getValues = jest.fn(() => [['2019-01-01'], ['2019-01-02'], ['2019-01-03']])
        const setValue = jest.fn()
        const getCell = jest.fn(() => ({ setValue }))
        const sheet = { getRange: jest.fn(() => ({ getValues, getCell })) } as unknown as Sheet

        // Create mock attribute list
        const attributeLists = {
            '2019-01-01': {
                mood: { type: 'Integer', value: 3 },
                mood_note: { type: 'String', value: 'note' },
                tag1: { type: 'Boolean', value: 1 },
                tag2: { type: 'Boolean', value: 0 },
                tag3: { type: 'Boolean', value: 1 },
            },
        }

        ExistDownloader.fillMissingDatesOnSheet(sheet, attributeLists)

        expect(sheet.getRange).toHaveBeenCalledTimes(2)
        expect(sheet.getRange).toHaveBeenNthCalledWith(1, 'A2:A')
        expect(sheet.getRange).toHaveBeenNthCalledWith(2, 'B2:D')
        expect(getValues).toHaveBeenCalledTimes(1)
        expect(getCell).toHaveBeenCalledTimes(3)
        expect(setValue).toHaveBeenCalledTimes(3)
        expect(setValue).toHaveBeenNthCalledWith(1, 'note')
        expect(setValue).toHaveBeenNthCalledWith(2, 3)
        expect(setValue).toHaveBeenNthCalledWith(3, 'tag1, tag3')
    })
})
