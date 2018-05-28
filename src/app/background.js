let api = chrome || browser

api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status != 'complete') return

	if (! tab.title.match(new RegExp('.+? \\([#!]\\d+\\) · (Issues|Merge Requests) · .+? · GitLab'))) return

	chrome.tabs.executeScript(tabId, { file: 'app/timer.js' })
})
