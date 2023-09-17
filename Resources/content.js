// browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
//    console.log("Received response: ", response);
// });

// browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
//    console.log("Received request: ", request);
// });

/**
 * Function to check and toggle the autoplay button on a YouTube video page.
 * If the page URL does not include 'youtube.com/watch', the function will return true.
 * If the autoplay button exists and is turned on, the function will click it.
 * If the autoplay button exists but is already off, the function will return true.
 *
 * @returns {boolean} - Returns true if the autoplay was turned off or the page is not a video page.
 *                       Returns false if the autoplay button wasn't found or the autoplay status is undefined.
 */

function findMenuItemByText(menuItems, text) {
    for (let i = 0; i < menuItems.length; i++) {
        if (menuItems[i].innerText === text) {
            return menuItems[i];
        }
    }
    return null;
};

function openQualityMenu() {
    console.log("Opening quality menu");
    const button = document.querySelector('.ytp-settings-button');
    if (!button) {
        console.log("Button element not found");
        return;
    }
    button.click();

    const menuItems = document.querySelectorAll('.ytp-menuitem-label');
    const qualityMenuItem = findMenuItemByText(menuItems, 'Quality');
    if (!qualityMenuItem) {
        console.log("Quality menu item not found");
        return;
    }
    qualityMenuItem.click();

    // const validQualityText = ['2160p60 4K', '2160p 4K', '1440p60 HD', '1440p HD', '1080p60 HD', '1080p HD', '720p60', '720p', '480p', '360p', '240p', '144p', 'Auto'];
    const validQualityText = ['2160', '1440', '1080', '720p', '480p', '360p', '240p', '144p', 'Auto'];
    const qualityOptions = document.querySelectorAll('.ytp-menuitem-label');
    if (qualityOptions.length === 0) {
        console.log("No quality options found");
        return;
    }

let bestQualityOption = 0;
let bestQualityElement;

for (const option of qualityOptions) {
    // itemText is the first 4 characters of the string
    const itemText = option.innerText.substring(0, 4);
    // console.log(itemText);
    if (validQualityText.includes(itemText)) {
        const itemValue = parseInt(itemText);
        if (itemValue > bestQualityOption) {
        bestQualityOption = itemValue;
        bestQualityElement = option;
        }
    }
}

    if (bestQualityElement) {
        bestQualityElement.click();
        console.log("Highest quality option selected");
    }
    else {
        console.log("No valid quality options found, probably too fast");
    }
};


const checkAutoplayButton = () => {
    console.log("Checking for autoplay button...");

    let autoplayButton = document.querySelector('button.ytp-button[data-tooltip-target-id="ytp-autonav-toggle-button"]');
    if (!autoplayButton) return false;

    let autoplayStatus = autoplayButton.getAttribute('aria-label');

    // If the autoplay button exists and is turned on, click it
    if (autoplayStatus === 'Autoplay is on') {
        autoplayButton.click();
        console.log("Turned autoplay off!");
        return true;
    }

    // If the autoplay button exists but is already off
    if (autoplayStatus === 'Autoplay is off') {
        console.log("Autoplay is already off!");
        return true;
    }

    console.log("autoplayButton loaded, but not on or off!");
    return false;
};

/**
 * Handle 'yt-navigate-finish' event by starting an interval to check for the autoplay button
 * The function attempts to find the autoplay button and turn it off if it is on.
 * The interval is cleared once the autoplay is turned off or the maximum number of attempts is reached.
 */
const handleNavigateFinish = () => {
    // Check for autoplay button when YouTube navigation finishes
    let checkAttempts = 0;

    const checkInterval = setInterval(() => {
        checkAttempts++;

        console.log(`Attempt ${checkAttempts} to find autoplay button...`);

        const autoplayOff = checkAutoplayButton();

        // If the autoplay was turned off, or the maximum number of attempts was reached, clear the interval
        if (autoplayOff || checkAttempts >= 10) {
            clearInterval(checkInterval);
            openQualityMenu();
        }
    }, 500); // Check every 500ms
};

if (!window.location.href.includes('youtube.com/watch')) {
    console.log("No need to run any scripts here :)");
}

else {
    window.addEventListener('yt-navigate-finish', handleNavigateFinish);
    console.log("Listening for yt-navigate-finish.");
}
