"use strict";

let Launcher = require("./Launcher");

function Desktop() {
    this.activeWindow = false;
    this.mouseMoveFunc = this.mouseMove.bind(this);
    this.mouseUpFunc = this.mouseUp.bind(this);
    this.windows = [];
    this.clickX = 0;
    this.clickY = 0;
    this.serialNumber = 0;
    this.zIndex = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.launcher = new Launcher(this);
}

Desktop.prototype.init = function() {
    this.launcher.init();

    document.addEventListener("mousedown", this.mouseDown.bind(this));
    document.addEventListener("keydown", this.keyDown.bind(this));
};

Desktop.prototype.mouseUp = function() {
    window.removeEventListener("mousemove", this.mouseMoveFunc);
    window.removeEventListener("mouseup", this.mouseUpFunc);
    this.activeWindow.element.classList.remove("moving");
};

Desktop.prototype.mouseDown = function(event) {
    let element = event.target;

    if (element.parentNode.classList) {
        while (!element.parentNode.classList.contains("main-frame")) {
            element = element.parentNode;
        }
    }

    if (element.classList.contains("window")) {
        if (parseInt(element.style.zIndex) !== this.zIndex) {
            this.setFocus(element);
        }

        if (event.target.classList.contains("window-top")) {
            if (!event.target.parentNode.classList.contains("maximized")) {
                this.clickX = event.clientX - this.activeWindow.x;
                this.clickY = event.clientY - this.activeWindow.y;
                element.classList.add("moving");

                window.addEventListener("mousemove", this.mouseMoveFunc);
                window.addEventListener("mouseup", this.mouseUpFunc);
            }
        }
    }
};

Desktop.prototype.mouseMove = function(event) {
    let newX = event.clientX - this.clickX;
    let newY = event.clientY - this.clickY;

    let newMidX = newX + parseInt(this.activeWindow.element.offsetWidth) / 2;
    let newMidY = newY + parseInt(this.activeWindow.element.offsetHeight) / 2;

    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;

    if (newMidX < winWidth && newMidX > 0 && newMidY < winHeight && newY > 0) {
        this.activeWindow.x = event.clientX - this.clickX;
        this.activeWindow.y = event.clientY - this.clickY;

        this.activeWindow.element.classList.remove("reset-window");
        this.activeWindow.element.style.left = this.activeWindow.x + "px";
        this.activeWindow.element.style.top = this.activeWindow.y + "px";
    }
};

Desktop.prototype.clickWindowBtn = function(event) {
    let action = event.target.classList;
    let element = event.target;

    if (element.parentNode) {
        while (!element.parentNode.id) {
            element = element.parentNode;
        }

        element = element.parentNode;
    }

    let index = -1;
    for (let i = 0; i < this.windows.length; i += 1) {
        if (this.windows[i].id === element.id) {
            index = i;
        }
    }

    if (index !== -1) {
        this.setFocus(this.windows[index].element);
        if (action.contains("exit-btn")) {
            this.closeWindow(this.windows[index].id);
        } else if (action.contains("minimize-btn")) {
            this.windows[index].minimize();
        } else if (action.contains("maximize-btn")) {
            if (this.windows[index].maximizable) {
                this.windows[index].maximize();
            }
        }
    }
};

Desktop.prototype.closeWindow = function(id) {
    let removed = false;
    for (let i = 0; i < this.windows.length && !removed; i += 1) {
        if (this.windows[i].id === id) {
            let clickedTooltip = document.querySelector("[value='id:" + this.windows[i].id + "']");
            let container = clickedTooltip.parentNode;
            while (!container.classList.contains("tooltip-container")) {
                container = container.parentNode;
            }

            container.removeChild(clickedTooltip.parentNode);

            this.windows[i].destroy();
            this.windows.splice(i, 1);
            removed = true;
        }
    }
};

Desktop.prototype.clearDesktop = function() {
    for (let i = 0; i < this.windows.length; i += 1) {
        this.windows[i].destroy();

        let windowTooltip = document.querySelector("[value='id:" + this.windows[i].id + "']");
        let container = windowTooltip.parentNode;
        while (!container.classList.contains("tooltip-container")) {
            container = container.parentNode;
        }
        container.removeChild(windowTooltip.parentNode);
    }

    this.windows = [];
    this.serialNumber = 0;
    this.offsetX = 1;
    this.offsetY = 1;
    this.zIndex = 0;
};

Desktop.prototype.keyDown = function(event) {
    if (document.activeElement.id === this.activeWindow.id) {
        if (this.activeWindow.keyActivated) {
            this.activeWindow.keyInput(event.keyCode);
        }
    }
};

Desktop.prototype.setFocus = function(element) {
    element.focus();

    for (let i = 0; i < this.windows.length; i += 1) {
        if (this.windows[i].id === element.id) {
            this.activeWindow = this.windows[i];
            this.zIndex += 1;
            element.style.zIndex = this.zIndex;
        }
    }
};

module.exports = Desktop;
