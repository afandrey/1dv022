"use strict";

let ExApp = require("./ExampleApp");
let Memory = require("./memory/Memory");
let ChatApp = require("./chat/ChatApp");
let About = require("./AboutApp");
let Notes = require("./Remember");

function Launcher(desktop) {
    this.desktop = desktop;

    this.dateOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric"
    };

    this.timeOptions = {
        hour: "2-digit",
        minute: "2-digit"
    };
}

Launcher.prototype.init = function() {
    document.querySelector(".launcher").addEventListener("click", this.launcherClick.bind(this));

    this.updateClock();
    window.setInterval(this.updateClock.bind(this), 1000);
};

Launcher.prototype.launcherClick = function(event) {
    let value;
    let icon;
    let title;

    let element = this.getClickedLauncherElement(event.target);

    if (element) {
        value = element.getAttribute("value");
    }

    if (value) {
        let switchTo = value.split(":");

        if (switchTo[0] === "id") {
            if (element.classList.contains("tooltip-close")) {
                this.desktop.closeWindow(switchTo[1]);
            } else {
                this.switchToWindow(switchTo[1]);
            }
        } else {
            icon = element.querySelector("i").textContent;
            title = element.querySelector(".tooltip-title").textContent;
            this.startApp(value, icon, title);
        }
    }
};

Launcher.prototype.getClickedLauncherElement = function(target) {
    let element;

    if (target.getAttribute("value")) {
        element = target;
    } else if (target.parentNode.getAttribute("value")) {
        element = target.parentNode;
    }

    return element;
};

Launcher.prototype.startApp = function(type, icon, title) {
    let marginX = 10 * (this.desktop.offsetX);
    let marginY = 10 * (this.desktop.offsetY);

    let options = {
        id: "win-" + this.desktop.serialNumber,
        x: marginX,
        y: marginY,
        tabIndex: this.desktop.serialNumber,
        zIndex: this.desktop.zIndex,
        icon: icon,
        title: title,
        maximizable: false,
        keyActivated: false
    };

    let newApp = this.createApplication(type, options);

    if (newApp) {
        let buttons = document.querySelector("#" + newApp.id + " .window-buttons");
        buttons.addEventListener("click", this.desktop.clickWindowBtn.bind(this.desktop));

        this.desktop.windows.push(newApp);

        this.addRunningApp(type, newApp);

        this.desktop.serialNumber += 1;
        this.desktop.offsetX += 1;
        this.desktop.offsetY += 1;

        this.desktop.setFocus(newApp.element);
        this.checkBounds(newApp);
    }
};

Launcher.prototype.createApplication = function(type, options) {
    let newApp;

    switch (type) {
        case "example": {
            options.maximizable = true;
            options.keyActivated = true;
            newApp = new ExApp(options);
            newApp.print();
            break;
        }
        case "memory": {
            options.keyActivated = true;
            newApp = new Memory(options);
            newApp.init();
            break;
        }
        case "chat": {
            options.maximizable = true;
            newApp = new ChatApp(options);
            newApp.init();
            break;
        }
        case "remember": {
            options.maximizable = true;
            options.keyActivated = true;
            newApp = new Notes(options);
            newApp.print();
            break;
        }
        case "info": {
            options.maximizable = true;
            newApp = new About(options);
            newApp.print();
            break;
        }
        case "reset": {
            this.desktop.clearDesktop();
            break;
        }
    }

    return newApp;
};

Launcher.prototype.checkBounds = function(app) {
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;

    let appRight = app.x + parseInt(app.element.offsetWidth);
    let appBottom = app.y + parseInt(app.element.offsetHeight);

    if (appRight > winWidth || app.x < 0) {
        this.desktop.offsetX = 1;
        app.x = 10 * (this.desktop.offsetX);
        app.element.style.left = app.x + "px";
    } else if (appBottom > winHeight || app.y < 0) {
        this.desktop.offsetY = 1;
        app.y = 10 * (this.desktop.offsetY);
        app.element.style.top = app.y + "px";
    }
};

Launcher.prototype.switchToWindow = function(id) {
    let window = document.querySelector("#" + id);

    if (window) {
        if (window.classList.contains("minimized")) {
            window.classList.remove("minimized");
        }
        this.desktop.setFocus(window);
    }
};

Launcher.prototype.addRunningApp = function(type, app) {
    let container = document.querySelector("li[value='" + type + "'] .tooltip-container");
    let template = document.querySelector("#temp-tooltip").content.cloneNode(true);
    template.querySelector(".tooltip").appendChild(document.createTextNode(app.title + "(" + app.id + ")"));
    template.querySelector(".tooltip").setAttribute("value", "id:" + app.id);
    template.querySelector(".tooltip-close").setAttribute("value", "id:" + app.id);

    container.appendChild(template);
};

Launcher.prototype.updateClock = function() {
    let dateObj = new Date();
    let date = dateObj.toLocaleDateString("sv-se", this.dateOptions);
    let time = dateObj.toLocaleTimeString("sv-se", this.timeOptions);

    let timeEl = document.querySelector(".launcher-clock-time");
    let dateEl = document.querySelector(".launcher-clock-date");

    let timeNode = document.createTextNode(time);
    let dateNode = document.createTextNode(date);

    timeEl.replaceChild(timeNode, timeEl.firstChild);
    dateEl.replaceChild(dateNode, dateEl.firstChild);
};

module.exports = Launcher;
