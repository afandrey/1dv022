"use strict";

/**
 * Timer constructor
 * @param owner {Object} - owner object that created timer
 * @param element {Object} - element to print timer
 * @param time {Number} - time to count down
 * @constructor
 */

function Timer(owner, element, time) {
    this.owner = owner;
    this.time = time;
    this.element = element;
    this.startTime = new Date().getTime();
    this.interval = undefined;
}

/**
 * Function that starts the timer with an interval
 */

Timer.prototype.start = function() {
    this.interval = setInterval(this.run.bind(this), 100);
};

/**
 * Function to be executed each interval
 */

Timer.prototype.run = function() {
    var now = new Date().getTime();

    var diff = (now - this.startTime) / 1000;

    var showTime = this.time - diff;

    if (diff >= this.time) {
        showTime = 0;
        clearInterval(this.interval);
        this.owner.gameOver("time");
    }

    if (showTime <= 10) {
        this.print(showTime.toFixed(1));
    } else {
        this.print(showTime.toFixed(0));
    }
};

/**
 * Function that stops timer before it's finished
 * @returns {number}
 */

Timer.prototype.stop = function() {
    clearInterval(this.interval);
    var now = new Date().getTime();

    return (now - this.startTime) / 1000;
};

/**
 * Function to print the timer
 * @param diff
 */

Timer.prototype.print = function(diff) {
    this.element.replaceChild(document.createTextNode(diff), this.element.firstChild);
};

module.exports = Timer;
