"use strict";

let BasicWindow = require("./../BasicWindow");
let MemoryGame = require("./Game");

function Memory(options) {
    BasicWindow.call(this, options);

    this.settingsOpen = false;
    this.game = undefined;
    this.boardSize = [4, 4];
    this.markedCard = undefined;
}

Memory.prototype = Object.create(BasicWindow.prototype);
Memory.prototype.constructor = Memory;

Memory.prototype.init = function() {
    this.print();
    this.element.querySelector(".window-menu").addEventListener("click", this.menuClicked.bind(this));

    this.game = new MemoryGame(this.element.querySelector(".window-content"), 4, 4);
    this.game.init();
};

Memory.prototype.print = function() {
    BasicWindow.prototype.print.call(this);
    this.element.classList.add("memory-app");

    let menu = this.element.querySelector(".window-menu");
    let alt1 = document.querySelector("#temp-window-menu-alt").content.cloneNode(true);
    alt1.querySelector(".menu-alt").appendChild(document.createTextNode("New Game"));

    let alt2 = document.querySelector("#temp-window-menu-alt").content.cloneNode(true);
    alt2.querySelector(".menu-alt").appendChild(document.createTextNode("Settings"));

    menu.appendChild(alt1);
    menu.appendChild(alt2);
};

Memory.prototype.menuClicked = function(event) {
    let target;
    if (event.target.tagName.toLowerCase() === "a") {
        target = event.target.textContent.toLowerCase();
    }

    if (target) {
        switch (target) {
            case "settings": {
                //open the settings
                this.menuSettings();
                break;
            }

            case "new game": {
                if (this.settingsOpen) {
                    //hide the settings
                    this.settingsOpen = false;
                }

                //restart new game
                this.restart();
                break;
            }
        }
    }
};

Memory.prototype.restart = function(value) {
    if (value) {
        this.boardSize = value.split("x");
    }

    let y = this.boardSize[1];
    let x = this.boardSize[0];

    this.clearContent();

    this.game.removeEvents();

    //create new game and init it
    this.game = new MemoryGame(this.element.querySelector(".window-content"), x, y);
    this.game.init();
};


Memory.prototype.menuSettings = function() {
    if (!this.settingsOpen) {
        //show the settings
        let template = document.querySelector("#temp-settings").content.cloneNode(true);
        template.querySelector(".settings").classList.add("memory-settings");

        template = this.addSettings(template);
        this.element.querySelector(".window-content").appendChild(template);
        this.settingsOpen = true;
    }
    else {
        //hide the settings
        let settings = this.element.querySelector(".settings-wrapper");
        this.element.querySelector(".window-content").removeChild(settings);
        this.settingsOpen = false;
    }
};

Memory.prototype.addSettings = function(element) {
    let template = document.querySelector("#temp-memory-settings").content.cloneNode(true);

    element.querySelector(".settings").appendChild(template);
    element.querySelector("input[type='button']").addEventListener("click", this.saveSettings.bind(this));
    return element;
};

Memory.prototype.saveSettings = function() {
    let value = this.element.querySelector("select[name='board-size']").value;

    this.restart(value);
    this.settingsOpen = false;
};

Memory.prototype.keyInput = function(key) {
    if (!this.markedCard) {
        this.markedCard = this.element.querySelector(".card");
        this.markedCard.classList.add("marked");
    } else {
        this.markedCard.classList.toggle("marked");
        switch (key) {
            case 39: {
                this.keyRight();
                break;
            }

            case 37: {
                this.keyLeft();
                break;
            }

            case 38: {
                this.keyUp();
                break;
            }

            case 40: {
                this.keyDown();
                break;
            }

            case 13: {
                this.game.turnCard(this.markedCard);
                break;
            }
        }

        this.markedCard.classList.toggle("marked");
    }
};

Memory.prototype.keyRight = function() {
    if (this.markedCard.nextElementSibling) {
        this.markedCard = this.markedCard.nextElementSibling;
    }
    else {
        if (this.markedCard.parentNode.nextElementSibling) {
            this.markedCard = this.markedCard.parentNode.nextElementSibling.firstElementChild;
        }
        else {
            this.markedCard = this.element.querySelector(".card");
        }
    }
};

Memory.prototype.keyLeft = function() {
    if (this.markedCard.previousElementSibling) {
        this.markedCard = this.markedCard.previousElementSibling;
    }
    else {
        if (this.markedCard.parentNode.previousElementSibling) {
            this.markedCard = this.markedCard.parentNode.previousElementSibling.lastElementChild;
        }
        else {
            var rows = this.element.querySelectorAll(".row");
            var lastRow = rows[rows.length - 1];
            this.markedCard = lastRow.lastElementChild;
        }
    }
};

Memory.prototype.keyUp = function() {
    //find next row and card
    let row;
    let rowY;

    if (this.markedCard.parentNode.previousElementSibling) {
        let id = this.markedCard.classList[0].slice(-2);
        rowY = parseInt(id.charAt(0)) - 1;
    }
    else {
        let rows = this.element.querySelectorAll(".row");
        row = rows[rows.length - 1];
        rowY = rows.length - 1;
    }

    let cardX = this.markedCard.classList[0].slice(-1);
    this.markedCard = this.element.querySelector(".card-" + rowY + cardX);
};

Memory.prototype.keyDown = function() {
    let rowY;

    if (this.markedCard.parentNode.nextElementSibling) {
        let id = this.markedCard.classList[0].slice(-2);
        rowY = parseInt(id.charAt(0)) + 1;
    }
    else {
        rowY = 0;
    }

    let cardX = this.markedCard.classList[0].slice(-1);
    this.markedCard = this.element.querySelector(".card-" + rowY + cardX);
};

module.exports = Memory;
