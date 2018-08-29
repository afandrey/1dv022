"use strict";

let BasicWindow = require("./BasicWindow");

function ExampleApp(id, x, y) {
    BasicWindow.call(this, id, x, y);
}

ExampleApp.prototype = Object.create(BasicWindow.prototype);
ExampleApp.prototype.constructor = ExampleApp;

ExampleApp.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    console.log("printing ExampleApp");
    document.querySelector("#" + this.id).classList.add("example-app");
};

ExampleApp.prototype.keyInput = function(key) {
    console.log(key);
};

module.exports = ExampleApp;
