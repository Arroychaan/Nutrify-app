'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Heart,
    AlertTriangle,
    Leaf,
    Plus,
    X,
    Save,
    Loader2
} from 'lucide-react'
import { authApi } from '@/lib/api'
import Toast from '@/components/Toast'

const commonAllergies = [
    'Kacang', 'Susu', 'Telur', 'Ikan', 'Udang', 'Kepiting',
    'Gluten', 'Kedelai', 'Gandum', 'Wijen'
]

const commonConditions = [
    'Diabetes', 'Hipertensi', 'Kolesterol Tinggi', 'Asam Urat',
    'Jantung', 'Ginjal', 'Asam Lambung', 'Maag'
]

const commonDiets = [
    'Vegetarian', 'Vegan', 'Halal', 'Rendah Garam', 'Rendah Gula',
    'Rendah Lemak', 'Tinggi Protein', 'Keto', 'Rendah Karbo'
]

export default function HealthSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as any })

    const [allergies, setAllergies] = useState<string[]>([])
    const [medicalConditions, setMedicalConditions] = useState<string[]>([])
    const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
    const [newAllergy, setNewAllergy] = useState('')
    const [newCondition, setNewCondition] = useState('')
    const [newDiet, setNewDiet] = useState('')

    useEffect(() => {
        loadUser()
    }, [])

    const loadUser = async () => {
        try {
            const res = await authApi.me()
            const user = res.data || res
            setAllergies(user.allergies || [])
            setMedicalConditions(user.medicalConditions || [])
            setDietaryRestrictions(user.dietaryRestrictions || [])
        } catch (error) {
            console.error('Failed to load user', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await authApi.updateProfile({
                allergies,
                medicalConditions,
                dietaryRestrictions
            })
            setToast({ isVisible: true, message: 'Data kesehatan berhasil disimpan! ✅', type: 'success' })
        } catch (error: any) {
            setToast({
                isVisible: true,
                message: error.response?.data?.error?.message || 'Gagal menyimpan',
                type: 'error'
            })
        } finally {
            setSaving(false)
        }
    }

    const addItem = (type: 'allergy' | 'condition' | 'diet', value: string) => {
        if (!value.trim()) return
        const normalizedValue = value.trim()

        if (type === 'allergy' && !allergies.includes(normalizedValue)) {
            setAllergies([...allergies, normalizedValue])
            setNewAllergy('')
        } else if (type === 'condition' && !medicalConditions.includes(normalizedValue)) {
            setMedicalConditions([...medicalConditions, normalizedValue])
            setNewCondition('')
        } else if (type === 'diet' && !dietaryRestrictions.includes(normalizedValue)) {
            setDietaryRestrictions([...dietaryRestrictions, normalizedValue])
            setNewDiet('')
        }
    }

    const removeItem = (type: 'allergy' | 'condition' | 'diet', value: string) => {
        if (type === 'allergy') {
            setAllergies(allergies.filter(a => a !== value))
        } else if (type === 'condition') {
            setMedicalConditions(medicalConditions.filter(c => c !== value))
        } else if (type === 'diet') {
            setDietaryRestrictions(dietaryRestrictions.filter(d => d !== value))
        }
    }

    const toggleQuickAdd = (type: 'allergy' | 'condition' | 'diet', value: string) => {
        if (type === 'allergy') {
            if (allergies.includes(value)) {
                setAllergies(allergies.filter(a => a !== value))
            } else {
                setAllergies([...allergies, value])
            }
        } else if (type === 'condition') {
            if (medicalConditions.includes(value)) {
                setMedicalConditions(medicalConditions.filter(c => c !== value))
            } else {
                setMedicalConditions([...medicalConditions, value])
            }
        } else if (type === 'diet') {
            if (dietaryRestrictions.includes(value)) {
                setDietaryRestrictions(dietaryRestrictions.filter(d => d !== value))
            } else {
                setDietaryRestrictions([...dietaryRestrictions, value])
            }
        }
    }

    if (loading) {
        return (
            <div className="max-w-xl mx-auto animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
            </div>
        )
    }

    return (
        <>
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />

            <div className="max-w-xl mx-auto space-y-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kondisi Kesehatan</h1>
                        <p className="text-sm text-gray-500">Alergi, kondisi medis, dan preferensi diet</p>
                    </div>
                </div>

                {/* Allergies */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500" /> Alergi Makanan
                    </h3>

                    {/* Selected */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {allergies.map((allergy) => (
                            <span
                                key={allergy}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium"
                            >
                                {allergy}
                                <button onClick={() => removeItem('allergy', allergy)} className="hover:text-amber-900">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                        {allergies.length === 0 && (
                            <span className="text-gray-400 text-sm">Tidak ada alergi yang tercatat</span>
                        )}
                    </div>

                    {/* Quick Add */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {commonAllergies.map((item) => (
                            <button
                                key={item}
                                onClick={() => toggleQuickAdd('allergy', item)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${allergies.includes(item)
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-amber-100'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    {/* Custom Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newAllergy}
                            onChange={(e) => setNewAllergy(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem('allergy', newAllergy)}
                            placeholder="Tambah alergi lain..."
                            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                        <button
                            onClick={() => addItem('allergy', newAllergy)}
                            className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>

                {/* Medical Conditions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Heart className="w-5 h-5 text-red-500" /> Kondisi Medis
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {medicalConditions.map((condition) => (
                            <span
                                key={condition}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium"
                            >
                                {condition}
                                <button onClick={() => removeItem('condition', condition)} className="hover:text-red-900">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                        {medicalConditions.length === 0 && (
                            <span className="text-gray-400 text-sm">Tidak ada kondisi yang tercatat</span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {commonConditions.map((item) => (
                            <button
                                key={item}
                                onClick={() => toggleQuickAdd('condition', item)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${medicalConditions.includes(item)
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCondition}
                            onChange={(e) => setNewCondition(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem('condition', newCondition)}
                            placeholder="Tambah kondisi lain..."
                            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <button
                            onClick={() => addItem('condition', newCondition)}
                            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>

                {/* Dietary Restrictions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Leaf className="w-5 h-5 text-green-500" /> Preferensi Diet
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {dietaryRestrictions.map((diet) => (
                            <span
                                key={diet}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                            >
                                {diet}
                                <button onClick={() => removeItem('diet', diet)} className="hover:text-green-900">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                        {dietaryRestrictions.length === 0 && (
                            <span className="text-gray-400 text-sm">Tidak ada preferensi diet</span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {commonDiets.map((item) => (
                            <button
                                key={item}
                                onClick={() => toggleQuickAdd('diet', item)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${dietaryRestrictions.includes(item)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-100'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newDiet}
                            onChange={(e) => setNewDiet(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem('diet', newDiet)}
                            placeholder="Tambah diet lain..."
                            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <button
                            onClick={() => addItem('diet', newDiet)}
                            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Simpan Perubahan
                        </>
                    )}
                </motion.button>
            </div>
        </>
    )
}
