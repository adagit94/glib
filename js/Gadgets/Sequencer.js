class Sequencer {
    constructor(steps, stepValidator) {
        this.#steps = steps;
        this.#stepValidator = stepValidator;
    }

    #steps;
    #currentStep = 0;
    #stepValidator;
    #elapsedDelay = 0;
    customData = {};

    #advance() {
        this.#currentStep++;
    }

    #validateDelay(step, frameT) {
        const delay = step.delay;

        if (delay) {
            this.#elapsedDelay += frameT;

            if (this.#elapsedDelay >= delay) {
                this.#elapsedDelay = 0;

                return true;
            }

            return false;
        }

        return true;
    }

    validateStep(frameT) {
        const step = this.#steps[this.#currentStep];

        console.log("step", step);

        if (step) {
            let shouldAdvance = this.#validateDelay(step, frameT);

            if (shouldAdvance) {
                shouldAdvance = this.#stepValidator(step, this.customData);

                if (shouldAdvance) this.#advance();
            }
        }
    }
}

export default Sequencer;
