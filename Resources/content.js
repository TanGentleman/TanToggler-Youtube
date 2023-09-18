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
 * Function to find the best quality button.
 * This implementation is robust to unsortedness of qualityOptions.
 * @param {string[]} validQualityText
 * @param {NodeList} qualityOptions 
 * @returns {Element|null} - The matching element if found, or null if not found.
 */
const getBestButton = (validQualityText, qualityOptions) => {
    let bestQualityOption = 0;
    let bestQualityElement;
    for (const option of qualityOptions) {
        // itemText is the first 4 characters of the string
        const itemText = option.innerText.substring(0, 4);
        // console.log(itemText);
        if (validQualityText.includes(itemText)) {
            // set the first option
            const itemValue = parseInt(itemText);
            if (itemValue > bestQualityOption) {
            bestQualityOption = itemValue;
            bestQualityElement = option;
            }
        }
    }
    if (bestQualityElement) {
        return bestQualityElement;
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

    const validQualityText = ['2160', '1440', '1080', '720p', '480p', '360p', '240p', '144p', 'Auto'];
    const qualityOptions = document.querySelectorAll('.ytp-menuitem-label');
    if (qualityOptions.length === 0) {
        console.log("No quality options found");
        return false;
    }
    let firstValidElem;
    let foundFirstElem = false;
    // get first valid option
    for (const option of qualityOptions) {
        // itemText is the first 4 characters of the string
        const itemText = option.innerText.substring(0, 4);
        // console.log(itemText);
        if (validQualityText.includes(itemText)) {
            if (!foundFirstElem) {
                firstValidElem = option;
                foundFirstElem = true;
                break;
            }
        }
    }
    // Legacy robust implementation
    // const bestElem = getBestButton(validQualityText, qualityOptions);
    // if (firstValidElem === bestElem) {
    //     console.log('Nodes are equal!');
    // } 
    // else {
    //     console.log('OOP APPARENTLY YT QUALITY SORTING IS WACK');
    //     return false;
    // }
    if (firstValidElem) {
        console.log(`selected ${firstValidElem.innerText}`);
        firstValidElem.click();
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
const runFuncPeriodically = async (func, attempts, interval) => {
    return new Promise((resolve) => {
      let checkAttempts = 0;
      const intervalId = setInterval(() => {
        checkAttempts++;
        if (checkAttempts > 1) console.log(`Attempt ${checkAttempts} to run function`);
        const result = func();
        if (checkAttempts >= attempts) {
          console.log("runFuncPeriodically max attempts reached");
          clearInterval(intervalId);
          resolve();
        }
        if (result) {
        //   console.log("runFuncPeriodically success");
          clearInterval(intervalId);
          resolve();
        }
      }, interval);
    });
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
    await runFuncPeriodically(setQuality, 10, 500);
    await runFuncPeriodically(setAutoplay, 10, 500);
};

window.addEventListener('yt-navigate-finish', handleNavigateFinish);
console.log("Listening for yt-navigate-finish.");
