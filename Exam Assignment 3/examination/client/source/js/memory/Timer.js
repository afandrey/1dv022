"use strict";

function Timer() {
    this.startTime = undefined;
}

Timer.prototype.start = function() {
    this.startTime = new Date().getTime();
};

Timer.prototype.stop = function() {
    let now = new Date().getTime();

    return (now - this.startTime) / 1000;
};

Timer.prototype.print = function(diff) {
    if (this.element.hasChildNodes()) {
        this.element.replaceChild(document.createTextNode(diff), this.element.firstChild);
    }
    else {
        this.element.appendChild(document.createTextNode(diff));
    }
};

module.exports = Timer;
