"use strict";

let BasicWindow = require("./../BasicWindow");
let Chat = require("./Chat");

function ChatApp(options) {
    BasicWindow.call(this, options);
    this.chat = undefined;
    this.settingsOpen = false;
    this.username = "";
    this.server = "vhost3.lnu.se:20080/socket/";
    this.channel = "";

    this.addFocusFunc = this.addFocus.bind(this);
    this.removeFocusFunc = this.removeFocus.bind(this);
}

ChatApp.prototype = Object.create(BasicWindow.prototype);
ChatApp.prototype.constructor = ChatApp;

ChatApp.prototype.init = function() {
    if (localStorage.getItem("username")) {
        this.username = localStorage.getItem("username");
    }

    this.print();

    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));
};

ChatApp.prototype.print = function() {
    BasicWindow.prototype.print.call(this);

    this.element.classList.add("chat-app");
    this.element.querySelector(".window-icon").classList.add("chat-offline");

    let menu = this.element.querySelector(".window-menu");
    let alt = document.querySelector("#temp-window-menu-alt").content;

    let alt1 = alt.cloneNode(true);
    alt1.querySelector(".menu-alt").appendChild(document.createTextNode("Clear History"));

    let alt2 = alt.cloneNode(true);
    alt2.querySelector(".menu-alt").appendChild(document.createTextNode("Settings"));

    menu.appendChild(alt1);
    menu.appendChild(alt2);

    this.menuSettings();
};

ChatApp.prototype.destroy = function() {
    if (this.chat) {
        this.chat.socket.close();
    }

    document.querySelector("#main-frame").removeChild(this.element);
};

ChatApp.prototype.menuClicked = function(event) {
    let target;
    if (event.target.tagName.toLowerCase() === "a") {
        target = event.target.textContent.toLowerCase();
    }

    if (target) {
        switch (target) {
            case "settings": {
                this.menuSettings();
                break;
            }
            case "clear history": {
                if (this.chat) {
                    this.chat.clearHistory();
                }
                break;
            }
        }
    }
};

ChatApp.prototype.menuSettings = function() {
    let i;
    let inputList;

    if (!this.settingsOpen) {
        let template = document.querySelector("#temp-settings").content.cloneNode(true);
        template.querySelector(".settings").classList.add("chat-settings");

        template = this.addSettings(template);

        inputList = template.querySelectorAll("input[type='text']");

        for (i = 0; i < inputList.length; i += 1) {
            inputList[i].addEventListener("focus", this.addFocusFunc);
            inputList[i].addEventListener("focusout", this.removeFocusFunc);
        }

        this.element.querySelector(".window-content").appendChild(template);
        this.settingsOpen = true;
    } else {
        let settings = document.querySelector(".settings-wrapper");
        this.element.querySelector(".window-content").removeChild(settings);
        this.settingsOpen = false;
    }
};

ChatApp.prototype.addSettings = function(element) {
    let template = document.querySelector("#temp-chat-settings").content.cloneNode(true);

    template.querySelector("input[name='username']").setAttribute("value", this.username);
    template.querySelector("input[name='server']").setAttribute("value", this.server);
    template.querySelector("input[name='channel'").setAttribute("value", this.channel);

    template.querySelector("input[type='button']").addEventListener("click", this.saveSettings.bind(this));

    element.querySelector(".settings").appendChild(template);
    return element;
};

ChatApp.prototype.saveSettings = function() {
    if (this.chat) {
        this.chat.socket.close();
        this.chat.online = false;
    }

    let form = this.element.querySelector(".settings-form");

    this.username = form.querySelector("input[name='username']").value;
    this.server = form.querySelector("input[name='server']").value;
    this.channel = form.querySelector("input[name='channel']").value;

    this.element.querySelector(".window-icon").classList.remove("chat-online");
    this.element.querySelector(".window-icon").classList.add("chat-offline");

    this.clearContent();

    if (this.username === "") {
        this.username = "User";
    }

    this.chat = new Chat(this.element, this.server, this.channel, this.username);
    this.chat.init();
    this.settingsOpen = false;
    this.setFocus();

    localStorage.setItem("username", this.username);
};

ChatApp.prototype.addFocus = function() {
    if (!this.element.classList.contains("focused-window")) {
        this.element.classList.add("focused-window");
    }
};

ChatApp.prototype.removeFocus = function() {
    if (this.element.classList.contains("focused-window")) {
        this.element.classList.remove("focused-window");
    }
};

ChatApp.prototype.setFocus = function() {
    this.element.classList.remove("focused-window");
    this.element.focus();
};

module.exports = ChatApp;
