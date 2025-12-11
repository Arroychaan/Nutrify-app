'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Camera,
    Upload,
    RotateCcw,
    Loader2,
    Sparkles,
    Check,
    X,
    ImageIcon,
    Sunrise,
    Sun,
    Moon,
    Apple
} from 'lucide-react'
import { foodLogApi, api } from '@/lib/api'
import Toast from '@/components/Toast'

export default function PhotoFoodPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const mealParam = searchParams.get('meal')

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [mealType, setMealType] = useState(mealParam || 'breakfast')
    const [cameraActive, setCameraActive] = useState(false)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })
    const [cameraError, setCameraError] = useState<string | null>(null)

    const mealTypes = [
        { id: 'breakfast', label: 'Sarapan', icon: Sunrise, color: 'amber' },
        { id: 'lunch', label: 'Makan Siang', icon: Sun, color: 'orange' },
        { id: 'dinner', label: 'Makan Malam', icon: Moon, color: 'indigo' },
        { id: 'snack', label: 'Camilan', icon: Apple, color: 'emerald' },
    ]

    // Start camera
    const startCamera = async () => {
        try {
            setCameraError(null)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use back camera on mobile
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setCameraActive(true)
            }
        } catch (error: any) {
            console.error('Camera error:', error)
            if (error.name === 'NotAllowedError') {
                setCameraError('Izin kamera ditolak. Mohon izinkan akses kamera di pengaturan browser.')
            } else if (error.name === 'NotFoundError') {
                setCameraError('Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.')
            } else {
                setCameraError('Gagal mengakses kamera. Coba upload foto dari galeri.')
            }
        }
    }

    // Stop camera
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            videoRef.current.srcObject = null
            setCameraActive(false)
        }
    }

    // Capture photo from camera
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(video, 0, 0)
                const imageData = canvas.toDataURL('image/jpeg', 0.8)
                setCapturedImage(imageData)
                stopCamera()
            }
        }
    }

    // Handle file upload
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setCapturedImage(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Reset photo
    const resetPhoto = () => {
        setCapturedImage(null)
        setAnalysisResult(null)
        setCameraError(null)
    }

    // Analyze photo with AI
    const analyzePhoto = async () => {
        if (!capturedImage) return

        setAnalyzing(true)
        try {
            // In a real app, this would send the image to an AI API (like GPT-4V, Google Vision, etc.)
            // For now, we'll simulate an analysis
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Simulated result - in production, this would come from AI
            const mockResults = [
                { foodName: 'Nasi Goreng', calories: 500, protein: 12, carbs: 65, fat: 22, portion: '1 piring' },
                { foodName: 'Ayam Goreng', calories: 260, protein: 27, carbs: 0, fat: 16, portion: '1 potong' },
                { foodName: 'Mie Goreng', calories: 450, protein: 8, carbs: 55, fat: 22, portion: '1 piring' },
                { foodName: 'Soto Ayam', calories: 250, protein: 18, carbs: 20, fat: 10, portion: '1 mangkuk' },
                { foodName: 'Gado-gado', calories: 300, protein: 12, carbs: 25, fat: 18, portion: '1 porsi' },
            ]

            const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
            setAnalysisResult(randomResult)
            setToast({ isVisible: true, message: 'Foto berhasil dianalisis! 🎉', type: 'success' })
        } catch (error) {
            setToast({ isVisible: true, message: 'Gagal menganalisis foto', type: 'error' })
        } finally {
            setAnalyzing(false)
        }
    }

    // Save food log
    const saveFood = async () => {
        if (!analysisResult) return

        setSaving(true)
        try {
            await foodLogApi.create({
                mealType,
                foodName: analysisResult.foodName,
                portion: analysisResult.portion,
                calories: analysisResult.calories,
                proteinG: analysisResult.protein,
                carbsG: analysisResult.carbs,
                fatG: analysisResult.fat,
            })

            setToast({ isVisible: true, message: 'Makanan berhasil dicatat! 🍽️', type: 'success' })
            setTimeout(() => {
                router.push('/dashboard/food-log')
            }, 1000)
        } catch (error) {
            setToast({ isVisible: true, message: 'Gagal menyimpan', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    return (
        <>
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />

            <canvas ref={canvasRef} className="hidden" />

            <div className="max-w-xl mx-auto space-y-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            stopCamera()
                            router.back()
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Foto Makanan</h1>
                        <p className="text-sm text-gray-500">AI akan mendeteksi makanan secara otomatis</p>
                    </div>
                </div>

                {/* Meal Type Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <p className="text-sm font-medium text-gray-500 mb-3">Waktu Makan</p>
                    <div className="grid grid-cols-4 gap-2">
                        {mealTypes.map((meal) => {
                            const Icon = meal.icon
                            const isActive = mealType === meal.id
                            return (
                                <button
                                    key={meal.id}
                                    onClick={() => setMealType(meal.id)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${isActive
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-50 dark:bg-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs font-medium">{meal.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Camera/Photo Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    {/* Preview Area */}
                    <div className="aspect-[4/3] bg-gray-900 relative flex items-center justify-center">
                        {capturedImage ? (
                            // Show captured image
                            <img
                                src={capturedImage}
                                alt="Captured food"
                                className="w-full h-full object-cover"
                            />
                        ) : cameraActive ? (
                            // Show camera feed
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        ) : cameraError ? (
                            // Show error
                            <div className="text-center p-6">
                                <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-red-400 text-sm mb-4">{cameraError}</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-purple-500 text-white rounded-xl font-medium"
                                >
                                    Upload dari Galeri
                                </button>
                            </div>
                        ) : (
                            // Show placeholder
                            <div className="text-center">
                                <Camera className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">Ambil foto atau upload dari galeri</p>
                            </div>
                        )}

                        {/* Analysis Overlay */}
                        {analyzing && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                                    <p className="font-medium">Menganalisis foto...</p>
                                    <p className="text-sm text-gray-300">AI sedang mendeteksi makanan</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 flex gap-3">
                        {!capturedImage ? (
                            <>
                                <button
                                    onClick={cameraActive ? capturePhoto : startCamera}
                                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    <Camera className="w-5 h-5" />
                                    {cameraActive ? 'Ambil Foto' : 'Buka Kamera'}
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                >
                                    <Upload className="w-5 h-5" />
                                </button>
                            </>
                        ) : !analysisResult ? (
                            <>
                                <button
                                    onClick={resetPhoto}
                                    className="py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={analyzePhoto}
                                    disabled={analyzing}
                                    className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    {analyzing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-5 h-5" />
                                    )}
                                    Analisis dengan AI
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={resetPhoto}
                                    className="py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl flex items-center justify-center gap-2"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={saveFood}
                                    disabled={saving}
                                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Check className="w-5 h-5" />
                                    )}
                                    Simpan
                                </button>
                            </>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </motion.div>

                {/* Analysis Result */}
                {analysisResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">AI Terdeteksi</p>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{analysisResult.foodName}</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">Kalori</p>
                                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{analysisResult.calories}</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                                <p className="text-xs text-blue-600 dark:text-blue-400">Protein</p>
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{analysisResult.protein}g</p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                                <p className="text-xs text-amber-600 dark:text-amber-400">Karbo</p>
                                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{analysisResult.carbs}g</p>
                            </div>
                            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-3 text-center">
                                <p className="text-xs text-pink-600 dark:text-pink-400">Lemak</p>
                                <p className="text-lg font-bold text-pink-700 dark:text-pink-300">{analysisResult.fat}g</p>
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-400 mt-4">
                            Porsi: {analysisResult.portion}
                        </p>
                    </motion.div>
                )}

                {/* Instructions */}
                {!capturedImage && !cameraActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4"
                    >
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tips Foto Makanan</h4>
                        <ul className="text-sm text-gray-500 space-y-1">
                            <li>📸 Foto dari atas dengan pencahayaan baik</li>
                            <li>🍽️ Pastikan semua makanan terlihat jelas</li>
                            <li>📏 Sertakan referensi ukuran (piring, sendok)</li>
                            <li>🎯 Fokuskan kamera pada makanan</li>
                        </ul>
                    </motion.div>
                )}
            </div>
        </>
    )
}
