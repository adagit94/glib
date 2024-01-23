type TFramerSettings = { animate: boolean; timescale: number, renderer: () => void }

export const createFramer = ({ animate, timescale, renderer }: TFramerSettings) => {
    const data = {
        delta: 0,
        frameDelta: 0,
        lastTimestamp: 0,
    }

    const render = () => {
        const now = Date.now() * (timescale ?? 1)
        const elapsedTime = data.lastTimestamp === 0 ? 0 : now - data.lastTimestamp

        data.delta += elapsedTime
        data.frameDelta = elapsedTime
        data.lastTimestamp = now

        renderer()

        if (animate) window.requestAnimationFrame(render)
    }

    const trigger = () => {
        data.delta = 0
        data.frameDelta = 0
        data.lastTimestamp = 0

        window.requestAnimationFrame(render)

        return () => {
            animate = false

            return trigger
        }
    }

    return trigger
}
