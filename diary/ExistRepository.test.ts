import { ExistRepository } from './ExistRepository'

const responsePages = [
    {
        count: 54,
        next: 'https://exist.io/api/2/attributes/with-values/?date_max=2022-10-14&days=2&page=2',
        previous: null,
        results: [
            {
                group: { name: 'custom', label: 'Custom tags', priority: 3 },
                template: null,
                name: 'alcohol',
                label: 'alcohol',
                priority: 2,
                manual: true,
                active: true,
                value_type: 7,
                value_type_description: 'Boolean',
                service: { name: 'exist_for_android', label: 'Exist for Android' },
                values: [
                    { date: '2022-10-14', value: 0 },
                    { date: '2022-10-13', value: 0 },
                ],
            },
            {
                group: { name: 'custom', label: 'Custom tags', priority: 3 },
                template: null,
                name: 'floss',
                label: 'floss',
                priority: 2,
                manual: true,
                active: true,
                value_type: 7,
                value_type_description: 'Boolean',
                service: { name: 'exist_for_android', label: 'Exist for Android' },
                values: [
                    { date: '2022-10-14', value: 1 },
                    { date: '2022-10-13', value: 1 },
                ],
            },
        ],
    },
    {
        count: 54,
        next: 'https://exist.io/api/2/attributes/with-values/?date_max=2022-10-14&days=2&page=3',
        previous: 'https://exist.io/api/2/attributes/with-values/?date_max=2022-10-14&days=2',
        results: [
            {
                group: { name: 'mood', label: 'Mood', priority: 3 },
                template: 'mood',
                name: 'mood',
                label: 'Mood',
                priority: 1,
                manual: true,
                active: true,
                value_type: 8,
                value_type_description: 'Integer scale (1-9)',
                service: { name: 'exist_for_android', label: 'Exist for Android' },
                values: [
                    { date: '2022-10-14', value: 7 },
                    { date: '2022-10-13', value: 7 },
                ],
            },
            {
                group: { name: 'mood', label: 'Mood', priority: 3 },
                template: 'mood_note',
                name: 'mood_note',
                label: 'Daily note',
                priority: 5,
                manual: true,
                active: true,
                value_type: 2,
                value_type_description: 'String',
                service: { name: 'exist_for_android', label: 'Exist for Android' },
                values: [
                    { date: '2022-10-14', value: 'mood_note1' },
                    { date: '2022-10-13', value: 'mood_note2' },
                ],
            },
        ],
    },
    {
        count: 54,
        next: null,
        previous: 'https://exist.io/api/2/attributes/with-values/?date_max=2022-10-14&days=2&page=2',
        results: [],
    },
]

let mockPageIndex = 0
global.UrlFetchApp = {
    fetch: jest.fn(() => ({
        getContentText: jest.fn(() => JSON.stringify(responsePages[mockPageIndex++])),
    })),
} as unknown as GoogleAppsScript.URL_Fetch.UrlFetchApp

describe('ExistRepository', () => {
    it('can assemble attribute URL with attribute list', () => {
        const attributeNames = ['mood', 'mood_note', 'tag1', 'tag2', 'tag3']
        const url = ExistRepository.assembleAttributeUrl(attributeNames, '2022-10-14', 2)

        expect(url).toEqual(
            'https://exist.io/api/2/attributes/with-values/?attributes=mood,mood_note,tag1,tag2,tag3&days=2&date_max=2022-10-14'
        )
    })

    it('can assemble attribute URL for all attributes', () => {
        const url = ExistRepository.assembleAttributeUrl('all', '2022-10-14', 2)

        expect(url).toEqual('https://exist.io/api/2/attributes/with-values/?days=2&date_max=2022-10-14')
    })

    it('can get attribute lists', () => {
        const attributeLists = ExistRepository.getAttributeLists('token', 2, 'all', new Date('2022-10-14'))

        expect(global.UrlFetchApp.fetch).toHaveBeenCalledTimes(3)
        expect(attributeLists).toHaveProperty('2022-10-14')
        expect(attributeLists).toHaveProperty('2022-10-13')
        expect(attributeLists['2022-10-14']).toHaveProperty('mood')
        expect(attributeLists['2022-10-14']).toHaveProperty('mood_note')
        expect(attributeLists['2022-10-14'].floss.value).toEqual(1)
        expect(attributeLists['2022-10-14'].alcohol.value).toEqual(0)
    })
})
