/* CONSTANTS */
const header_row_id = "header_row_";
const url_filter_row_id = "url_filter_row_";
const delete_button_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px">\n' +
    '                            <path fill="#F44336" d="M21.5 4.5H26.501V43.5H21.5z" transform="rotate(45.001 24 24)"/>\n' +
    '                            <path fill="#F44336" d="M21.5 4.5H26.5V43.501H21.5z" transform="rotate(135.008 24 24)"/>\n' +
    '                        </svg>';
const playSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>';
const pausedSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>';
const profilesContainerId = 'profilesContainer';
const headerEntriesContainerId = 'headers-container';
const currentProfileTitleId = 'current-profile-title';
const profilesListId = 'profiles-list';
const headerUrlFilterContainerId = 'header-url-filter-container';
const addUrlFilterId = 'add-url-filter';
const addNewProfileId = 'add-new-profile';
const pauseHeaderModifierId = 'pause-header-modifier';
const deleteProfileId = 'delete-profile';
const addHeaderId = 'add-header';
const importJsonId = 'import-new';
const pausedBlockerElemId = 'paused-blocker-elem';
const messageToUserId = 'message-to-user';
const exportProfileOverlayBtnId = 'export-profile-overlay-btn';
const exportOverlayContainerId = 'export-overlay-container';
const exportProfilesContainerId = 'export-profiles-container';
const downloadExportJsonId = 'download-export-json';
const exportJsonTextAreaId = 'export-json-text-area';
const closeOverlayButtonId = 'close-overlay-btn';
const exportSelectAllId = 'export-select-all';

/* TYPES */
class Profile {
    title;
    headers;
    urlFilters;
    id;

    constructor(count) {
        this.title = 'Profile ' + count;
        this.headers = [new Header()];
        this.urlFilters = [new UrlFilter()];
        this.id = 'p_' + count + Date.now();
    }

    static of(importedProfile) {
        const profile = new Profile(1);
        profile.title = importedProfile.title;
        profile.headers = importedProfile.headers.map(Header.of);
        profile.urlFilters = importedProfile.urlFilters.map(UrlFilter.of);
        return profile;
    }
}

class Header {
    name;
    value;
    enabled;

    constructor() {
        this.name = '';
        this.value = '';
        this.enabled = false;
    }

    static of(importedHeader) {
        const header = new Header();
        header.enabled = importedHeader.enabled;
        header.name = importedHeader.name;
        header.value = importedHeader.value;
        return header;
    }
}

class UrlFilter {
    urlRegex;
    enabled;

    constructor() {
        this.urlRegex = '';
        this.enabled = false;
    }

    static of(importedUrlFilter) {
        const urlFilter = new UrlFilter();
        urlFilter.urlRegex = importedUrlFilter.urlRegex;
        urlFilter.enabled = importedUrlFilter.enabled;
        return urlFilter;
    }
}

class ProfilesContainer {
    creationDate;
    profiles;
    currentProfileIndex;
    paused;

    constructor(profiles) {
        this.creationDate = Date.now();
        this.profiles = profiles;
        this.currentProfileIndex = 0;
        this.paused = false;
    }
}

/* GLOBAL DATA */
let currentProfile = {};
let profilesContainer = null;
let messageToUser = null;
let overlayActive = false;
let exportProfilesJson = '';

/* METHODS */
function getHeaderEntryDivElement(index) {
    const div = document.createElement("div")
    div.className = 'profile-header-entry';
    div.id = header_row_id + index;
    return div;
}

function getUrlFilterEntryDivElement(index) {
    const div = document.createElement("div")
    div.className = 'header-url-filter-entry';
    div.id = url_filter_row_id + index;
    return div;
}

function getInputElement(id, placeholder) {
    const input = document.createElement("input");
    input.id = id;
    input.placeholder = placeholder;
    return input;
}

function getCheckboxElement(id) {
    const input = document.createElement("input");
    input.id = id;
    input.type = 'checkbox'
    return input;
}

