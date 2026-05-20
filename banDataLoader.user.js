// ==UserScript==
// @name         Ban data loader
// @namespace    eeek
// @version      1.0
// @description  Loads data from rep tf
// @author       eeek
// @match        https://backpack.tf/u/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=backpack.tf
// ==/UserScript==


const toPerform = () => {
    const element = document.querySelector('.alert.alert-danger');
    return !!element
}


const loadRepTfData = async (steamId) => {
    const link = `https://rep.tf/api/bans?str=${steamId}`;

    try {
        const rawData = await fetch(link, {method: 'POST'});
        const json = await rawData.json();
        if (json.success !== true) throw (json);
        return json
    } catch (e) {
        throw (e)
    }
}

const getBannedSinceFromHTMLString = (htmlString) => {
    const match = htmlString.match(/<b>Since<\/b>:\s*(.+?)(?:<br|$)/);
    if (!match) return '';
    return match[1];
}

const getBannedSinceFromRepTF = async (steamId) => {
    try {
        const data = await loadRepTfData(steamId);
        const bpData = data.bptfBans.message;
        const parsedDate = getBannedSinceFromHTMLString(bpData);

        return parsedDate;
    } catch(e) {
        console.error(e);
        throw 'Failed to load data from rep.tf! For more info view the console.'
    }
}

const updateUIElement = (date) => {
    const alertHeader = document.querySelector('.alert.alert-danger > h4');

    if (date === null) {
        alertHeader.innerText = alertHeader.innerText + '| Failed to get the data. Sry :<';
    }
    alertHeader.innerText = alertHeader.innerText.slice(0, -1) + ' | Since: ';
    const bold = document.createElement('b');
    bold.textContent = date;
    alertHeader.append(bold);
}

const getIdFromLink = () => {
    const loc = window.location.href.split('/');
    return loc[loc.length - 1];
}

const init = async () => {
    if (!toPerform()) {
        console.log('Nothing to do here...');
        return;
    };
    const id = getIdFromLink();

    try {
        const data = await getBannedSinceFromRepTF(id);
        updateUIElement(data);
    } catch (e) {
        console.log(e)
        updateUIElement(null);
    }
}

init()
