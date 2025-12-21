# VolunteerHub
## Hướng Dẫn Cài Đặt & Sử Diệu Chi Tiết

Dự án **VolunteerHub** được xây dựng với công nghệ hiện đại:  
- **Backend**: Node.js + TypeScript + Express + Prisma ORM  
- **Frontend**: React + TypeScript + Vite + Tailwind CSS  
- **Database**: PostgreSQL

Dưới đây là hướng dẫn cài đặt và chạy dự án chi tiết, phù hợp với môi trường sử dụng **TypeScript** và **Prisma**.

---

### 1. Yêu cầu môi trường (Prerequisites)
Trước khi bắt đầu, đảm bảo máy đã cài đặt:

- **Node.js** ≥ v18.17.0 (khuyến nghị v20.x)  
  → Tải tại: https://nodejs.org/
- **npm** ≥ 9 (đi kèm với Node.js)
- **PostgreSQL** ≥ 14  
  → Tải tại: https://www.postgresql.org/download/
- **Git** (để clone dự án)

Kiểm tra phiên bản:
```bash
node -v
npm -v
psql --version
```

### 2. Clone repo
```bash
git clone https://github.com/ChiCongn/VolunteerHub.git
cd VolunteerHub
```

### 3. Cài đặt Backend
#### 3.1. Cài đặt dependencies
```bash
cd backend
npm install
```

#### 3.2. Cấu hình file môi trường
```bash
cp .env.example .env
```
→ Server chạy tại: **http://localhost:8000**  
API base URL: `http://localhost:8000/api/v1`

### 4. Restore database
#### 4.1. Tạo database trống
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE volunteerhub;
\q
```
#### 4.2. Chỉnh sửa DATABASE_URL trong .env
Ví dụ:
```env
DATABASE_URL=postgresql://postgres:123456@localhost:5432/volunteerhub
```

#### 4.3. Import data

```bash
sudo -u postgres psql -d volunteerhub -f database/database.sql
```

#### 4.4. Taoj VAPID Key cho Web Push Notification
```bash
npx web-push generate-vapid-keys
```

#### 4.3. Tạo Prisma Client
```text
npx prisma generate
```
### 5. Chạy backend ở chế độ development
```bash
npm run dev
```
---
### 6. Cài đặt frontend
#### 6.1. Mở terminal mới, di chuyển vào thư mục frontend
```bash
cd newfront
```

#### 6.2. Cài đặt dependencies
```bash
npm install
```

#### 6.3. Cấu hình file môi trường
```bash
cp .env.example .env
```

#### 6.4. Chạy frontend ở chế độ development
```bash
npm run dev
```