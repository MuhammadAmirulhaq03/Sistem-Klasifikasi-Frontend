# Sistem Klasifikasi Frontend

Frontend dashboard untuk Sistem Klasifikasi Brondolan Sawit yang dibangun menggunakan **React 19**, **Vite**, dan **Tailwind CSS**. Aplikasi ini telah dikonfigurasi menggunakan **Docker** dan **Nginx** untuk kemudahan deployment dan isolasi environment.

---

## 📋 Prasyarat (Prerequisites)

Sebelum memulai, pastikan komputer Anda telah terpasang:
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) *(Pastikan Docker Desktop aktif/running)*

Jika ingin menjalankan tanpa Docker:
- [Node.js](https://nodejs.org/) (versi 20 atau lebih baru)
- npm (bawaan dari Node.js)

---

## 🚀 Setup & Menjalankan Menggunakan Docker

### 1. Clone Repository
Buka terminal dan jalankan perintah berikut:

```bash
git clone https://github.com/MuhammadAmirulhaq03/Sistem-Klasifikasi-Frontend.git
```

Masuk ke folder proyek:
```bash
cd Sistem-Klasifikasi-Frontend
```

### 2. Jalankan Container

#### Opsi A: Menggunakan Docker Compose (Direkomendasikan ⭐)
Cukup jalankan satu perintah berikut:

```bash
docker compose up -d --build
```

> **Catatan:**
> - `--build` akan mem-build ulang image dengan kode terbaru.
> - `-d` (*detached mode*) akan menjalankan container di latar belakang.

#### Opsi B: Menggunakan Docker CLI Manual
```bash
# 1. Build Docker image
docker build -t sistem-klasifikasi-frontend .

# 2. Jalankan container
docker run -d -p 3000:80 --name sistem-klasifikasi-frontend sistem-klasifikasi-frontend
```

### 3. Akses Aplikasi
Buka browser favorit Anda dan kunjungi:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Perintah Manajemen Docker

| Perintah | Deskripsi |
| :--- | :--- |
| `docker compose ps` | Melihat status container |
| `docker compose logs -f` | Memantau log aplikasi secara real-time |
| `docker compose restart` | Memulai ulang container |
| `docker compose down` | Menghentikan dan menghapus container |

---

## 💻 Menjalankan Secara Lokal Tanpa Docker (Mode Development)

Jika Anda ingin melakukan pengembangan (*coding*) langsung dengan fitur Hot Module Replacement (HMR):

1. **Install dependensi:**
   ```bash
   npm install
   ```

2. **Jalankan development server:**
   ```bash
   npm run dev
   ```

3. **Buka di browser:**
   👉 **[http://localhost:5173](http://localhost:5173)**
