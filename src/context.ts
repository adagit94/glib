type GetContextSettings = {
    canvasSelector: string
} & GPUCanvasConfiguration

export const getContext = async (settings: GetContextSettings) => {
    const canvas: HTMLCanvasElement | null = document.querySelector(settings.canvasSelector)
    if (!canvas) throw new Error(`Canvas (${settings.canvasSelector}) not found.`)

    const ctx = canvas.getContext("webgpu")
    if (!ctx) throw new Error("WebGPU context not found.")

    ctx.configure({
        device: settings.device,
        format: settings.format ?? navigator.gpu.getPreferredCanvasFormat(),
        usage: settings.usage,
        alphaMode: settings.alphaMode ?? "premultiplied",
        colorSpace: settings.colorSpace,
        viewFormats: settings.viewFormats,
    })

    return ctx
}

export const createView = (ctx: GPUCanvasContext, descriptor: GPUTextureViewDescriptor) =>
    ctx.getCurrentTexture().createView(descriptor)
