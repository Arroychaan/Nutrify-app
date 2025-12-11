'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Utensils,
    Search,
    Plus,
    Flame,
    Sunrise,
    Sun,
    Moon,
    Apple,
    Loader2,
    Sparkles,
    Camera,
    ScanLine
} from 'lucide-react'
import { foodLogApi, api } from '@/lib/api'
import Toast from '@/components/Toast'

// Sample Indonesian foods for quick selection
const popularFoods = [
    { name: 'Nasi Putih', calories: 175, protein: 3, carbs: 40, fat: 0.3, portion: '1 piring (150g)' },
    { name: 'Ayam Goreng', calories: 260, protein: 27, carbs: 0, fat: 16, portion: '1 potong' },
    { name: 'Tempe Goreng', calories: 160, protein: 12, carbs: 8, fat: 10, portion: '2 potong' },
    { name: 'Tahu Goreng', calories: 77, protein: 5, carbs: 3, fat: 5, portion: '2 potong' },
    { name: 'Telur Dadar', calories: 185, protein: 13, carbs: 2, fat: 14, portion: '1 butir' },
    { name: 'Sayur Bayam', calories: 35, protein: 4, carbs: 4, fat: 0.5, portion: '1 mangkuk' },
    { name: 'Ikan Goreng', calories: 180, protein: 20, carbs: 5, fat: 9, portion: '1 potong' },
    { name: 'Mie Goreng', calories: 450, protein: 8, carbs: 55, fat: 22, portion: '1 piring' },
    { name: 'Nasi Goreng', calories: 500, protein: 10, carbs: 60, fat: 25, portion: '1 piring' },
    { name: 'Soto Ayam', calories: 250, protein: 18, carbs: 20, fat: 10, portion: '1 mangkuk' },
    { name: 'Gado-gado', calories: 300, protein: 12, carbs: 25, fat: 18, portion: '1 porsi' },
    { name: 'Rendang', calories: 350, protein: 25, carbs: 5, fat: 26, portion: '1 potong' },
    { name: 'Bakso', calories: 280, protein: 15, carbs: 30, fat: 12, portion: '1 mangkuk' },
    { name: 'Sate Ayam', calories: 200, protein: 20, carbs: 5, fat: 12, portion: '5 tusuk' },
    { name: 'Pisang', calories: 90, protein: 1, carbs: 23, fat: 0.3, portion: '1 buah' },
    { name: 'Kopi Susu', calories: 120, protein: 3, carbs: 15, fat: 5, portion: '1 gelas' },
]

