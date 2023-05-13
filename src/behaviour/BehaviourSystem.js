import Pattern from "./Pattern.js";

export default class BehaviourSystem {
    constructor(pattern) {
        this.setPattern(pattern);
    }

    #pattern;

    evalPattern(frameDelta, shape, shapes) {
        this.#pattern?.eval(frameDelta, shape, shapes);
    }

    setPattern(pattern) {
        if (pattern instanceof Pattern) {
            this.#pattern = pattern;
        } else if (pattern !== undefined) {
            console.error("Behaviour system: invalid pattern.");
        }
    }
}
