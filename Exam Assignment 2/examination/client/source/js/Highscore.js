"use strict";

/**
 * Highscore constructor
 * @param nickname {string}
 * @param score {string}
 * @constructor
 */

function Highscore(nickname, score) {
    this.nickname = nickname;
    this.score = score;
    this.highscore = [];

    this.readFromFile();
}

/**
 * Function to read highscore-file from local storage
 */

Highscore.prototype.readFromFile = function() {
    var hsFile = localStorage.getItem("hs");

    if (hsFile) {
        var json = JSON.parse(hsFile);

        for (var nickname in json) {
            if (json.hasOwnProperty(nickname)) {
                this.highscore.push(json[nickname]);
            }
        }
    }
};

/**
 * Function to check if the new score is high enough for highscore list
 * @returns {boolean}
 */

Highscore.prototype.isHigh = function() {
    var isHigh = false;

    if (this.highscore.length === 0) {
        isHigh = true;
    } else {
        var lastScore = this.highscore[this.highscore.length - 1].score;
        if (this.score < lastScore || this.highscore.length < 5) {
            isHigh = true;
        }
    }

    return isHigh;
};

/**
 * Function to add the new highscore to the highscore list
 * @returns {boolean}
 */

Highscore.prototype.addToList = function() {
    var add = false;

    if (this.isHigh()) {
        var thisScore = {
            nickname: this.nickname,
            score: this.score
        };

        if (this.highscore.length === 5) {
            this.highscore.splice(-1, 1);
        }

        this.highscore.push(thisScore);
        this.highscore = this.highscore.sort(function(a, b) {
            return a.score - b.score;
        });

        this.saveToFile();

        add = true;
    }

    return add;
};

/**
 * Function to save the highscore to local storage
 */

Highscore.prototype.saveToFile = function() {
    localStorage.setItem("hs", JSON.stringify(this.highscore));
};

/**
 * Function to get the highscoreFragment for user to view
 * @returns {DocumentFragment}
 */

Highscore.prototype.createHighscoreFragment = function() {
    var frag = document.createDocumentFragment();
    var template;
    var hsNickname;
    var hsScore;

    for (var i = 0; i < this.highscore.length; i += 1) {
        template = document.querySelector("#temp-highscoreList").content.cloneNode(true);
        hsNickname = template.querySelector(".hs-nickname");
        hsScore = template.querySelector(".hs-score");

        hsNickname.appendChild(document.createTextNode(this.highscore[i].nickname));
        hsScore.appendChild(document.createTextNode(this.highscore[i].score));

        frag.appendChild(template);
    }

    return frag;
};

module.exports = Highscore;
