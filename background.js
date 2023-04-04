//ON EXTENSION ICON CLICKED
chrome.action.onClicked.addListener(function () {
    /* not implemented */
});

//if value ist stored in local storage in popupjs this event fires
chrome.storage.onChanged.addListener((changes, namespace) => {
    if ('profilesContainer' in changes) {
        const profilesContainerChange = changes.profilesContainer;
        const profilesContainer = profilesContainerChange.newValue;
        const activeRequestHeadersRules = profilesContainer.paused ? [] : createRequestHeadersWithUrlFilterRules(profilesContainer);
        applyChangedRequestHeaders(activeRequestHeadersRules);
    }
});

function createRequestHeadersWithUrlFilterRules(profilesContainer) {
    const activeProfile = profilesContainer.profiles[profilesContainer.currentProfileIndex];
    const activeUrlFilters = activeProfile.urlFilters.filter(urlFilterData => urlFilterData.enabled && urlFilterData.urlRegex);
    if (noUrlFilterIsActive(activeUrlFilters)) {
        patchActiveUrlFiltersWithWildcard(activeUrlFilters);
    }

    const activeHeaders = getActiveRequestHeaders(activeProfile);
    let activeAddRules = [];
    if (hasActiveRequestHeader(activeHeaders)) {
        activeAddRules = generateAddRulesList(activeHeaders, activeUrlFilters);
    }
    return activeAddRules;
}

function applyChangedRequestHeaders(activeAddRules) {
    chrome.declarativeNetRequest.getDynamicRules(previousRules => {
        const previousRuleIds = previousRules.map(rule => rule.id);
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: previousRuleIds, addRules: activeAddRules
        });
    });
}

function generateAddRulesList(activeHeaders, activeUrlFilters) {
    const addRules = activeUrlFilters.map(activeUrlFilter => {
        const addRuleObj = getAddRulesObj(getRandomId());
        addRuleObj.condition.urlFilter = activeUrlFilter.urlRegex;
        addRuleObj.action.requestHeaders = activeHeaders.map(getRequestHeaderModifyObj);
        return addRuleObj;
    });
    return addRules;
}

function getAddRulesObj(id) {
    return {
        id: id,
        priority: 1,
        action: {
            type: 'modifyHeaders',
            requestHeaders: []
        },
        condition: {
            urlFilter: '*',
            resourceTypes: [
                'xmlhttprequest', 'main_frame'
            ]
        }
    }
}

function getRequestHeaderModifyObj(headerData) {
    return {
        header: headerData.name,
        operation: 'set',
        value: headerData.value
    }
}

function patchActiveUrlFiltersWithWildcard(activeUrlFilters) {
    const emptyUrlFilter = {
        enabled: true,
        urlRegex: '*'
    };
    activeUrlFilters.push(emptyUrlFilter);
}

function getRandomId() {
    const now = Date.now() + '';
    let val = now.substring(now.length - 8, now.length);
    val = val.replace(val.charAt(Math.round(Math.random() * val.length)), String(Math.round(Math.random() * 10)));
    return Number(val);
}

function getActiveRequestHeaders(activeProfile) {
    return activeProfile.headers.filter(header => header.enabled);
}

function noUrlFilterIsActive(activeUrlFilters) {
    return activeUrlFilters.length === 0
}

function hasActiveRequestHeader(activeHeaders) {
    return activeHeaders.length > 0;
}