import { ExistRepository } from './ExistRepository'
import Sheet = GoogleAppsScript.Spreadsheet.Sheet

export namespace ExistDownloader {
    export function fillMissingDatesOnSheet(
        sheet: Sheet,
        attributeLists: { [dateAsIsoString: string]: ExistRepository.AttributeListForDay }
    ): void {
        /* Get data */
        const datesOnSheet = sheet
            .getRange('A2:A')
            .getValues()
            .map(values => values[0])
            .filter(value => value)
            .map(value => toISO(value ? new Date(value) : null))
        const allTargetCells = sheet.getRange('B2:D')

        /* Feed data to spreadsheet cells */
        for (const [relativeRowIndex, dateString] of Object.entries(datesOnSheet)) {
            if (attributeLists[dateString]) {
                allTargetCells
                    .getCell(Number(relativeRowIndex) + 1, 1)
                    .setValue(attributeLists[dateString].mood_note.value)
                allTargetCells.getCell(Number(relativeRowIndex) + 1, 2).setValue(attributeLists[dateString].mood.value)
                // Collect tags with non-zero values, into a string
                const tags = collectTags(attributeLists, dateString)
                allTargetCells.getCell(Number(relativeRowIndex) + 1, 3).setValue(tags)
            }
        }
    }

    function collectTags(
        attributeLists: { [p: string]: ExistRepository.AttributeListForDay },
        dateString: string
    ): string {
        return Object.entries(attributeLists[dateString])
            .filter(([, value]) => value.type === 'Boolean')
            .filter(([, value]) => value.value === '1')
            .map(([key]) => key)
            .join(', ')
    }

    function toISO(date: Date | null): string {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return date ? `${date.getFullYear()}-${month}-${day}` : null
    }
}
