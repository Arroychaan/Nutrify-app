// Indonesian and English translations for AI Ate Indonesia app

export type Language = 'id' | 'en'

export const translations = {
  // Common
  save: { id: 'Simpan', en: 'Save' },
  cancel: { id: 'Batal', en: 'Cancel' },
  edit: { id: 'Edit', en: 'Edit' },
  delete: { id: 'Hapus', en: 'Delete' },
  loading: { id: 'Memuat...', en: 'Loading...' },
  saving: { id: 'Menyimpan...', en: 'Saving...' },
  success: { id: 'Berhasil', en: 'Success' },
  error: { id: 'Error', en: 'Error' },
  confirm: { id: 'Konfirmasi', en: 'Confirm' },

  // Navigation
  nav: {
    dashboard: { id: 'Dashboard', en: 'Dashboard' },
    foodLog: { id: 'Jurnal Makanan', en: 'Food Log' },
    mealPlan: { id: 'Meal Plan', en: 'Meal Plan' },
    chat: { id: 'Chat AI', en: 'Chat AI' },
    profile: { id: 'Profil', en: 'Profile' },
    settings: { id: 'Pengaturan', en: 'Settings' },
    logout: { id: 'Keluar', en: 'Logout' },
  },

  // Dashboard
  dashboard: {
    welcome: { id: 'Selamat datang', en: 'Welcome' },
    todaySummary: { id: 'Ringkasan Hari Ini', en: "Today's Summary" },
    calories: { id: 'Kalori', en: 'Calories' },
    protein: { id: 'Protein', en: 'Protein' },
    carbs: { id: 'Karbohidrat', en: 'Carbs' },
    fat: { id: 'Lemak', en: 'Fat' },
    streak: { id: 'Streak', en: 'Streak' },
    days: { id: 'hari', en: 'days' },
    quickActions: { id: 'Aksi Cepat', en: 'Quick Actions' },
    logFood: { id: 'Catat Makanan', en: 'Log Food' },
    askAI: { id: 'Tanya AI', en: 'Ask AI' },
    viewMealPlan: { id: 'Lihat Meal Plan', en: 'View Meal Plan' },
    remaining: { id: 'Sisa', en: 'Remaining' },
    caloriesToday: { id: 'Kalori Hari Ini', en: "Calories Today" },
    water: { id: 'Air Minum', en: 'Water Intake' },
    achieved: { id: 'Tercapai', en: 'Achieved' },
    add: { id: 'Tambah', en: 'Add' },
    log: { id: 'Catat', en: 'Log' },
    photo: { id: 'Foto', en: 'Photo' },
    weigh: { id: 'Timbang', en: 'Weigh' },
    viewAll: { id: 'Lihat Semua', en: 'View All' },
    empty: { id: 'Belum ada', en: 'Empty' },
    item: { id: 'item', en: 'item' },
    slogan: { id: 'Partner Kesehatanmu', en: 'Your Health Partner' },
    greetings: {
      morning: { id: 'Selamat Pagi', en: 'Good Morning' },
      afternoon: { id: 'Selamat Siang', en: 'Good Afternoon' },
      evening: { id: 'Selamat Sore', en: 'Good Evening' },
      night: { id: 'Selamat Malam', en: 'Good Night' },
    },
    streakMessages: {
      beginner: { id: 'Mulai langkah sehatmu hari ini!', en: 'Start your healthy journey today!' },
      active: { id: 'Konsistensi adalah kunci! Pertahankan!', en: 'Consistency is key! Keep it up!' },
      consistent: { id: 'Luar biasa! 3 hari berturut-turut!', en: 'Amazing! 3 days in a row!' },
      onFire: { id: 'Wow! Seminggu penuh hidup sehat!', en: 'Wow! A full week of healthy living!' },
      legend: { id: 'Anda legend! Satu bulan konsisten!', en: 'You are a legend! One month consistent!' },
    },
    share: {
      title: { id: 'Bagikan Prestasi', en: 'Share Achievement' },
      subtitle: { id: 'Tunjukkan konsistensi dan pencapaianmu kepada teman-teman!', en: 'Show off your consistency and achievements to your friends!' },
      preparing: { id: 'Menyiapkan Gambar...', en: 'Preparing Image...' },
      shareNow: { id: 'Bagikan Sekarang', en: 'Share Now' },
      download: { id: 'Unduh Gambar', en: 'Download Image' },
      greatJob: { id: 'Kerja Bagus', en: 'Great Job' },
      quote: { id: 'Konsistensi adalah jembatan antara tujuan dan pencapaian.', en: 'Consistency is the bridge between goals and accomplishment.' },
      join: { id: 'Bergabunglah di AI Ate Indonesia App 🚀', en: 'Join us on AI Ate Indonesia App 🚀' },
      dailySummary: { id: 'Ringkasan Harian', en: 'Daily Summary' },
      totalIntake: { id: 'Total Asupan', en: 'Total Intake' },
    },
  },

  // Food Log
  foodLog: {
    title: { id: 'Catatan Makanan', en: 'Food Log' },
    addFood: { id: 'Tambah Makanan', en: 'Add Food' },
    breakfast: { id: 'Sarapan', en: 'Breakfast' },
    lunch: { id: 'Makan Siang', en: 'Lunch' },
    dinner: { id: 'Makan Malam', en: 'Dinner' },
    snack: { id: 'Camilan', en: 'Snack' },
    foodName: { id: 'Nama Makanan', en: 'Food Name' },
    portion: { id: 'Porsi', en: 'Portion' },
    notes: { id: 'Catatan', en: 'Notes' },
    noFoodLogged: { id: 'Belum ada makanan dicatat', en: 'No food logged yet' },
    subtitle: { id: 'Catat asupan harianmu', en: 'Log your daily intake' },
    totalCalories: { id: 'Total Kalori', en: 'Total Calories' },
    deleteConfirm: { id: 'Hapus log makanan ini?', en: 'Delete this food log?' },
    deleteSuccess: { id: 'Log makanan berhasil dihapus', en: 'Food log deleted successfully' },
    deleteError: { id: 'Gagal menghapus log makanan', en: 'Failed to delete food log' },
    noLogs: { id: 'Belum ada', en: 'No' },
  },
  common: {
    today: { id: 'Hari Ini', en: 'Today' },
    save: { id: 'Simpan', en: 'Save' },
    cancel: { id: 'Batal', en: 'Cancel' },
    delete: { id: 'Hapus', en: 'Delete' },
  },

  // Meal Plan
  mealPlan: {
    title: { id: 'Rencana Makan', en: 'Meal Plan' },
    generate: { id: 'Buat Meal Plan', en: 'Generate Meal Plan' },
    today: { id: 'Hari Ini', en: 'Today' },
    thisWeek: { id: 'Minggu Ini', en: 'This Week' },
  },

  // Chat
  chat: {
    title: { id: 'Chat dengan AI Dietician', en: 'Chat with AI Dietician' },
    placeholder: { id: 'Ketik pesan...', en: 'Type a message...' },
    send: { id: 'Kirim', en: 'Send' },
    thinking: { id: 'Sedang berpikir...', en: 'Thinking...' },
  },

  // Profile
  profile: {
    title: { id: 'Profil Saya', en: 'My Profile' },
    fullName: { id: 'Nama Lengkap', en: 'Full Name' },
    email: { id: 'Email', en: 'Email' },
    phone: { id: 'Nomor Telepon', en: 'Phone Number' },
    height: { id: 'Tinggi Badan', en: 'Height' },
    weight: { id: 'Berat Badan', en: 'Weight' },
    targetWeight: { id: 'Target Berat', en: 'Target Weight' },
    activityLevel: { id: 'Tingkat Aktivitas', en: 'Activity Level' },
    badges: { id: 'Lencana', en: 'Badges' },
  },

  // Settings
  settings: {
    title: { id: 'Pengaturan', en: 'Settings' },
    subtitle: { id: 'Kelola akun dan preferensi aplikasi Anda', en: 'Manage your account and app preferences' },

    // Tabs
    account: { id: 'Akun', en: 'Account' },
    health: { id: 'Kesehatan', en: 'Health' },
    diet: { id: 'Diet', en: 'Diet' },
    notifications: { id: 'Notifikasi', en: 'Notifications' },
    app: { id: 'Aplikasi', en: 'App' },
    privacy: { id: 'Privasi', en: 'Privacy' },
    about: { id: 'Tentang', en: 'About' },

    // Account
    accountInfo: { id: 'Informasi Akun', en: 'Account Information' },
    changePassword: { id: 'Ubah Password', en: 'Change Password' },
    currentPassword: { id: 'Password Saat Ini', en: 'Current Password' },
    newPassword: { id: 'Password Baru', en: 'New Password' },
    confirmPassword: { id: 'Konfirmasi Password', en: 'Confirm Password' },

    // Health
    healthProfile: { id: 'Profil Kesehatan', en: 'Health Profile' },
    dateOfBirth: { id: 'Tanggal Lahir', en: 'Date of Birth' },
    gender: { id: 'Jenis Kelamin', en: 'Gender' },
    male: { id: 'Laki-laki', en: 'Male' },
    female: { id: 'Perempuan', en: 'Female' },

    // Activity levels
    sedentary: { id: 'Tidak Aktif (jarang olahraga)', en: 'Sedentary (rarely exercise)' },
    light: { id: 'Ringan (1-2x/minggu)', en: 'Light (1-2x/week)' },
    moderate: { id: 'Sedang (3-4x/minggu)', en: 'Moderate (3-4x/week)' },
    active: { id: 'Aktif (5-6x/minggu)', en: 'Active (5-6x/week)' },
    veryActive: { id: 'Sangat Aktif (setiap hari)', en: 'Very Active (daily)' },

    // Diet
    culturalPreferences: { id: 'Preferensi Budaya', en: 'Cultural Preferences' },
    culture: { id: 'Budaya', en: 'Culture' },
    religion: { id: 'Agama', en: 'Religion' },
    dietaryRestrictions: { id: 'Pembatasan Diet', en: 'Dietary Restrictions' },
    allergies: { id: 'Alergi Makanan', en: 'Food Allergies' },
    dislikes: { id: 'Makanan yang Tidak Disukai', en: 'Disliked Foods' },
    medicalConditions: { id: 'Kondisi Medis', en: 'Medical Conditions' },
    addAllergy: { id: 'Tambah alergi (enter untuk menambah)', en: 'Add allergy (press enter)' },
    addDislike: { id: 'Tambah makanan (enter untuk menambah)', en: 'Add food (press enter)' },

    // App Settings
    appSettings: { id: 'Pengaturan Aplikasi', en: 'App Settings' },
    language: { id: 'Bahasa', en: 'Language' },
    theme: { id: 'Tema', en: 'Theme' },
    themeLight: { id: 'Terang', en: 'Light' },
    themeDark: { id: 'Gelap', en: 'Dark' },
    themeSystem: { id: 'Sistem', en: 'System' },
    units: { id: 'Satuan Ukuran', en: 'Units' },
    metric: { id: 'Metrik (kg, cm)', en: 'Metric (kg, cm)' },
    imperial: { id: 'Imperial (lb, ft)', en: 'Imperial (lb, ft)' },
    darkModeNote: { id: '* Mode gelap akan tersedia di update selanjutnya', en: '* Dark mode coming in next update' },

    // Privacy
    exportData: { id: 'Ekspor Data', en: 'Export Data' },
    exportDataDesc: { id: 'Unduh semua data Anda dalam format JSON. Ini termasuk profil, log makanan, dan pengaturan.', en: 'Download all your data in JSON format. This includes profile, food logs, and settings.' },
    exportMyData: { id: 'Ekspor Data Saya', en: 'Export My Data' },
    resetProgress: { id: 'Reset Progress', en: 'Reset Progress' },
    resetProgressDesc: { id: 'Hapus semua log makanan dan streak Anda. Data profil akan tetap tersimpan.', en: 'Delete all food logs and streaks. Profile data will be kept.' },
    deleteAccount: { id: 'Hapus Akun', en: 'Delete Account' },
    deleteAccountDesc: { id: 'Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.', en: 'This action cannot be undone. All your data will be permanently deleted.' },
    deleteMyAccount: { id: 'Hapus Akun Saya', en: 'Delete My Account' },
    deleteConfirmText: { id: 'Ketik "HAPUS AKUN" untuk konfirmasi:', en: 'Type "DELETE ACCOUNT" to confirm:' },
    deleteConfirmPlaceholder: { id: 'HAPUS AKUN', en: 'DELETE ACCOUNT' },

    // About
    aiDietician: { id: 'AI Dietician untuk Indonesia', en: 'AI Dietician for Indonesia' },
    version: { id: 'Versi', en: 'Version' },
    helpSupport: { id: 'Bantuan & Dukungan', en: 'Help & Support' },
    contactUs: { id: 'Hubungi Kami', en: 'Contact Us' },
    faq: { id: 'Pertanyaan yang sering diajukan', en: 'Frequently asked questions' },
    rateApp: { id: 'Beri Rating', en: 'Rate App' },
    rateAppDesc: { id: 'Bantu kami berkembang dengan rating Anda', en: 'Help us grow with your rating' },
    legal: { id: 'Legal', en: 'Legal' },
    privacyPolicy: { id: 'Kebijakan Privasi', en: 'Privacy Policy' },
    termsConditions: { id: 'Syarat & Ketentuan', en: 'Terms & Conditions' },
    madeWith: { id: 'Dibuat dengan ❤️ di Indonesia', en: 'Made with ❤️ in Indonesia' },
  },

  // Notifications
  notifications: {
    title: { id: 'Pengaturan Notifikasi', en: 'Notification Settings' },
    enable: { id: 'Aktifkan Notifikasi', en: 'Enable Notifications' },
    mealReminders: { id: 'Pengingat Makan', en: 'Meal Reminders' },
    streakReminders: { id: 'Pengingat Streak', en: 'Streak Reminders' },
    goalProgress: { id: 'Progress Tujuan', en: 'Goal Progress' },
    dailyTips: { id: 'Tips Harian', en: 'Daily Tips' },
    weeklyReport: { id: 'Laporan Mingguan', en: 'Weekly Report' },
    testNotification: { id: 'Kirim Notifikasi Test', en: 'Send Test Notification' },
  },

  // Toast messages
  toast: {
    profileUpdated: { id: 'Profil berhasil diperbarui! 🎉', en: 'Profile updated successfully! 🎉' },
    healthUpdated: { id: 'Data kesehatan berhasil diperbarui! 💪', en: 'Health data updated successfully! 💪' },
    dietUpdated: { id: 'Preferensi diet berhasil diperbarui! 🥗', en: 'Diet preferences updated successfully! 🥗' },
    passwordChanged: { id: 'Password berhasil diubah! 🔒', en: 'Password changed successfully! 🔒' },
    dataExported: { id: 'Data berhasil diekspor! 📦', en: 'Data exported successfully! 📦' },
    settingsSaved: { id: 'Pengaturan aplikasi disimpan', en: 'App settings saved' },
    errorLoadingUser: { id: 'Gagal memuat data pengguna', en: 'Failed to load user data' },
    errorUpdatingProfile: { id: 'Gagal memperbarui profil', en: 'Failed to update profile' },
    passwordMismatch: { id: 'Konfirmasi password tidak cocok', en: 'Password confirmation does not match' },
    passwordTooShort: { id: 'Password minimal 8 karakter', en: 'Password must be at least 8 characters' },
    featureComingSoon: { id: 'Fitur ini akan tersedia di update selanjutnya', en: 'This feature will be available in the next update' },
  },
} as const

// Helper function to get translation
export function t(key: string, lang: Language): string {
  const keys = key.split('.')
  let result: any = translations

  for (const k of keys) {
    if (result[k] === undefined) {
      console.warn(`Translation not found: ${key}`)
      return key
    }
    result = result[k]
  }

  if (typeof result === 'object' && result[lang]) {
    return result[lang]
  }

  return key
}
