"use strict";

function Player(name) {
    this.name = name;
    this.cards = [];
}

Player.prototype.printPile = function() {
    let frag = document.createDocumentFragment();
    let template = document.querySelector("#pile-template").content.cloneNode(true);
    template.querySelector("div").setAttribute("id", "found-pile-" + this.name);
    template.querySelector(".name").appendChild(document.createTextNode(this.name));
    frag.appendChild(template);

    document.querySelector("body").appendChild(frag);
};

Player.prototype.addToPile = function() {
    console.log("prints player cards");
    let cardDiv = document.createElement("div");
    console.log(this.cards);
    cardDiv.classList.add("card", "img", "img-" + this.cards[this.cards.length - 1], "matched-card");
    if (this.cards.length > 1) {
        cardDiv.classList.add("pile");
    }

    document.querySelector("#found-pile-" + this.name).appendChild(cardDiv);
};

module.exports = Player;
