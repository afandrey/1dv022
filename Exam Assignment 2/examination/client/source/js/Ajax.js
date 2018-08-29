"use strict";

/**
 * Function to handle requests via XMLHttpRequest
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
 * @param config {object} - object with method and url
 * @param callback {function} - function to call when responding
 *
 */

function request(config, callback) {

    var req = new XMLHttpRequest();

    /**
     * first add event listener for response.
     * if you get error, call with error code
     * callback function with responseText = Returns a DOMString that contains the response to the request as text, or null if the request was unsuccessful or has not yet been sent.
     */

    req.addEventListener("load", function() {
        if (req.status >= 400) {
            callback(req.status);
        }

        callback(null, req.responseText);
    });

    /**
     * open a request from the config
     */

    req.open(config.method, config.url);

    /**
     * if config has data, send data as JSON to server.
     * else send the request.
     */

    if (config.data) {
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(config.data));
    } else {
        req.send(null);
    }
}

module.exports.request = request;