function getDeleteButtonElement(id, className, innerHtml) {
    const btn = document.createElement("button");
    if (innerHtml) {
        btn.innerHTML = innerHtml;
    }
    btn.id = id;
    btn.className = className;
    return btn;

}

function onGetLocalStorageData(_profilesContainer) {
    if (chrome.runtime.error) {
        console.log("Runtime error.");
        return;
    }

    if (!_profilesContainer || !(profilesContainerId in _profilesContainer)) {
        profilesContainer = new ProfilesContainer([new Profile(1)]);
        console.log('created new profiles container');
    } else {
        profilesContainer = _profilesContainer[profilesContainerId];
    }

    updateTogglePauseButton();
    switchProfile(profilesContainer.profiles[profilesContainer.currentProfileIndex]);
    loadProfileItemButtonElements();

}

function onStoredData() {
    if (chrome.runtime.error) {
        console.log("Runtime error.");
    }
}

function addProfile() {
    const addedProfile = new Profile(profilesContainer.profiles.length + 1);
    const appendedProfiles = [...profilesContainer.profiles, addedProfile];
    profilesContainer.profiles = appendedProfiles;
    switchProfile(addedProfile);
}

function switchProfile(profile) {
    currentProfile = profile;
    profilesContainer.currentProfileIndex = profilesContainer.profiles.indexOf(profile);
    loadProfile(profile);
    loadProfileItemButtonElements();
    storeProfiles();
}

function deleteProfile() {
    executeProfileDeletion();
    tryToSetNextProfileIndex();
    if (noSelectedProfileFound()) {
        addProfile();
        return;
    }
    switchProfile(getNextProfile());
}

function executeProfileDeletion() {
    const profileIndex = profilesContainer.profiles.indexOf(currentProfile);
    profilesContainer.profiles.splice(profileIndex, 1);
}

function tryToSetNextProfileIndex() {
    if (profilesContainer.currentProfileIndex !== null && profilesContainer.currentProfileIndex < profilesContainer.profiles.length) {
        return;
    }
    profilesContainer.currentProfileIndex = profilesContainer.profiles.length > 0 ? profilesContainer.profiles.length - 1 : null;
}

function noSelectedProfileFound() {
    return profilesContainer.currentProfileIndex === null;
}

function getNextProfile() {
    return profilesContainer.profiles[profilesContainer.currentProfileIndex];
}

function createHeaderEntryElement(index, headerData, headerEntriesContainer) {
    const headerEntryElement = getHeaderEntryDivElement(index);
    const headerEntryCheckboxElement = getCheckboxElement('header_checkbox_' + index);
    headerEntryCheckboxElement.checked = headerData.enabled;
    headerEntryCheckboxElement.oninput = onInputChange;
    headerEntryElement.appendChild(headerEntryCheckboxElement);

    const headerEntryInputNameElement = getInputElement('header_name_' + index, 'name');
    headerEntryInputNameElement.value = headerData.name;
    headerEntryInputNameElement.onblur = onInputChange;
    headerEntryElement.appendChild(headerEntryInputNameElement);

    const headerEntryInputValueElement = getInputElement('header_value_' + index, 'value');
    headerEntryInputValueElement.value = headerData.value;
    headerEntryInputValueElement.onblur = onInputChange;
    headerEntryElement.appendChild(headerEntryInputValueElement);

    const headerEntryDeleteElement = getDeleteButtonElement('header_delete_btn_' + index, 'del-btn', delete_button_svg);
    headerEntryDeleteElement.title = 'delete header entry';
    headerEntryDeleteElement.onclick = function (event) {
        deleteHeaderEntry(headerEntryElement.id);
    };
    headerEntryElement.appendChild(headerEntryDeleteElement);
    headerEntriesContainer.appendChild(headerEntryElement);
}

