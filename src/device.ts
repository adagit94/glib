export let device: GPUDevice | undefined

type TGetDeviceSettings = Partial<{ restoreLostDevice: boolean; onDeviceLost: (info: GPUDeviceLostInfo) => void }>

/**
 * @description Requests and returns {GPUDevice} when successful. It's also saved into globally available device variable.
 * @param {Object} settings
 * @param {boolean} [options.restoreLostDevice] - attempts to restore device when its lost for any reason (at fixed interval - max. once every second to diminute blockage in case of unsuccessful repeated attempts). 
 * @returns {GPUDevice} GPUDevice
 */
export const getDevice = async ({ restoreLostDevice, onDeviceLost }: TGetDeviceSettings = {}) => {
    if (!navigator?.gpu) throw new Error("WebGPU unavailable.")

    const adapter = await navigator.gpu.requestAdapter()

    if (!adapter) throw new Error("WebGPU adapter request failed.")

    device = await adapter.requestDevice()

    device.lost.then((info) => {
        console.error(`WebGPU device was lost.\n${info.message}`)

        device = undefined
        restoreLostDevice && window.setTimeout(getDevice, 1000)
    })
    device.lost.then(onDeviceLost)

    return device
}
