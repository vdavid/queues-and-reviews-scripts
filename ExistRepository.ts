interface ExistAttributesApiResponse {
    next: string | null
    results: ExistAttribute[]
}

interface ExistAttribute {
    group: {
        name: string
        label: string
        priority: number
    }
    template: string // e.g. "steps"
    name: string // e.g. "steps"
    label: string // e.g. "Steps"
    priority: number // e.g. 1
    manual: boolean
    active: boolean
    value_type: number // e.g. 1
    value_type_description: string // E.g. "Boolean"
    service: {
        name: string // e.g. "googlefit"
        label: string // e.g. "Google Fit"
    }
    values: [
        {
            date: string // YYYY-MM-DD
            value: string | number | null
        }
    ]
}

export namespace ExistRepository {
    // Name (e.g. "cook") to value (e.g. "1") and type (e.g. "Boolean")
    export interface AttributeListForDay {
        [key: ExistAttribute['name']]: {
            value: ExistAttribute['values'][0]['value']
            type: ExistAttribute['value_type_description']
        }
    }

    const baseUrl = 'https://exist.io/api/2/'

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
        dayCount: number,
        attributeNames: string[] | 'all' = 'all',
        lastDate: Date = new Date()
    ): { [dateAsIsoString: string]: AttributeListForDay } {
        const results = {}
        const currentDate = lastDate
        const batchSize = Math.min(dayCount, 30)
        while (Object.keys(results).length < dayCount) {
            // Assemble URL
            const url = assembleAttributeUrl(attributeNames, currentDate.toISOString().slice(0, 10), batchSize)

            // Fetch data for the next batch of days
            const response = fetchAllPages(url, token)
            const daysInResponse: string[] = response.results
                .map(result => result.values.map(value => value.date))
                .flat()
                .filter((value, index, self) => self.indexOf(value) === index)
            for (const isoDate of daysInResponse) {
                const attributeListForDay = convertDay(response, isoDate)
                if (!Object.keys(attributeListForDay).length) {
                    break
                }
                results[isoDate] = attributeListForDay
            }

            // Move on to the next batch of days
            currentDate.setDate(currentDate.getDate() - batchSize)
        }
        return results
    }

    // Fetches paginated pages recursively. It's not optimal, but it's simple.
    function fetchAllPages(url: string, token: string): ExistAttributesApiResponse {
        const response = fetchUrlViaHttpGetWithToken(url, token)
        if (response.next) {
            const nextResponse = fetchAllPages(response.next, token)
            return {
                next: null,
                results: response.results.concat(nextResponse.results),
            }
        }
        return response
    }

    export function assembleAttributeUrl(
        attributeNames: string[] | 'all',
        dateAsIsoString: string,
        dayCount: number
    ): string {
        const query = {
            ...(attributeNames === 'all' ? {} : { attributes: attributeNames.join(',') }),
            days: dayCount,
            date_max: dateAsIsoString,
        }
        return `${baseUrl}attributes/with-values/?${Object.entries(query)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')}`
    }

    function convertDay(response: ExistAttributesApiResponse, isoDate: string): AttributeListForDay {
        const namesValues = response.results.map(item => ({
            name: item.name,
            value: item.values.length ? item.values.find(value => value.date === isoDate).value : undefined,
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
