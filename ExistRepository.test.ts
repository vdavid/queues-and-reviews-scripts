import { ExistRepository } from './ExistRepository'

describe('ExistRepository', () => {
    it('can assemble attribute URL with attribute list', () => {
        const attributeNames = ['mood', 'mood_note', 'tag1', 'tag2', 'tag3']
        const url = ExistRepository.assembleAttributeUrl(attributeNames, '2019-01-01')

        expect(url).toEqual(
            'https://exist.io/api/1/users/$self/attributes/?attributes=mood,mood_note,tag1,tag2,tag3&limit=1&page=1&date_max=2019-01-01'
        )
    })

    it('can assemble attribute URL for all attributes', () => {
        const url = ExistRepository.assembleAttributeUrl('all', '2019-01-01')

        expect(url).toEqual('https://exist.io/api/1/users/$self/attributes/?limit=1&page=1&date_max=2019-01-01')
    })
})
