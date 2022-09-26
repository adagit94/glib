class Sequencer {
    constructor(steps, stepValidator) {
        this.#steps = steps
        this.#stepValidator = stepValidator
    }

    #steps
    #currentStep = 0
    customData = {
        elapsedDelay: 0
    }

    #advance() {
        this.#currentStep++
    }

    validateStep() {
        const shouldAdvance = stepValidator(this.#steps[this.#currentStep], this.customData)

        if (shouldAdvance) this.#advance()
    }
}

export default Sequencer;