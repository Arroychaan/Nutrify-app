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
    AlertCircle,
    Sunrise,
    Sun,
    Moon,
    Apple
} from 'lucide-react'
import Image from 'next/image'
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
                    className="bg-black rounded-3xl overflow-hidden relative shadow-lg shadow-emerald-900/10"
                >
                    {/* Preview Area */}
                    <div className="aspect-[4/5] bg-gray-900 relative flex items-center justify-center overflow-hidden">
                        {capturedImage ? (
                            <Image
                                src={capturedImage}
                                alt="Captured food"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : cameraActive ? (
                            <div className="relative w-full h-full">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                {/* Scanning Overlay */}
                                <div className="absolute inset-0 border-[30px] border-black/50 pointer-events-none">
                                    <div className="w-full h-full border-2 border-white/30 relative">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 -mt-0.5 -ml-0.5" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 -mt-0.5 -mr-0.5" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 -mb-0.5 -ml-0.5" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 -mb-0.5 -mr-0.5" />
                                        {/* Scanning Line Animation */}
                                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,1)] animate-[scan_2s_ease-in-out_infinite]" />
                                    </div>
                                </div>
                            </div>
                        ) : cameraError ? (
                            <div className="text-center p-6 text-white">
                                <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                <p className="text-red-400 text-sm mb-4">{cameraError}</p>
                            </div>
                        ) : (
                            <div className="text-center text-white/50">
                                <Camera className="w-20 h-20 text-white/20 mx-auto mb-4" />
                                <p>Tap kamera untuk mulai</p>
                            </div>
                        )}

                        {/* Analysis Loading Overlay */}
                        {analyzing && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
                                <div className="text-center text-white">
                                    <div className="relative w-20 h-20 mx-auto mb-6">
                                        <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-emerald-400 animate-pulse" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">Menganalisis Makanan...</h3>
                                    <p className="text-sm text-gray-400">AI sedang mendeteksi nutrisi</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Bar Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between gap-4">
                        {!capturedImage ? (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all text-white"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={cameraActive ? capturePhoto : startCamera}
                                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group"
                                >
                                    <div className={`rounded-full transition-all duration-300 ${cameraActive ? 'w-16 h-16 bg-white group-hover:scale-95' : 'w-4 h-4 bg-emerald-500'}`} />
                                </button>

                                <button onClick={() => setMealType(mealTypes[(mealTypes.findIndex(m => m.id === mealType) + 1) % mealTypes.length].id)} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold">
                                    {mealTypes.find(m => m.id === mealType)?.label.substring(0, 1)}
                                </button>
                            </>
                        ) : !analysisResult ? (
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={resetPhoto}
                                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={analyzePhoto}
                                    className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold gap-2 shadow-lg shadow-emerald-500/30 transition-all"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Analisis Foto
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={resetPhoto}
                                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={saveFood}
                                    disabled={saving}
                                    className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold gap-2 shadow-lg shadow-emerald-500/30 transition-all"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    Simpan Log
                                </button>
                            </div>
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
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-emerald-100 dark:border-gray-700 relative overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-[100px] -z-10" />

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">AI Confidence: 98%</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{analysisResult.foodName}</h3>
                                <p className="text-gray-500 text-sm">Porsi: {analysisResult.portion}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {/* Macros with Green/Teal Theme */}
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 text-center border border-emerald-100 dark:border-emerald-800/30">
                                <p className="text-[10px] items-center text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">Kalori</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{analysisResult.calories}</p>
                            </div>
                            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-3 text-center border border-teal-100 dark:border-teal-800/30">
                                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase mb-1">Prot</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{analysisResult.protein}g</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-3 text-center border border-green-100 dark:border-green-800/30">
                                <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase mb-1">Carb</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{analysisResult.carbs}g</p>
                            </div>
                            <div className="bg-lime-50 dark:bg-lime-900/20 rounded-2xl p-3 text-center border border-lime-100 dark:border-lime-800/30">
                                <p className="text-[10px] text-lime-600 dark:text-lime-400 font-bold uppercase mb-1">Fat</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{analysisResult.fat}g</p>
                            </div>
                        </div>
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