function createUrlFilterEntryElement(index, urlFilterData, urlFilterEntriesContainer) {
    const urlFilterEntryElement = getUrlFilterEntryDivElement(index);
    const urlFilterEntryCheckboxElement = getCheckboxElement('url_filter_checkbox_' + index);
    urlFilterEntryCheckboxElement.checked = urlFilterData.enabled;
    urlFilterEntryCheckboxElement.oninput = onInputUrlFilterChange;
    urlFilterEntryElement.appendChild(urlFilterEntryCheckboxElement);

    const urlFilterEntryInputValueElement = getInputElement('url_filter_value_' + index, '.*://.*.google.com/.*');
    urlFilterEntryInputValueElement.value = urlFilterData.urlRegex;
    urlFilterEntryInputValueElement.onblur = onInputUrlFilterChange;
    urlFilterEntryElement.appendChild(urlFilterEntryInputValueElement);

    const urlFilterEntryDeleteElement = getDeleteButtonElement('url_filter_btn_' + index, 'del-btn', delete_button_svg);
    urlFilterEntryDeleteElement.title = 'delete url filter entry';
    urlFilterEntryDeleteElement.onclick = function (event) {
        deleteUrlFilterEntry(urlFilterEntryElement.id);
    };
    urlFilterEntryElement.appendChild(urlFilterEntryDeleteElement);
    urlFilterEntriesContainer.appendChild(urlFilterEntryElement);
}

function deleteHeaderEntry(parentId) {
    executeHeaderEntryDeletion(parentId);
    if (noHeaderEntryExists()) {
        addNewHeaderEntry();
        return;
    }
    storeProfiles();
}

function noHeaderEntryExists() {
    return currentProfile.headers.length === 0
}

function getIndexOfElem(target) {
    return [...target.parentElement.childNodes].indexOf(target);
}

function executeHeaderEntryDeletion(id) {
    const headerEntryElement = document.getElementById(id);
    const index = getIndexOfElem(headerEntryElement);
    headerEntryElement.remove();
    currentProfile.headers.splice(index, 1);
}

function deleteUrlFilterEntry(id) {
    executeDeleteUrlFilterEntry(id);
    if (noUrlFilterEntryExists()) {
        addNewUrlFilterEntry();
        return;
    }
    storeProfiles();
}

function executeDeleteUrlFilterEntry(id) {
    const urlFilterEntryElement = document.getElementById(id);
    const index = getIndexOfElem(urlFilterEntryElement);
    urlFilterEntryElement.remove();
    currentProfile.urlFilters.splice(index, 1);
}

function noUrlFilterEntryExists() {
    return currentProfile.urlFilters.length === 0
}

function addNewHeaderEntry() {
    const headerData = new Header();
    currentProfile.headers.push(headerData);
    const headerEntriesContainer = document.getElementById(headerEntriesContainerId);
    createHeaderEntryElement(currentProfile.headers.length - 1, headerData, headerEntriesContainer);
    storeProfiles();
}

function addNewUrlFilterEntry() {
    const urlFilterData = new UrlFilter();
    currentProfile.urlFilters.push(urlFilterData);
    const urlFiltersContainer = document.getElementById(headerUrlFilterContainerId);
    createUrlFilterEntryElement(currentProfile.urlFilters.length - 1, urlFilterData, urlFiltersContainer);
    storeProfiles();
}

function getProfileItemElement(profile) {
    const div = document.createElement("div");
    div.className = 'profile';
    div.id = profile.id;
    div.innerText = profile.title;
    div.title = profile.title;
    div.onclick = function () {
        switchProfile(profile);
    };
    return div;
}

function getProfileExportItemElement(profile) {
    const div = document.createElement('div');
    div.className = 'export-profile-entry';
    div.title = profile.title;

    const span = document.createElement('label');
    span.innerText = profile.title;

    const checkbox = getCheckboxElement('checkbox_' + profile.id);
    checkbox.value = profile.id;
    checkbox.onclick = generateExportJson;

    div.appendChild(checkbox);
    div.appendChild(span);

    return div;
}

function generateExportJson() {
    const exportProfiles = getProfilesToExport();
    if(exportProfiles?.length > 0) {
        const clonedProfiles = JSON.parse(JSON.stringify(exportProfiles)).map(p => {
            delete p.id;
            return p;
        });
        exportProfilesJson = JSON.stringify(clonedProfiles, null, 2);
    }else{
        exportProfilesJson = ''
    }
    document.getElementById(exportJsonTextAreaId).value = exportProfilesJson;
    setDisableStatusOfExportDownloadButton();
}

