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
    value_type_description: string // E.g. "Boolean"
    service: string
    values: {
        value: string | number | null
        date: string // YYYY-MM-DD
    }[]
}

export namespace ExistRepository {
    // Name (e.g. "cook") to value (e.g. "1") and type (e.g. "Boolean")
    export interface AttributeListForDay {
        [key: ExistAttribute['attribute']]: {
            value: ExistAttribute['values'][0]['value']
            type: ExistAttribute['value_type_description']
        }
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
        attributeNames: string[] | 'all',
        dayCount: number,
        lastDate?: Date
    ): { [dateAsIsoString: string]: AttributeListForDay } {
        lastDate = lastDate || new Date()
        const results = {}
        const date = lastDate
        while (Object.keys(results).length < dayCount) {
            const dateAsIsoString = date.toISOString().slice(0, 10)
            const url = assembleAttributeUrl(attributeNames, dateAsIsoString)
            const response = fetchUrlViaHttpGetWithToken(url, token)
            const attributeListForDay = convertDay(response)
            if (!Object.keys(attributeListForDay).length) {
                break
            }
            results[date.toISOString().slice(0, 10)] = attributeListForDay
            date.setDate(date.getDate() - 1)
        }
        return results
    }

    export function assembleAttributeUrl(attributeNames: string[] | 'all', dateAsIsoString: string): string {
        const query = {
            ...(attributeNames === 'all' ? {} : { attributes: attributeNames.join(',') }),
            limit: 1,
            page: 1,
            date_max: dateAsIsoString,
        }
        return `${baseUrl}users/$self/attributes/?${Object.entries(query)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')}`
    }

    function convertDay(response: ExistAttributesApiResponse): AttributeListForDay {
        const namesValues = response.map(item => ({
            name: item.attribute,
            value: item.values.length ? item.values[0].value : undefined,
            type: item.value_type_description,
        }))
        const namesValuesFiltered = namesValues.filter(a => a.value !== undefined)
        return namesValuesFiltered.reduce((result, item) => {
            result[item.name] = { value: item.value, type: item.type }
            return result
        }, {})
    }

    function fetchUrlViaHttpGetWithToken(url: string, token: string): ExistAttributesApiResponse {
        const response = UrlFetchApp.fetch(url, { method: 'get', headers: { Authorization: 'Token ' + token } })
        return JSON.parse(response.getContentText())
    }
}
