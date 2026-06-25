// ==UserScript==
// @name         Ban data loader
// @namespace    eeek
// @version      1.2.1
// @description  Loads data from rep tf
// @author       eeek
// @match        https://backpack.tf/u/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=backpack.tf
// ==/UserScript==

const toPerform = () => {
    const element = document.querySelector('.alert.alert-danger');

    return !!element
}

const updateUIElement = (dates) => {
    const alertHeader = document.querySelector('.alert.alert-danger > h4');
    if (dates === null) {
        alertHeader.innerText = alertHeader.innerText + '';
        return;
    }

    alertHeader.innerText = alertHeader.innerText.slice(0, -1) + ' | Since: ';
    const bold = document.createElement('b');
    bold.textContent = dates[0];
    bold.title = 'For you it was: ' + dates[1]
    alertHeader.append(bold);
}

const getIdFromLink = () => {
    const loc = window.location.href.split('/');
    return loc[loc.length - 1];
}

const convertUnixToDate = (unix) => {
    const date = new Date(unix * 1000);

    const configs = [
        ['en-GB', 'UTC'],
        [undefined, undefined],
    ];

    return configs.map(([locale, tz]) => {
        const formatted = date.toLocaleString(locale, {
            ...({ timeZone: tz }),
            timeZoneName: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        return formatted;
    });
};

const getStartDateFromBPApi = async (steamid) => {
    const link = `https://backpack.tf/api/IGetUsers/v3?steamid=${steamid}`;
    try {
        const rawData = await fetch(link);
        const json = await rawData.json();
        const date = json?.response?.players?.[steamid]?.backpack_tf_banned?.start || null;
        console.log(`Detected date is ${date}`);
        console.log(json)
        return convertUnixToDate(date)
    } catch (e) {
        return null;
    }
}


const init = async () => {
    if (!toPerform()) {
        console.log('Nothing to do here...');
        return;
    };
    const id = getIdFromLink();

    try {
        const data = await getStartDateFromBPApi(id);
        updateUIElement(data);
    } catch (e) {
        console.log(e)
        updateUIElement(null);
    }
}

init()
