"use strict";

function Board(element, x, y) {
    this.x = x;
    this.y = y;
    this.element = element;

    this.printCards();
}

Board.prototype.printCards = function() {
    let frag = document.createDocumentFragment();
    let rowDiv;
    let cardDiv;

    for (let i = 0; i < this.y; i += 1) {
        rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        for (let j = 0; j < this.x; j += 1) {
            cardDiv = document.createElement("div");
            cardDiv.classList.add("card-" + i + j, "card");
            rowDiv.appendChild(cardDiv);
        }

        frag.appendChild(rowDiv);
    }

    this.element.appendChild(frag);
};

module.exports = Board;
