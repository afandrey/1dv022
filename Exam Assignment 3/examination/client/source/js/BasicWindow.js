"use strict";

function BasicWindow(options) {
    this.id = options.id || "" + new Date().getTime();
    this.element = undefined;
    this.x = options.x || 10;
    this.y = options.y || 10;
    this.tabIndex = options.tabIndex || 0;
    this.title = options.title || this.id;
    this.icon = options.icon || "bug_report";
    this.maximizable = options.maximizable || false;
    this.keyActivated = options.keyActivated || false;
    this.zIndex = options.zIndex;
}

BasicWindow.prototype.destroy = function() {
    document.querySelector("#main-frame").removeChild(this.element);
};

BasicWindow.prototype.print = function() {
    let template = document.querySelector("#temp-window").content.cloneNode(true);
    let tempWindow = template.querySelector("div");
    tempWindow.setAttribute("id", this.id);
    tempWindow.style.left = this.x + "px";
    tempWindow.style.top = this.y + "px";
    tempWindow.style.zIndex = this.zIndex;
    tempWindow.setAttribute("tabindex", this.tabIndex);

    let element = document.querySelector("#main-frame");
    let launcher = document.querySelector(".launcher");
    element.insertBefore(template, launcher);

    this.element = document.querySelector("#" + this.id);
    this.element.querySelector(".window-title").appendChild(document.createTextNode(this.title));
    this.element.querySelector(".window-icon").appendChild(document.createTextNode(this.icon));

    if (this.maximizable) {
        let button = document.querySelector("#temp-maximize-btn").content.cloneNode(true);
        let windowButtons = this.element.querySelector(".window-buttons");
        let removeButton = this.element.querySelector(".minimize-btn");
        windowButtons.insertBefore(button, removeButton);
    }
};

BasicWindow.prototype.minimize = function() {
    this.element.classList.toggle("minimized");
};

BasicWindow.prototype.maximize = function() {
    this.element.classList.toggle("maximized");

    let icon = this.element.querySelector(".maximize-icon i");
    if (!this.element.classList.contains("maximized")) {
        this.element.classList.add("reset-window");
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
        icon.replaceChild(document.createTextNode("crop_din"), icon.firstChild);
        this.element.querySelector(".maximize-btn").setAttribute("title", "Maximize");
    } else {
        this.element.classList.remove("reset-window");
        this.element.style.top = "0px";
        this.element.style.left = "0px";
        icon.replaceChild(document.createTextNode("filter_none"), icon.firstChild);
        this.element.querySelector(".maximize-btn").setAttribute("title", "Resize");
    }
};

BasicWindow.prototype.clearContent = function() {
    let content = this.element.querySelector(".window-content");
    while (content.hasChildNodes()) {
        content.removeChild(content.firstChild);
    }
};

module.exports = BasicWindow;
