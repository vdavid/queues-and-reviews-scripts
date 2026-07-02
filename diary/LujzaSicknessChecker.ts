export namespace LujzaSicknessChecker {
    type Sheet = GoogleAppsScript.Spreadsheet.Sheet
    type Range = GoogleAppsScript.Spreadsheet.Range

    /**
     * This interface stores the final result from the LLM call:
     */
    interface LlmResult {
        skippedPreschool: boolean
        explanation: string
    }

    /**
     * This interface stores one row's recent context from columns A:B,E:F
     * for the previous ~5 days.
     */
    interface ContextRow {
        dateIsoString: string
        daySummary: string
        wasLujzaSick: boolean
        lujzaSicknessDescription: string
    }

    /**
     * For each selected row, read date+diary from columns A and B, gather up to 5 previous rows' E-F results for context,
     * call Gemini 2.0 to decide if Lujza was sick, then write the boolean to col E and short explanation to col F.
     */
    export function checkSickness(sheet: Sheet, range: Range, apiKey: string, callsPerMinute: number): void {
        const values = range.getValues() // 2D array
        const startRowIndex = range.getRow()
        const rateLimitedFetch: RateLimitedFetch = createRateLimitedFetch({ callsPerMinute })

        for (let relativeRowIndex = 0; relativeRowIndex < values.length; relativeRowIndex++) {
            const rowIndex = startRowIndex + relativeRowIndex
            const dateValue = Utilities.formatDate(values[relativeRowIndex][0] as Date, 'Etc/UTC', 'yyyy-MM-dd') // col A
            const diaryEntry = values[relativeRowIndex][1] as string // col B

            // Skip blank rows
            if (!dateValue || !diaryEntry) {
                continue
            }

            // Collect up to 5 prior rows for context
            const contextRows = getContextForRow(rowIndex, sheet)

            // Analyze
            const { skippedPreschool, explanation } = analyzeSicknessWithLLM(
                apiKey,
                rateLimitedFetch,
                dateValue,
                diaryEntry,
                contextRows
            )

            // Write cols E & F
            sheet.getRange(rowIndex, 5).setValue(skippedPreschool)
            sheet.getRange(rowIndex, 6).setValue(explanation)
        }
    }

    /**
     * For a given row index, reads the previous ~5 rows' A, B, E, and F columns for context.
     */
    function getContextForRow(targetRowIndex: number, sheet: GoogleAppsScript.Spreadsheet.Sheet): ContextRow[] {
        const contextRows: ContextRow[] = []
        for (let rowIndex = Math.max(2, targetRowIndex - 5); rowIndex < targetRowIndex; rowIndex++) {
            if (sheet.getRange(rowIndex, 1).getValue() === '') {
                continue
            }
            contextRows.push({
                dateIsoString: Utilities.formatDate(
                    sheet.getRange(rowIndex, 1).getValue() as Date,
                    'Etc/UTC',
                    'yyyy-MM-dd'
                ),
                daySummary: sheet.getRange(rowIndex, 2).getValue() as string,
                // eslint-disable-next-line eqeqeq
                wasLujzaSick: sheet.getRange(rowIndex, 5).getValue() == true,
                lujzaSicknessDescription: sheet.getRange(rowIndex, 6).getValue() as string,
            })
        }
        return contextRows
    }

    /**
     * Calls the Gemini 2.0-flash endpoint with date, diary, plus ~5 days of context,
     * returning whether Lujza was sick and an explanation.
     */
    function analyzeSicknessWithLLM(
        apiKey: string,
        rateLimitedFetch: RateLimitedFetch,
        dateIsoString: string,
        diaryEntry: string,
        recentContextRows: ContextRow[]
    ): LlmResult {
        const prompt = assemblePrompt(dateIsoString, recentContextRows, diaryEntry)

        if (!apiKey) {
            return {
                skippedPreschool: false,
                explanation: 'No Gemini API key in script properties!',
            }
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`
        const body = { contents: [{ parts: [{ text: prompt }] }] }
        const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
            method: 'post',
            contentType: 'application/json',
            muteHttpExceptions: true,
            payload: JSON.stringify(body),
        }

        try {
            const httpResponse = rateLimitedFetch(url, options)
            if (httpResponse.getResponseCode() !== 200) {
                const errorMessage = `Gemini returned status code ${httpResponse.getResponseCode()} with content: ${httpResponse.getContentText()}`
                Logger.log(errorMessage)
                return {
                    skippedPreschool: false,
                    explanation: errorMessage,
                }
            }
            return analyzeLlmResponse(httpResponse.getContentText())
        } catch (error) {
            return {
                skippedPreschool: false,
                explanation: `Error calling Gemini: ${error}`,
            }
        }
    }

    function assemblePrompt(dateIsoString: string, recentContextRows: ContextRow[], diaryEntry: string): string {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const dayOfWeek = dayNames[new Date(dateIsoString).getDay()] || ''

        // Build some text about the prior ~5 days
        const contextText = recentContextRows
            .map(
                row =>
                    `- ${row.dateIsoString}, Lujza was ${row.wasLujzaSick ? 'sick' : 'not sick'}, ${
                        row.lujzaSicknessDescription ? `more info: "${row.lujzaSicknessDescription}", ` : ''
                    }", and the full diary entry is this: "${row.daySummary}".\n`
            )
            .join('')

        return `
We have logs of Lujza (nickname: Lujzi)'s preschool attendance for the last few days, and mixed with a bunch of unrelated info from Lujza's dad's diary.
The task will be to determine if Lujza was sick today (the date given in the date parameter) based on the context above.

## Info from the previous days

${contextText}

## The task

Today, the date is ${dateIsoString} (a ${dayOfWeek}), and this is the diary entry to figure out Lujza's health from: "${diaryEntry}".

Your answer must be a valid JSON, without a markdown header like "\`\`\`json" or anything like that, just the pure JSON, in this format:
{"explanation": "...", "skippedPreschool": true/false}

More details:
- In the explanation:
    - Try to be concise, especially if Lujza was healthy. We don't care so much about the healthy days.
    - You can be incremental, like, if Lujza was sick on a few days based on the context, say sg like "Lujza was still sick, 4th day in a row.".
    - In case of an illness, you can say stuff like "Lujza had a fever but it was not a workday." (and mark it as skippedPreschool: false). We are generally interested in sick days.
    - If nothing stands out, leave the explanation blank. But the JSON still must be valid!
- Only set "skippedPreschool" to true on preschool days (should be clear from the diary) AND only if Lujza was sick.
`
    }

    export function analyzeLlmResponse(response: string): LlmResult {
        let responseData: { candidates: { content: { parts: { text: string }[] } }[] }
        try {
            responseData = JSON.parse(response) as { candidates: { content: { parts: { text: string }[] } }[] }
        } catch (error) {
            const errorMessage = `Error parsing response: ${error}. Response: ${response}`
            Logger.log(errorMessage)
            return { skippedPreschool: false, explanation: errorMessage }
        }

        // The model's returned text
        let text: string = responseData?.candidates[0]?.content?.parts[0]?.text

        if (text.startsWith('```json')) {
            // Extract the JSON content from the Markdown
            const jsonStart = text.indexOf('```json')
            text = text.slice(jsonStart + 7, text.indexOf('```', jsonStart + 1))
        }
        text = text.replace(/\\n/g, '\n').replace(/\\"/g, '"')
        let parsed: LlmResult
        try {
            parsed = JSON.parse(text) as LlmResult
        } catch (error) {
            const errorMessage = `Error parsing response: ${error}. Original text: ${responseData?.candidates[0]?.content?.parts[0]?.text}, text: ${text}`
            Logger.log(errorMessage)
            return {
                skippedPreschool: false,
                explanation: errorMessage,
            }
        }
        return { skippedPreschool: !!parsed.skippedPreschool, explanation: parsed.explanation || '' }
    }
}
