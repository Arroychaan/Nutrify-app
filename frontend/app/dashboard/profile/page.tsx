'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { motion } from 'framer-motion'
import Toast from '@/components/Toast'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'health' | 'preferences'>('personal')
  const [formData, setFormData] = useState<any>({})
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' })

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ isVisible: true, message, type })
  }

  const hideToast = () => setToast({ ...toast, isVisible: false })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const response = await authApi.me()
      const userData = response.data || response
      setUser(userData)
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userData.gender || '',
        phoneNumber: userData.phoneNumber || '',
        heightCm: userData.heightCm || '',
        currentWeightKg: userData.currentWeightKg || '',
        targetWeightKg: userData.targetWeightKg || '',
        activityLevel: userData.activityLevel || 'moderate',
        culture: userData.culture || '',
        religion: userData.religion || '',
        medicalConditions: userData.medicalConditions || [],
        allergies: userData.allergies || [],
        dietaryRestrictions: userData.dietaryRestrictions || [],
      })
    } catch (error) {
      console.error('Failed to load user data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await authApi.updateProfile(formData)
      await loadUserData()
      setEditing(false)
      showToast('Profil berhasil diperbarui! 🎉', 'success')
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Gagal memperbarui profil', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Password baru tidak cocok', 'error')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      showToast('Password minimal 8 karakter', 'error')
      return
    }
    try {
      setSaving(true)
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      showToast('Password berhasil diubah! 🔒', 'success')
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || 'Gagal mengubah password', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    authApi.logout()
    router.push('/')
  }

  const addArrayItem = (field: string, value: string) => {
    if (value.trim()) {
      setFormData({ ...formData, [field]: [...(formData[field] || []), value.trim()] })
    }
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData({ ...formData, [field]: formData[field].filter((_: any, i: number) => i !== index) })
  }

  const calculateBMI = () => {
    if (formData.heightCm && formData.currentWeightKg) {
      const heightM = formData.heightCm / 100
      return (formData.currentWeightKg / (heightM * heightM)).toFixed(1)
    }
    return '-'
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Kurang', color: 'text-yellow-600' }
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600' }
    if (bmi < 30) return { text: 'Berlebih', color: 'text-orange-600' }
    return { text: 'Obesitas', color: 'text-red-600' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'personal', label: 'Data Diri', icon: '👤' },
    { id: 'health', label: 'Kesehatan', icon: '💪' },
    { id: 'preferences', label: 'Preferensi', icon: '🍽️' },
  ]

  return (
    <>
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || '👤'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user?.fullName || 'User'}</h1>
              <p className="text-white/80">{user?.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  BMI: {calculateBMI()} 
                  {calculateBMI() !== '-' && (
                    <span className="ml-1">
                      ({getBMICategory(parseFloat(calculateBMI())).text})
                    </span>
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              {editing ? '✕ Tutup' : '✏️ Edit'}
            </button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                👤 Data Diri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{user?.fullName || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <p className="text-lg text-gray-900 dark:text-white">{user?.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</label>
                  {editing ? (
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-lg text-gray-900 dark:text-white">
                      {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('id-ID') : '-'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin</label>
                  {editing ? (
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Pilih</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  ) : (
                    <p className="text-lg text-gray-900 dark:text-white">
                      {user?.gender === 'male' ? 'Laki-laki' : user?.gender === 'female' ? 'Perempuan' : '-'}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-green-600 dark:text-green-400 font-medium hover:underline"
                >
                  🔒 {showPasswordForm ? 'Tutup' : 'Ubah Password'}
                </button>
                
                {showPasswordForm && (
                  <div className="mt-4 space-y-3 max-w-md">
                    <input
                      type="password"
                      placeholder="Password saat ini"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    />
                    <input
                      type="password"
                      placeholder="Password baru (min. 8 karakter)"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    />
                    <input
                      type="password"
                      placeholder="Konfirmasi password baru"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    />
                    <button
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
                    >
                      {saving ? 'Menyimpan...' : 'Simpan Password'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                💪 Data Kesehatan
              </h2>
              
              {/* BMI Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Body Mass Index (BMI)</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{calculateBMI()}</p>
                    {calculateBMI() !== '-' && (
                      <p className={`text-sm font-medium ${getBMICategory(parseFloat(calculateBMI())).color}`}>
                        {getBMICategory(parseFloat(calculateBMI())).text}
                      </p>
                    )}
                  </div>
                  <div className="text-6xl">⚖️</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tinggi Badan</label>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.heightCm}
                        onChange={(e) => setFormData({ ...formData, heightCm: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      />
                      <span className="text-gray-500">cm</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.heightCm || '-'} <span className="text-sm font-normal">cm</span></p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Berat Badan</label>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={formData.currentWeightKg}
                        onChange={(e) => setFormData({ ...formData, currentWeightKg: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      />
                      <span className="text-gray-500">kg</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.currentWeightKg || '-'} <span className="text-sm font-normal">kg</span></p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Berat</label>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={formData.targetWeightKg}
                        onChange={(e) => setFormData({ ...formData, targetWeightKg: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                      />
                      <span className="text-gray-500">kg</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.targetWeightKg || '-'} <span className="text-sm font-normal">kg</span></p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tingkat Aktivitas</label>
                {editing ? (
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                  >
                    <option value="sedentary">🪑 Tidak aktif (kerja kantoran)</option>
                    <option value="light">🚶 Ringan (olahraga 1-2x/minggu)</option>
                    <option value="moderate">🏃 Sedang (olahraga 3-5x/minggu)</option>
                    <option value="active">💪 Aktif (olahraga setiap hari)</option>
                    <option value="very_active">🏋️ Sangat aktif (atlet)</option>
                  </select>
                ) : (
                  <p className="text-lg text-gray-900 dark:text-white">
                    {formData.activityLevel === 'sedentary' && '🪑 Tidak aktif'}
                    {formData.activityLevel === 'light' && '🚶 Ringan'}
                    {formData.activityLevel === 'moderate' && '🏃 Sedang'}
                    {formData.activityLevel === 'active' && '💪 Aktif'}
                    {formData.activityLevel === 'very_active' && '🏋️ Sangat aktif'}
                  </p>
                )}
              </div>

              {/* Medical Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kondisi Medis</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.medicalConditions?.map((condition: string, index: number) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm">
                      {condition}
                      {editing && (
                        <button onClick={() => removeArrayItem('medicalConditions', index)} className="hover:text-red-900">×</button>
                      )}
                    </span>
                  ))}
                  {formData.medicalConditions?.length === 0 && !editing && (
                    <span className="text-gray-500 dark:text-gray-400">Tidak ada</span>
                  )}
                </div>
                {editing && (
                  <div className="flex gap-2 flex-wrap">
                    {['Diabetes', 'Hipertensi', 'Kolesterol', 'Asam Urat', 'Jantung'].map(condition => (
                      <button
                        key={condition}
                        onClick={() => !formData.medicalConditions.includes(condition) && addArrayItem('medicalConditions', condition)}
                        disabled={formData.medicalConditions.includes(condition)}
                        className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 dark:text-gray-300"
                      >
                        + {condition}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                🍽️ Preferensi Makanan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budaya</label>
                  {editing ? (
                    <select
                      value={formData.culture}
                      onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    >
                      <option value="">Pilih budaya</option>
                      <option value="Jawa">Jawa</option>
                      <option value="Sunda">Sunda</option>
                      <option value="Minang">Minang</option>
                      <option value="Batak">Batak</option>
                      <option value="Bali">Bali</option>
                      <option value="Betawi">Betawi</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  ) : (
                    <p className="text-lg text-gray-900 dark:text-white">{user?.culture || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agama</label>
                  {editing ? (
                    <select
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                    >
                      <option value="">Pilih agama</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  ) : (
                    <p className="text-lg text-gray-900 dark:text-white">{user?.religion || '-'}</p>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alergi Makanan</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.allergies?.map((allergy: string, index: number) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm">
                      {allergy}
                      {editing && (
                        <button onClick={() => removeArrayItem('allergies', index)} className="hover:text-orange-900">×</button>
                      )}
                    </span>
                  ))}
                  {formData.allergies?.length === 0 && !editing && (
                    <span className="text-gray-500 dark:text-gray-400">Tidak ada</span>
                  )}
                </div>
                {editing && (
                  <div className="flex gap-2 flex-wrap">
                    {['Kacang', 'Seafood', 'Susu', 'Telur', 'Gluten', 'Kedelai'].map(allergy => (
                      <button
                        key={allergy}
                        onClick={() => !formData.allergies.includes(allergy) && addArrayItem('allergies', allergy)}
                        disabled={formData.allergies.includes(allergy)}
                        className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 dark:text-gray-300"
                      >
                        + {allergy}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dietary Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pantangan Diet</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.dietaryRestrictions?.map((restriction: string, index: number) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                      {restriction}
                      {editing && (
                        <button onClick={() => removeArrayItem('dietaryRestrictions', index)} className="hover:text-purple-900">×</button>
                      )}
                    </span>
                  ))}
                  {formData.dietaryRestrictions?.length === 0 && !editing && (
                    <span className="text-gray-500 dark:text-gray-400">Tidak ada</span>
                  )}
                </div>
                {editing && (
                  <div className="flex gap-2 flex-wrap">
                    {['Halal', 'Vegetarian', 'Vegan', 'Pescatarian', 'Rendah Garam', 'Rendah Gula'].map(restriction => (
                      <button
                        key={restriction}
                        onClick={() => !formData.dietaryRestrictions.includes(restriction) && addArrayItem('dietaryRestrictions', restriction)}
                        disabled={formData.dietaryRestrictions.includes(restriction)}
                        className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 dark:text-gray-300"
                      >
                        + {restriction}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        {editing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:bg-gray-400"
            >
              {saving ? 'Menyimpan...' : '✓ Simpan Perubahan'}
            </button>
            <button
              onClick={() => { setEditing(false); loadUserData() }}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Batal
            </button>
          </motion.div>
        )}

        {/* Quick Settings Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Pengaturan Lainnya</h3>
          <div className="space-y-2">
            <a 
              href="/dashboard/notifications" 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔔</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Pengaturan Notifikasi</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Atur reminder makan & push notification</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-medium py-3 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar dari Akun
          </button>
        </motion.div>
      </div>
    </>
  )
}
