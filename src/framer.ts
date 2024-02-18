type TFramerSettings = { timescale: number, renderer: () => void }

export const createFramer = ({ timescale, renderer }: TFramerSettings) => {
    let anim = true
    
    const values = {
        delta: 0,
        frameDelta: 0,
        lastTimestamp: 0,
    }

    const render = () => {
        const now = Date.now() * (timescale ?? 1)
        const elapsedTime = values.lastTimestamp === 0 ? 0 : now - values.lastTimestamp

        values.delta += elapsedTime
        values.frameDelta = elapsedTime
        values.lastTimestamp = now

        renderer()

        if (anim) window.requestAnimationFrame(render)
    }

    const trigger = (animate = true) => {
        anim = animate
        
        values.delta = 0
        values.frameDelta = 0
        values.lastTimestamp = 0

        window.requestAnimationFrame(render)

        return () => {
            anim = false

            return trigger
        }
    }

    return [trigger, values]
}