export default function AddFoodLogPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const mealParam = searchParams.get('meal')

    const [mealType, setMealType] = useState(mealParam || 'breakfast')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFood, setSelectedFood] = useState<any>(null)
    const [customFood, setCustomFood] = useState({
        foodName: '',
        portion: '',
        calories: '',
        proteinG: '',
        carbsG: '',
        fatG: '',
    })
    const [isCustom, setIsCustom] = useState(false)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })
    const [analyzing, setAnalyzing] = useState(false)

    const filteredFoods = popularFoods.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const mealTypes = [
        { id: 'breakfast', label: 'Sarapan', icon: Sunrise, color: 'amber' },
        { id: 'lunch', label: 'Makan Siang', icon: Sun, color: 'orange' },
        { id: 'dinner', label: 'Makan Malam', icon: Moon, color: 'indigo' },
        { id: 'snack', label: 'Camilan', icon: Apple, color: 'emerald' },
    ]

    const handleSelectFood = (food: any) => {
        setSelectedFood(food)
        setIsCustom(false)
    }

    const handleCustomInput = () => {
        setSelectedFood(null)
        setIsCustom(true)
    }

    const handleSubmit = async () => {
        try {
            setSaving(true)

            const data = isCustom ? {
                mealType,
                foodName: customFood.foodName,
                portion: customFood.portion || undefined,
                calories: customFood.calories ? parseInt(customFood.calories) : undefined,
                proteinG: customFood.proteinG ? parseFloat(customFood.proteinG) : undefined,
                carbsG: customFood.carbsG ? parseFloat(customFood.carbsG) : undefined,
                fatG: customFood.fatG ? parseFloat(customFood.fatG) : undefined,
            } : {
                mealType,
                foodName: selectedFood.name,
                portion: selectedFood.portion,
                calories: selectedFood.calories,
                proteinG: selectedFood.protein,
                carbsG: selectedFood.carbs,
                fatG: selectedFood.fat,
            }

            if (!data.foodName) {
                setToast({ isVisible: true, message: 'Nama makanan harus diisi', type: 'error' })
                return
            }

            await foodLogApi.create(data)
            setToast({ isVisible: true, message: 'Makanan berhasil dicatat! 🍽️', type: 'success' })

            setTimeout(() => {
                router.push('/dashboard/food-log')
            }, 1000)
        } catch (error: any) {
            console.error('Failed to add food log', error)
            setToast({
                isVisible: true,
                message: error.response?.data?.error?.message || 'Gagal mencatat makanan',
                type: 'error'
            })
        } finally {
            setSaving(false)
        }
    }

    const analyzeWithAI = async () => {
        if (!customFood.foodName) {
            setToast({ isVisible: true, message: 'Masukkan nama makanan terlebih dahulu', type: 'warning' })
            return
        }

        try {
            setAnalyzing(true)
            // This would call an AI endpoint to estimate nutrition
            // For now, we'll use a simple lookup
            const found = popularFoods.find(f =>
                f.name.toLowerCase().includes(customFood.foodName.toLowerCase())
            )
            if (found) {
                setCustomFood({
                    ...customFood,
                    calories: found.calories.toString(),
                    proteinG: found.protein.toString(),
                    carbsG: found.carbs.toString(),
                    fatG: found.fat.toString(),
                    portion: found.portion,
                })
                setToast({ isVisible: true, message: 'Estimasi nutrisi ditemukan!', type: 'success' })
            } else {
                setToast({ isVisible: true, message: 'Tidak ditemukan. Masukkan manual.', type: 'info' })
            }
        } catch (error) {
            setToast({ isVisible: true, message: 'Gagal menganalisis', type: 'error' })
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <>
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />

            <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Makanan</h1>
                        <p className="text-sm text-gray-500">Catat apa yang kamu makan</p>
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
                                        ? `bg-${meal.color}-100 dark:bg-${meal.color}-900/30 text-${meal.color}-600 dark:text-${meal.color}-400 ring-2 ring-${meal.color}-500`
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

                {/* Search/Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari makanan..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-2">
                        <button
                            onClick={handleCustomInput}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${isCustom
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            <Plus className="w-4 h-4" />
                            Input Manual
                        </button>
                        <button
                            onClick={() => router.push(`/dashboard/food-log/photo?meal=${mealType}`)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 transition-all"
                        >
                            <Camera className="w-4 h-4" />
                            Foto Makanan
                        </button>
                    </div>

                    {/* Food List or Custom Input */}
                    {isCustom ? (
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                    Nama Makanan *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customFood.foodName}
                                        onChange={(e) => setCustomFood({ ...customFood, foodName: e.target.value })}
                                        placeholder="cth: Nasi Goreng Spesial"
                                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                    <button
                                        onClick={analyzeWithAI}
                                        disabled={analyzing}
                                        className="px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-200 transition-colors flex items-center gap-2"
                                    >
                                        {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        <span className="hidden sm:inline">AI</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                    Porsi
                                </label>
                                <input
                                    type="text"
                                    value={customFood.portion}
                                    onChange={(e) => setCustomFood({ ...customFood, portion: e.target.value })}
                                    placeholder="cth: 1 piring, 2 potong"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Kalori</label>
                                    <input
                                        type="number"
                                        value={customFood.calories}
                                        onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                                        placeholder="kkal"
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none text-center"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Protein (g)</label>
                                    <input
                                        type="number"
                                        value={customFood.proteinG}
                                        onChange={(e) => setCustomFood({ ...customFood, proteinG: e.target.value })}
                                        placeholder="g"
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none text-center"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Karbo (g)</label>
                                    <input
                                        type="number"
                                        value={customFood.carbsG}
                                        onChange={(e) => setCustomFood({ ...customFood, carbsG: e.target.value })}
                                        placeholder="g"
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none text-center"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Lemak (g)</label>
                                    <input
                                        type="number"
                                        value={customFood.fatG}
                                        onChange={(e) => setCustomFood({ ...customFood, fatG: e.target.value })}
                                        placeholder="g"
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none text-center"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            {filteredFoods.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Tidak ditemukan. Coba input manual.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredFoods.map((food, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSelectFood(food)}
                                            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${selectedFood?.name === food.name ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                                                }`}
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{food.name}</p>
                                                <p className="text-xs text-gray-500">{food.portion}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-600">{food.calories} kkal</p>
                                                <p className="text-xs text-gray-400">
                                                    P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Selected Preview */}
                {(selectedFood || (isCustom && customFood.foodName)) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                                    Akan ditambahkan ke {mealTypes.find(m => m.id === mealType)?.label}:
                                </p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {isCustom ? customFood.foodName : selectedFood?.name}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-emerald-600">
                                    {isCustom ? (customFood.calories || '0') : selectedFood?.calories}
                                </p>
                                <p className="text-xs text-emerald-600/70">kkal</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleSubmit}
                    disabled={saving || (!selectedFood && !customFood.foodName)}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/25 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            Simpan Log Makanan
                        </>
                    )}
                </motion.button>
            </div>
        </>
    )
}
