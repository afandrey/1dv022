"use strict";

let BasicWindow = require("./BasicWindow");

function AboutApplication(id, x, y) {
    BasicWindow.call(this, id, x, y);
}

AboutApplication.prototype = Object.create(BasicWindow.prototype);
AboutApplication.prototype.constructor =  AboutApplication;

AboutApplication.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    this.element.classList.add("info-app");

    let template = document.querySelector("#temp-info").content.cloneNode(true);
    this.element.querySelector(".window-content").appendChild(template);

};

module.exports = AboutApplication;
