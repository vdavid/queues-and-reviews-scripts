// Add these types and functions before the analyzeSicknessWithLLM function

type RateLimitedFetchConfig = {
    callsPerMinute: number
    lastCallTime?: number
    callCount?: number
    resetTime?: number
}

type RateLimitedFetch = (
    url: string,
    options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions
) => GoogleAppsScript.URL_Fetch.HTTPResponse

function createRateLimitedFetch(config: RateLimitedFetchConfig): RateLimitedFetch {
    const state = {
        lastCallTime: Date.now(),
        callCount: 0,
        resetTime: Date.now(),
        ...config,
    }

    return function rateLimitedFetch(
        url: string,
        options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions
    ): GoogleAppsScript.URL_Fetch.HTTPResponse {
        const now = Date.now()
        const oneMinute = 60 * 1000

        // Reset counter if minute has passed
        if (now - state.resetTime >= oneMinute) {
            state.callCount = 0
            state.resetTime = now
        }

        // Check if rate limit reached
        if (state.callCount >= state.callsPerMinute) {
            const waitTime = oneMinute - (now - state.resetTime)
            console.log(`Rate limit reached. Waiting ${waitTime / 1000} s.`)
            Utilities.sleep(waitTime)
            state.callCount = 0
            state.resetTime = Date.now()
        }

        // Make the fetch call
        const response = UrlFetchApp.fetch(url, options)

        // Update state
        state.lastCallTime = Date.now()
        state.callCount++

        return response
    }
}
