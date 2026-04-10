# Troubleshooting Upload Foto Profil

Panduan lengkap untuk mengatasi masalah upload foto profil.

## Error: "Bucket not found"

### Penyebab
Bucket `avatars` belum dibuat di Supabase Storage.

### Solusi

1. **Buka Supabase Dashboard**
   - Login ke [Supabase Dashboard](https://supabase.com/dashboard)
   - Pilih project Anda

2. **Buat Bucket Baru**
   - Klik menu **Storage** di sidebar
   - Klik tombol **New bucket**
   - Isi nama bucket: `avatars`
   - Set **Public bucket**: ✅ (centang)
   - Klik **Create bucket**

3. **Konfigurasi RLS Policies (Opsional)**
   
   Jika ingin kontrol akses lebih ketat:
   
   ```sql
   -- Policy untuk upload (authenticated users)
   CREATE POLICY "Users can upload their own avatar"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'avatars' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Policy untuk update (authenticated users)
   CREATE POLICY "Users can update their own avatar"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (
     bucket_id = 'avatars' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Policy untuk delete (authenticated users)
   CREATE POLICY "Users can delete their own avatar"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'avatars' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Policy untuk public read
   CREATE POLICY "Anyone can view avatars"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'avatars');
   ```

4. **Verifikasi**
   - Coba upload foto lagi
   - Seharusnya berhasil

---

## Error: "Fitur upload foto belum dikonfigurasi"

### Penyebab
Environment variable `SUPABASE_SERVICE_ROLE_KEY` belum diset.

### Solusi

1. **Dapatkan Service Role Key**
   - Buka Supabase Dashboard
   - Klik **Project Settings** > **API**
   - Scroll ke bagian **Project API keys**
   - Copy **service_role** key (bukan anon key!)

2. **Set Environment Variable**
   
   Edit file `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

3. **Restart Development Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Verifikasi**
   - Coba upload foto lagi
   - Error seharusnya hilang

---

## Error: "Penyimpanan foto belum tersedia"

### Penyebab
Kombinasi dari bucket tidak ada dan service role key tidak diset.

### Solusi
Ikuti kedua solusi di atas:
1. Buat bucket `avatars`
2. Set `SUPABASE_SERVICE_ROLE_KEY`

---

## Error: "Ukuran file melebihi 2MB"

### Penyebab
File yang diupload terlalu besar.

### Solusi

**Opsi 1: Kompres Gambar**
- Gunakan tools online seperti:
  - [TinyPNG](https://tinypng.com/)
  - [Squoosh](https://squoosh.app/)
  - [Compressor.io](https://compressor.io/)

**Opsi 2: Ubah Limit Size (Developer)**

Edit `app/api/profile/upload/route.ts`:
```typescript
// Ubah dari 2MB ke 5MB
const maxSize = 5 * 1024 * 1024 // 5MB
```

Edit `app/dashboard/profile/ProfileForm.tsx`:
```typescript
// Ubah validasi di client
if (file.size > 5 * 1024 * 1024) {
  setError('Ukuran file melebihi 5MB.')
  return
}
```

---

## Error: "Tipe file tidak valid"

### Penyebab
File yang diupload bukan format gambar yang didukung.

### Format yang Didukung
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)
- ✅ GIF (.gif)

### Solusi
Konversi gambar ke format yang didukung menggunakan:
- Windows: Paint, Photos
- Mac: Preview
- Online: [CloudConvert](https://cloudconvert.com/)

---

## Error: "Koneksi bermasalah"

### Penyebab
- Internet tidak stabil
- Supabase service down
- Firewall memblokir koneksi

### Solusi

1. **Cek Koneksi Internet**
   ```bash
   ping google.com
   ```

2. **Cek Supabase Status**
   - Buka [Supabase Status](https://status.supabase.com/)
   - Pastikan semua service hijau

3. **Cek Firewall/VPN**
   - Matikan VPN sementara
   - Cek firewall tidak memblokir Supabase

4. **Coba Lagi**
   - Tunggu beberapa saat
   - Refresh halaman
   - Upload ulang

---

## Error: "File dengan nama yang sama sudah ada"

### Penyebab
File dengan nama yang sama sudah ada di storage (jarang terjadi karena menggunakan timestamp).

### Solusi
- Tunggu 1 detik
- Upload ulang
- File akan mendapat nama unik baru

---

## Foto Tidak Muncul Setelah Upload

### Penyebab
- Bucket tidak public
- URL tidak valid
- Cache browser

### Solusi

1. **Pastikan Bucket Public**
   - Buka Supabase Dashboard > Storage
   - Klik bucket `avatars`
   - Pastikan **Public** toggle aktif

2. **Clear Cache Browser**
   - Chrome: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
   - Firefox: Ctrl+F5 (Windows) atau Cmd+Shift+R (Mac)

3. **Cek URL di Browser**
   - Copy URL foto dari database
   - Paste di browser baru
   - Jika tidak bisa diakses, bucket tidak public

---

## Upload Lambat

### Penyebab
- File terlalu besar
- Koneksi internet lambat
- Server Supabase jauh dari lokasi

### Solusi

1. **Kompres Gambar**
   - Gunakan tools kompres online
   - Target ukuran < 500KB

2. **Cek Kecepatan Internet**
   ```bash
   # Test upload speed
   speedtest-cli
   ```

3. **Pilih Region Terdekat**
   - Saat buat project Supabase baru
   - Pilih region terdekat dengan user

---

## Tips Pencegahan

### 1. Validasi di Client
Selalu validasi sebelum upload:
- Cek ukuran file
- Cek tipe file
- Tampilkan preview

### 2. Kompres Otomatis
Tambahkan library untuk kompres otomatis:
```bash
npm install browser-image-compression
```

```typescript
import imageCompression from 'browser-image-compression'

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1024,
  useWebWorker: true
}

const compressedFile = await imageCompression(file, options)
```

### 3. Progress Indicator
Tampilkan progress upload untuk file besar:
```typescript
const xhr = new XMLHttpRequest()
xhr.upload.addEventListener('progress', (e) => {
  const percent = (e.loaded / e.total) * 100
  setProgress(percent)
})
```

### 4. Retry Mechanism
Tambahkan retry otomatis untuk koneksi tidak stabil:
```typescript
async function uploadWithRetry(file: File, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploadFile(file)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

---

## Checklist Setup Lengkap

Pastikan semua ini sudah dikonfigurasi:

- [ ] Supabase project sudah dibuat
- [ ] Bucket `avatars` sudah dibuat
- [ ] Bucket di-set sebagai **Public**
- [ ] Environment variables sudah diset:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Development server sudah di-restart
- [ ] Browser cache sudah di-clear

---

## Masih Bermasalah?

Jika masih ada masalah setelah mengikuti panduan ini:

1. **Cek Console Browser**
   - Buka Developer Tools (F12)
   - Lihat tab Console untuk error
   - Screenshot error dan share

2. **Cek Server Logs**
   ```bash
   # Development
   npm run dev
   
   # Lihat output di terminal
   ```

3. **Cek Supabase Logs**
   - Buka Supabase Dashboard
   - Klik **Logs** di sidebar
   - Filter by Storage
   - Lihat error logs

4. **Buat Issue**
   - Buat issue di repository
   - Sertakan:
     - Error message lengkap
     - Screenshot
     - Steps to reproduce
     - Environment (OS, browser, Node version)

---

## Referensi

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)
- [Next.js File Upload](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#formdata)
