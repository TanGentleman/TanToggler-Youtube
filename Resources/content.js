//browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
//   console.log("Received response: ", response);
//});
//
//browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log("Received request: ", request);
//});


// Later may evolve to a config.js type beat, we'll see
const config = {
    validQualityStrings: ['2160', '1440', '1080', '720p', '480p', '360p', '240p', '144p', 'Auto'],
    QUALITY_OPTIONS: ['Auto', 'Highest', 'Custom'],

    ROBUST: false,
    QUALITY_CHOICE: 'Highest',
    // CUSTOM CHOICE MUST BE 4 CHARS. I dont like doing .substring(0, 4)
    QUALITY_CUSTOM: '1080',
    checkValidity: function() {
        // Validate QUALITY_CUSTOM against validQualityStrings
        if (!this.validQualityStrings.includes(this.QUALITY_CUSTOM)) {
            console.log(`QUALITY_CUSTOM '${this.QUALITY_CUSTOM}' is not in validQualityStrings.`);
            if (this.QUALITY_CUSTOM.length !== 4) {
                console.log("QUALITY_CUSTOM must be 4 characters long u goof.");
            }
            return false;
        }
        // Validate QUALITY_CHOICE against QUALITY_OPTIONS
        if (!this.QUALITY_OPTIONS.includes(this.QUALITY_CHOICE)) {
            console.log(`QUALITY_CHOICE '${this.QUALITY_CHOICE}' is not in QUALITY_OPTIONS.`);
            return false;
        }
        return true;
    }
};

// *** CHECK CONFIGURATION ***
// Check config validity
if (!config.checkValidity()) {
    throw new Error("Config is invalid. Check log.");
}
// *** CONFIGURATION PASSED ***

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
 * Function to find the quality button.
 * Relies on the config object to determine which quality to choose.
 * @param {string[]} validQualityStrings
 * @param {NodeList} qualityElemArray 
 * @returns {Element|null} - The matching element if found, or null if not found.
 */
const getQualityButton = (validQualityStrings, qualityElemArray) => {
    if (config.QUALITY_CHOICE === 'Auto') {
        console.log("Do not enter this function when config.QUALITY_CHOICE is set to Auto. ERROR!")
        return;
    }
    let customString;
    let fallbackCustom = false;

    let qualityElem;
    if (config.QUALITY_CHOICE === 'Custom') {
        fallbackCustom = true;
        if (validQualityStrings.includes(config.QUALITY_CUSTOM)) {
            customString = config.QUALITY_CUSTOM;
        }
        else {
            console.log("Bad custom quality choice. Using highest quality instead.");
        }
    }
    // Search for highest or custom quality with no assumptions about order
    if ((config.QUALITY_CHOICE === 'Highest') || fallbackCustom === true) {
        if (config.ROBUST || customString) {
            let highestQualityInt = 0;
            for (const option of qualityElemArray) {
                // itemText is the first 4 characters of the string
                const itemText = option.innerText.substring(0, 4);
                // console.log(itemText);
                if (customString && (itemText === customString)) {
                    qualityElem = option;
                    break;
                }
                if (validQualityStrings.includes(itemText)) {
                    // set the first option
                    const itemValue = parseInt(itemText);
                    if (itemValue > highestQualityInt) {
                        highestQualityInt = itemValue;
                        qualityElem = option;
                    }
                }
            }
        }
        else {
            // get first valid option - should be the highest quality
            for (const option of qualityElemArray) {
                // itemText is the first 4 characters of the string
                const itemText = option.innerText.substring(0, 4);
                // console.log(itemText);
                if (validQualityStrings.includes(itemText)) {
                    qualityElem = option;
                    break;
                }
            }
        }
    }
    if (qualityElem) {
        return qualityElem;
    }
    else {
        return null;
    }
};

/**
 * Function to find and set the quality button.
 * Currently chooses highest quality option.
 * @returns {boolean} - Returns true if quality successfully set
 */
const setQuality = () => {
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

    const qualityElemArray = document.querySelectorAll('.ytp-menuitem-label');
    if (qualityElemArray.length === 0) {
        console.log("No quality options found");
        return false;
    }
    const qualityButton = getQualityButton(config.validQualityStrings, qualityElemArray);
    if (qualityButton) {
        console.log(`selected ${qualityButton.innerText}`);
        qualityButton.click();
        return true;
    }
    else {
        console.log("Valid quality option not selected.");
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
    // console.log("Checking for autoplay button...");
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
 * Function to run another function periodically until it succeeds or the maximum number of attempts is reached.
 * @param {function} func - The function to run periodically.
 * @param {number} attempts - The maximum number of attempts to run the function.
 * @param {number} interval - The interval in milliseconds between each attempt.
 * @returns {Promise} - Returns a promise that resolves when the function succeeds or the maximum number of attempts is reached.
 */
const runFuncPeriodically = (func, attempts, interval) => {
    let checkAttempts = 0;
    const intervalId = setInterval(() => {
      checkAttempts++;
      if (checkAttempts > 1) console.log(`Attempt ${checkAttempts} to run function`);
      const result = func();
      if (checkAttempts >= attempts) {
        console.log("runFuncPeriodically max attempts reached");
        clearInterval(intervalId);
        return;
      }
      if (result) {
        // console.log("runFuncPeriodically success");
        clearInterval(intervalId);
        return;
      }
    }, interval);
};  


/**
 * Handle 'yt-navigate-finish' event by starting an interval to check success condition
 * The function attempts to set quality and turn off autoplay.
 * The interval is cleared once this succeeds or the maximum number of attempts is reached.
 */
const handleNavigateFinish = async () => {
    // Check for autoplay button when YouTube navigation finishes
    if (!window.location.href.includes('youtube.com/watch')) {
        console.log("No need to run any scripts here :)");
        return;
    }
    else {
        if (config.QUALITY_CHOICE !== 'Auto') {
            await runFuncPeriodically(setQuality, 5, 500);
            // 500ms timeout
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        await runFuncPeriodically(setAutoplay, 5, 500);
    }
};

window.addEventListener('yt-navigate-finish', handleNavigateFinish);
console.log("Now listening for yt-navigate-finish.");
