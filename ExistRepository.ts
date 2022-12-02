type ExistAttributesApiResponse = ExistAttribute[]

interface ExistAttribute {
    group: {
        name: string
        label: string
        priority: number
    }
    attribute: string
    label: string
    priority: number
    value_type: number
    value_type_description: string
    service: string
    values: {
        value: string | number | null
        date: string // YYYY-MM-DD
    }[]
}

namespace ExistRepository {
    interface AttributeListForDay {
        [key: ExistAttribute['attribute']]: ExistAttribute['values'][0]['value']
    }

    const baseUrl = 'https://exist.io/api/1/'

    export function doSimpleTokenAuthentication(username: string, password: string): string {
        const response = UrlFetchApp.fetch(baseUrl + 'auth/simple-token/', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            payload: JSON.stringify({ username, password }),
        })
        return (JSON.parse(response.getContentText()) as { token: string }).token
    }

    /**
     * API docs: http://developer.exist.io/#get-a-specific-attribute
     */
    export function getAttributeLists(
        token: string,
        attributeNames: string[],
        dayCount: number,
        lastDate?: Date
    ): { [dateAsIsoString: string]: AttributeListForDay } {
        lastDate = lastDate || new Date()
        const attributeNamesAsString = attributeNames.join(',')
        const results = {}
        const date = lastDate
        while (Object.keys(results).length < dayCount) {
            const dateAsIsoString = date.toISOString().slice(0, 10)
            const url = `${baseUrl}users/$self/attributes/?attributes=${attributeNamesAsString}&limit=1&page=1&date_max=${dateAsIsoString}`
            const response = fetchUrlViaHttpGetWithToken(url, token)
            const attributeListForDay = convertDay(response)
            if (!Object.keys(attributeListForDay).length) {
                break
            }
            results[dateAsIsoString] = attributeListForDay
            date.setDate(date.getDate() - 1)
        }
        return results
    }

    function convertDay(response: ExistAttributesApiResponse): AttributeListForDay {
        const namesValues = response.map(item => ({
            name: item.attribute,
            value: item.values.length ? item.values[0].value : undefined,
        }))
        const namesValuesFiltered = namesValues.filter(a => a.value !== undefined)
        return namesValuesFiltered.reduce((result, item) => {
            result[item.name] = item.value
            return result
        }, {})
    }

    function fetchUrlViaHttpGetWithToken(url: string, token: string): ExistAttributesApiResponse {
        const response = UrlFetchApp.fetch(url, { method: 'get', headers: { Authorization: 'Token ' + token } })
        return JSON.parse(response.getContentText())
    }
}
