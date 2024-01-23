export const getDevice = async () => {
    if (!navigator?.gpu) throw new Error("WebGPU unavailable.");

    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) throw new Error("WebGPU adapter request failed.");

    const device = await adapter.requestDevice();

    device.lost.then(info => {
        console.error(`WebGPU device was lost.\n${info.message}`);
    });

    return device;
};