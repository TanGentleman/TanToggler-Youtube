//browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
//   console.log("Received response: ", response);
//});
//
//browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log("Received request: ", request);
//});

/**
 * Function to find an element within a NodeList by its inner text.
 * @param {NodeList} menuItems - The list of elements to search within.
 * @param {string} text - The inner text to match.
 * @returns {Element|null} - The matching element if found, or null if not found.
 */
const findElementByInnerText = (menuItems, text) => {
    for (let i = 0; i < menuItems.length; i++) {
        if (menuItems[i].innerText === text) {
            return menuItems[i];
        }
    }
    return null;
};

/**
 * Function to find and set the quality button.
 * Currently chooses highest quality option.
 * @returns {boolean} - Returns true if quality successfully set
 */
const setQuality = () => {
    console.log("Opening quality menu");
    const button = document.querySelector('.ytp-settings-button');
    if (!button) {
        console.log("Button element not found");
        return false;
    }
    button.click();

    const menuItems = document.querySelectorAll('.ytp-menuitem-label');
    const qualityMenuItem = findElementByInnerText(menuItems, 'Quality');
    if (!qualityMenuItem) {
        console.log("Quality menu item not found");
        return false;
    }
    qualityMenuItem.click();

    // const validQualityText = ['2160p60 4K', '2160p 4K', '1440p60 HD', '1440p HD', '1080p60 HD', '1080p HD', '720p60', '720p', '480p', '360p', '240p', '144p', 'Auto'];
    const validQualityText = ['2160', '1440', '1080', '720p', '480p', '360p', '240p', '144p', 'Auto'];
    const qualityOptions = document.querySelectorAll('.ytp-menuitem-label');
    if (qualityOptions.length === 0) {
        console.log("No quality options found");
        return false;
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
        return true;
    }
    else {
        console.log("No valid quality options found, possibly too fast");
        return false;
    }
};

/**
 * Function to find and disable the autoplay button on a YouTube video page.
 * If the autoplay button exists and is turned on, the function will disable it and return true.
 * If the autoplay button exists but is already off, the function will return true.
 * @returns {boolean} - Returns true if autoplay successfully turned off
 */
const setAutoplay = () => {
    console.log("Checking for autoplay button...");
    let autoplayButton = document.querySelector('button.ytp-button[data-tooltip-target-id="ytp-autonav-toggle-button"]');
    if (!autoplayButton) return false;
    const autoplayStatus = autoplayButton.getAttribute('aria-label');
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
 * Handle 'yt-navigate-finish' event by starting an interval to check success condition
 * The function attempts to set quality and turn off autoplay.
 * The interval is cleared once this succeeds or the maximum number of attempts is reached.
 */
const handleNavigateFinish = () => {
    // Check for autoplay button when YouTube navigation finishes
    if (!window.location.href.includes('youtube.com/watch')) {
        console.log("No need to run any scripts here :)");
        return;
    }
    let checkAttempts = 0;

    const checkInterval = setInterval(() => {
        checkAttempts++;

        console.log(`Attempt ${checkAttempts} to find autoplay button...`);

        const setQualityResult = setQuality();
        if (!setQualityResult) {
            console.log("setQualityResult was false, returning");
            return;
        }
        const setAutoplayResult = setAutoplay();
        // If the autoplay was turned off, or the maximum number of attempts was reached, clear the interval
        if (setAutoplayResult || checkAttempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 500); // Check every 500ms
};

window.addEventListener('yt-navigate-finish', handleNavigateFinish);
console.log("Listening for yt-navigate-finish.");
