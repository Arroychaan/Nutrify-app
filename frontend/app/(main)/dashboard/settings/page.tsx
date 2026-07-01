'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { User, Bell, Shield, LogOut } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-up max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-heading-1 text-text-primary font-display mb-1">Pengaturan</h1>
        <p className="text-body-sm text-text-secondary">Kelola preferensi akun dan profil medismu.</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <User className="w-5 h-5 text-text-primary" />
            <h3 className="font-bold text-text-primary">Profil Pengguna</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nama Lengkap" defaultValue="Budi Santoso" />
              <Input label="Email" type="email" defaultValue="budi@example.com" disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Tinggi (cm)" type="number" defaultValue="175" />
              <Input label="Berat (kg)" type="number" defaultValue="70" />
            </div>
            <div className="pt-2">
              <Button>Simpan Perubahan</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <Bell className="w-5 h-5 text-text-primary" />
            <h3 className="font-bold text-text-primary">Notifikasi</h3>
          </div>
          <div className="space-y-4">
            {[
              'Pengingat Makan dan Minum',
              'Rangkuman Nutrisi Mingguan',
              'Pesan dari Asisten AI'
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">{item}</span>
                <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-danger/20">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <Shield className="w-5 h-5 text-danger" />
            <h3 className="font-bold text-danger">Zona Berbahaya</h3>
          </div>
          <div className="space-y-4">
            <Button variant="secondary" className="w-full justify-start text-danger hover:bg-red-50 hover:text-danger hover:border-danger/50" icon={LogOut}>
              Keluar dari Akun
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
