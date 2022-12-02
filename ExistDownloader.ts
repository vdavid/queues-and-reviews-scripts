namespace ExistDownloader {
    import Sheet = GoogleAppsScript.Spreadsheet.Sheet

    export function fillMissingDatesOnSheet(sheet: Sheet, token: string, daysToFetch: number): void {
        /* Get data */
        const attributeLists = ExistRepository.getAttributeLists(token, ['mood', 'mood_note'], daysToFetch)
        const datesOnSheet = sheet
            .getRange('A2:A')
            .getValues()
            .map(values => values[0])
            .filter(value => value)
            .map(value => toISO(value ? new Date(value) : null))
        const allTargetCells = sheet.getRange('B2:C')

        /* Feed data to spreadsheet cells */
        for (const [relativeRowIndex, dateString] of Object.entries(datesOnSheet)) {
            if (attributeLists[dateString]) {
                allTargetCells.getCell(Number(relativeRowIndex) + 1, 1).setValue(attributeLists[dateString].mood_note)
                allTargetCells.getCell(Number(relativeRowIndex) + 1, 2).setValue(attributeLists[dateString].mood)
            }
        }
    }

    function toISO(date: Date | null): string {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return date ? `${date.getFullYear()}-${month}-${day}` : null
    }
}
