import { toPng } from 'html-to-image'

export const generateAndShareImage = async (elementId: string, fileName: string) => {
    const node = document.getElementById(elementId)
    if (!node) {
        throw new Error('Element not found')
    }

    try {
        // Wait a bit for fonts/images to load if needed
        const dataUrl = await toPng(node, {
            quality: 1.0,
            pixelRatio: 2, // High quality for sharing
            backgroundColor: '#ffffff', // Prevent transparency issues
            style: {
                visibility: 'visible', // Ensure hidden elements are visible in capture
                position: 'static',   // Move from absolute/fixed if needed
                zIndex: '9999',
            }
        })

        // Check if Web Share API is supported and can share files
        if (navigator.share) {
            const blob = await (await fetch(dataUrl)).blob()
            const file = new File([blob], `${fileName}.png`, { type: 'image/png' })

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Nutrify Achievement',
                    text: 'Check out my progress on Nutrify! 🚀',
                })
                return
            }
        }

        // Fallback: Download the image
        const link = document.createElement('a')
        link.download = `${fileName}.png`
        link.href = dataUrl
        link.click()

    } catch (error) {
        console.error('Error sharing image:', error)
        throw error
    }
}