function setDisableStatusOfExportDownloadButton() {
    const downloadExportButton = document.getElementById(downloadExportJsonId);
    disableButton(downloadExportButton, !exportProfilesJson);
}

function disableButton(buttonElem, disabled) {
    buttonElem.disabled = disabled;
    if(disabled) {
        buttonElem.classList.add('disabled');
        return;
    }
    buttonElem.classList.remove('disabled');
}

function getProfilesToExport() {
    return profilesContainer.profiles
        .filter(profile => document.getElementById('checkbox_' + profile.id).checked);
}

function exportSelectAll() {
    profilesContainer.profiles
        .forEach(profile => document.getElementById('checkbox_' + profile.id).checked = true);
    generateExportJson();
    document.getElementById(downloadExportJsonId).disabled = false;

}

function downloadExportJson() {
    if (!exportProfilesJson) {
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportProfilesJson);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    let filename = JSON.parse(exportProfilesJson).map(p => p.title).join('+');
    downloadAnchorNode.setAttribute("download", filename.substring(0, Math.min(75, filename.length)) + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    closeExportOverlay();
}

function loadProfile(profile) {
    const headerEntriesContainer = document.getElementById(headerEntriesContainerId);
    headerEntriesContainer.innerHTML = '';
    profile.headers.forEach((headerData, index) => {
        createHeaderEntryElement(index, headerData, headerEntriesContainer);
    });

    const urlFiltersContainer = document.getElementById(headerUrlFilterContainerId);
    urlFiltersContainer.innerHTML = '';
    profile.urlFilters.forEach((urlFilterData, index) => {
        createUrlFilterEntryElement(index, urlFilterData, urlFiltersContainer);
    });
    document.getElementById(currentProfileTitleId).value = profile.title;
}

function onInputChange(event) {
    const changedRow = event.target.parentElement;
    const changedRowIndex = [...event.target.parentElement.parentElement.childNodes].indexOf(changedRow);
    updateChangedHeaderRow(changedRowIndex, changedRow);
    storeProfiles();
}

function onInputUrlFilterChange(event) {
    const changedRow = event.target.parentElement;
    const changedRowIndex = [...event.target.parentElement.parentElement.childNodes].indexOf(changedRow);
    updateChangedUrlFilterRow(changedRowIndex, changedRow);
    storeProfiles();
}


function onProfileTitleChange(event) {
    const updatedTitle = event.target.value;
    if (!updatedTitle) {
        event.target.value = currentProfile.title;
        return;
    }
    currentProfile.title = updatedTitle;
    loadProfileItemButtonElements();
    storeProfiles();
}

function updateChangedHeaderRow(changedRowIndex, changedRow) {
    const changedHeaderEntryRowValues = [...changedRow.childNodes]
        .filter(child => child.tagName.toLowerCase() === 'input');
    const headerData = currentProfile.headers[changedRowIndex];
    headerData.enabled = changedHeaderEntryRowValues[0].checked;
    headerData.name = changedHeaderEntryRowValues[1].value;
    headerData.value = changedHeaderEntryRowValues[2].value;
}

function updateChangedUrlFilterRow(changedRowIndex, changedRow) {
    const changedUrlFilterEntryRowValues = [...changedRow.childNodes]
        .filter(child => child.tagName.toLowerCase() === 'input');
    const urlFilterData = currentProfile.urlFilters[changedRowIndex];
    urlFilterData.enabled = changedUrlFilterEntryRowValues[0].checked;
    urlFilterData.urlRegex = changedUrlFilterEntryRowValues[1].value;
}

function storeProfiles() {
    if (profilesContainer) {
        chrome.storage.local.set({
            [profilesContainerId]: profilesContainer
        }, onStoredData);
    }
}

function loadProfileItemButtonElements() {
    const profilesListElem = document.getElementById(profilesListId);
    profilesListElem.innerHTML = '';
    profilesContainer.profiles.forEach(profile => {
        const profileItemElement = getProfileItemElement(profile);
        if (currentProfile.id === profileItemElement.id) {
            profileItemElement.className += " selected-profile"
        }
        profilesListElem.appendChild(profileItemElement);
    })
}

function loadProfileItemsForExportElements() {
    const exportProfilesListContainer = document.getElementById(exportProfilesContainerId);
    exportProfilesListContainer.innerHTML = '';
    profilesContainer.profiles.forEach(profile => {
        const profileItemElement = getProfileExportItemElement(profile);
        exportProfilesListContainer.appendChild(profileItemElement);
    })
}

function handleDragOver(e) {
    document.querySelector(`#${importJsonId}`).classList.add("import-active");
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function handleFileDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    let files = e.dataTransfer.files;
    const reader = new FileReader();
    reader.onerror = function (e) {
        removeActiveMarkerFromDropZone();
    };
    reader.onprogress = function (e) {
    };
    reader.onabort = function (e) {
        removeActiveMarkerFromDropZone();
    };
    reader.onloadstart = function (e) {
    };
    reader.onload = function (e) {
        try {
            const jsonString = e.target.result;
            const json = JSON.parse(jsonString);
            removeActiveMarkerFromDropZone();
            if (validateImportedProfileJson(json)) {
                importValidProfilesFromJson(json);
                popOverMessageToUser('Profile(s) successfully imported!', 3500, 'success');
                return;
            }

            onProfileImportFailed();
        } catch (e) {
            onProfileImportFailed();
        }
    };
    reader.readAsText(files[0]);

};

function onProfileImportFailed() {
    shakeDropZone();
    popOverMessageToUser('Could not import Profile, please check your source!', 3500, 'error');
}

function shakeDropZone() {
    const dropZone = document.getElementById(importJsonId);
    dropZone.classList.add('shaking')
    setTimeout(() => {
        dropZone.classList.remove('shaking')
    }, 350)
}

function popOverMessageToUser(message, ttl, additionalCssClass) {
    if (messageToUser) {
        clearTimeout(messageToUser);
    }
    const popOver = document.getElementById(messageToUserId);
    popOver.innerText = message;
    popOver.classList.add('visible-pop-over');
    if (additionalCssClass) {
        popOver.classList.add(additionalCssClass);
    }

    messageToUser = setTimeout(() => {
        if (additionalCssClass) {
            popOver.classList.remove(additionalCssClass);
        }
        popOver.classList.remove('visible-pop-over')
        messageToUser = null;
    }, ttl)
}

function validateImportedProfileJson(jsonObj) {
    if (Array.isArray(jsonObj)) {
        return jsonObj.map(isProfileValid).every(isValid)
    }
    return isProfileValid(jsonObj);
}

function isValid(valid) {
    return valid;
}

function isProfileValid(profile) {
    if (!('title' in profile && typeof profile.title == 'string')) {
        return false;
    }

    if (!('headers' in profile && Array.isArray(profile.headers))) {
        return false;
    }
    const headersValid = profile.headers.length === 0 ? true : profile.headers.map(isValidHeaderObj)
        .every(isValid);
    if (!headersValid) {
        return false;
    }

    if (!('urlFilters' in profile) && !('filters' in profile)) {
        return true;
    }

    if (!('urlFilters' in profile && Array.isArray(profile.urlFilters)) &&
        !('filters' in profile && Array.isArray(profile.filters))) {
        return false;
    }

    const urlFiltersValid = profile.urlFilters ?
        (profile.urlFilters.length === 0 ? true : profile.urlFilters.map(isValidUrlFiltersObj)
            .every(isValid)) :
        (profile.filters.length === 0 ? true : profile.filters.map(isValidUrlFiltersObj)
            .every(isValid));
    if (!urlFiltersValid) {
        return false;
    }
    return true;
}

function importValidProfilesFromJson(validJsonObj) {
    if (Array.isArray(validJsonObj)) {
        validJsonObj.forEach(importValidProfile);
    } else {
        importValidProfile(validJsonObj);
    }
    loadProfileItemButtonElements();
    switchProfile(profilesContainer.profiles[profilesContainer.profiles.length - 1]);
}

function importValidProfile(importingProfile) {
    const urlFilters = importingProfile.urlFilters ? importingProfile.urlFilters : (importingProfile.filters ? importingProfile.filters : [new UrlFilter()]);
    const profile = Profile.of({...importingProfile, urlFilters});
    profile.id = 'p_' + Date.now() + profilesContainer.profiles.length;
    profilesContainer.profiles.push(profile);
}

function isValidHeaderObj(headerData) {
    return ('enabled' in headerData && typeof headerData.enabled == 'boolean') &&
        ('name' in headerData && typeof headerData.name == 'string') &&
        ('value' in headerData && typeof headerData.value == 'string');

}

function isValidUrlFiltersObj(urlFilter) {
    return ('enabled' in urlFilter && typeof urlFilter.enabled == 'boolean') &&
        ('urlRegex' in urlFilter && typeof urlFilter.urlRegex == 'string');
}

function removeActiveMarkerFromDropZone() {
    document.querySelector(`#${importJsonId}`).classList.remove("import-active");
}

function tryToRestoreProfile() {
    chrome.storage.local.get(profilesContainerId, onGetLocalStorageData);
}

function togglePauseExtension() {
    profilesContainer.paused = !profilesContainer.paused;
    updateTogglePauseButton();
    storeProfiles();
}

function openExportProfilesOverlay() {
    overlayActive = true;
    const exportOverlayContainer = document.getElementById(exportOverlayContainerId);
    const exportTextarea = document.getElementById(exportJsonTextAreaId);
    exportTextarea.value = '';
    exportOverlayContainer.classList.add('visible-overlay');
    loadProfileItemsForExportElements();
    setDisableStatusOfExportDownloadButton();
}

function closeExportOverlay(event) {
    exportProfilesJson = '';
    document.getElementById(exportOverlayContainerId).classList.remove('visible-overlay');
}

function onClickOnOverlayContainer(event) {
    if (event.target.id !== exportOverlayContainerId) {
        return;
    }
    event.stopPropagation();
    event.preventDefault();
    closeExportOverlay();
}

function updateTogglePauseButton() {
    const togglePauseBtn = document.getElementById(pauseHeaderModifierId);
    const pausedBlockerElem = document.getElementById(pausedBlockerElemId);

    if (profilesContainer.paused) {
        pausedBlockerElem?.classList.add('visible-blocker');
        togglePauseBtn.innerHTML = playSVG;
        return;
    }

    pausedBlockerElem?.classList.remove('visible-blocker');
    togglePauseBtn.innerHTML = pausedSVG;
}


function addEventListeners() {
    document.getElementById(pauseHeaderModifierId).onclick = togglePauseExtension;
    document.getElementById(exportProfileOverlayBtnId).onclick = openExportProfilesOverlay;
    document.getElementById(addNewProfileId).onclick = addProfile;
    document.getElementById(deleteProfileId).onclick = deleteProfile;
    document.getElementById(addHeaderId).onclick = addNewHeaderEntry;
    document.getElementById(addUrlFilterId).onclick = addNewUrlFilterEntry;
    document.getElementById(currentProfileTitleId).onblur = onProfileTitleChange;
    document.getElementById(downloadExportJsonId).onclick = downloadExportJson;
    document.getElementById(exportOverlayContainerId).onclick = onClickOnOverlayContainer;
    document.getElementById(closeOverlayButtonId).onclick = closeExportOverlay;
    document.getElementById(exportSelectAllId).onclick = exportSelectAll;

    const importJsonDropZone = document.getElementById(importJsonId);
    importJsonDropZone.addEventListener('dragover', handleDragOver, false);
    importJsonDropZone.addEventListener('drop', handleFileDrop, false);
    importJsonDropZone.addEventListener('dragleave', removeActiveMarkerFromDropZone, false);
}

//ADD EVENT LISTENERS AND STARTUP
document.addEventListener('DOMContentLoaded', function () {
    tryToRestoreProfile();
    addEventListeners();
});



