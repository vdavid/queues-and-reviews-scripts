import { LujzaSicknessChecker } from './LujzaSicknessChecker'

describe('analyzeLlmResponse', () => {
    it('can read a well-formed response', () => {
        const response = '{"skippedPreschool": false, "explanation": "Lujza was not sick today."}'

        const { skippedPreschool, explanation } = LujzaSicknessChecker.analyzeLlmResponse(wrapInJsonText(response))
        expect(skippedPreschool).toBe(false)
        expect(explanation).toBe('Lujza was not sick today.')
    })

    it('can read a response that contains escaped linebreaks', () => {
        const response =
            '{\\n  \\"skippedPreschool\\": false,\\n  \\"explanation\\": \\"Lujza was not sick today.\\"\\n}'

        const { skippedPreschool, explanation } = LujzaSicknessChecker.analyzeLlmResponse(wrapInJsonText(response))
        expect(skippedPreschool).toBe(false)
        expect(explanation).toBe('Lujza was not sick today.')
    })

    it('can read a Markdown-wrapped response', () => {
        const response =
            '```json\\n{\\n  \\"skippedPreschool\\": false,\\n  \\"explanation\\": \\"Lujza was not sick today.\\"\\n}\\n```\\n'

        const { skippedPreschool, explanation } = LujzaSicknessChecker.analyzeLlmResponse(wrapInJsonText(response))
        expect(skippedPreschool).toBe(false)
        expect(explanation).toBe('Lujza was not sick today.')
    })
})

function wrapInJsonText(responseText: string): string {
    return JSON.stringify({ candidates: [{ content: { parts: [{ text: responseText }] } }] })
}
