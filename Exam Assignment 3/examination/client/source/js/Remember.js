"use strict";

let BasicWindow = require("./BasicWindow");

function Remember(id) {
    BasicWindow.call(this, id);

}

Remember.prototype = Object.create(BasicWindow.prototype);
Remember.prototype.constructor = Remember;


Remember.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing RememberApp");
    document.querySelector("#" + this.id).classList.add("remember-app");

    let menu = this.element.querySelector(".window-menu");
    let alt1 = document.querySelector("#temp-window-menu-alt").content.cloneNode(true);
    alt1.querySelector(".menu-alt").appendChild(document.createTextNode("New Note"));

    let alt2 = document.querySelector("#temp-window-menu-alt").content.cloneNode(true);
    alt2.querySelector(".menu-alt").appendChild(document.createTextNode("Settings"));

    menu.appendChild(alt1);
    menu.appendChild(alt2);
};

module.exports = Remember;
