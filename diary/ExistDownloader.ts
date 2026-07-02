import { ExistRepository } from './ExistRepository'

type Sheet = GoogleAppsScript.Spreadsheet.Sheet

export namespace ExistDownloader {
    export function fillMissingDatesOnSheet(
        sheet: Sheet,
        attributeLists: { [dateAsIsoString: string]: ExistRepository.AttributeListForDay },
    ): void {
        /* Get data */
        const datesOnSheet = sheet
            .getRange('A2:A')
            .getValues()
            .map((values) => values[0] as string | null)
            .filter((value): value is string => !!value)
            .map((value) => toISO(new Date(value)))
        const allTargetCells = sheet.getRange('B2:D')

        /* Feed data to spreadsheet cells */
        for (const [relativeRowIndex, dateString] of Object.entries(datesOnSheet)) {
            const attributeList = attributeLists[dateString]
            if (attributeList) {
                allTargetCells.getCell(Number(relativeRowIndex) + 1, 1).setValue(attributeList.mood_note.value)
                allTargetCells.getCell(Number(relativeRowIndex) + 1, 2).setValue(attributeList.mood.value)
                const tags = collectTags(attributeList)
                allTargetCells.getCell(Number(relativeRowIndex) + 1, 3).setValue(tags)
            }
        }
    }

    // Collects tags with non-zero values into a string
    function collectTags(attributeList: ExistRepository.AttributeListForDay): string {
        return Object.entries(attributeList)
            .filter(([, value]) => value.type === 'Boolean')
            .filter(([, value]) => value.value === 1)
            .map(([key]) => key)
            .join(', ')
    }

    function toISO(date: Date): string {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${date.getFullYear()}-${month}-${day}`
    }
}
