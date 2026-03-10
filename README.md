# Student Management System (FastAPI + React)

Ung dung quan ly sinh vien voi cac chuc nang:

- Them, sua, xoa sinh vien
- Danh sach sinh vien
- Tim kiem sinh vien theo ten
- Quan ly lop hoc (Class)
- Thong ke:
  - Tong so sinh vien
  - GPA trung binh
  - So luong sinh vien theo nganh
- Xuat danh sach sinh vien ra CSV

## Cong nghe su dung

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- SQLite

### Frontend
- React (Vite)
- React Router DOM
- Axios
- Bootstrap + React-Bootstrap

## Cau truc thu muc

```text
VibeCoding/
  backend/
    main.py
    crud.py
    models.py
    schemas.py
    database.py
    requirements.txt
    sample_data.csv
  frontend/
    package.json
    vite.config.js
    src/
      App.jsx
      api.js
      pages/
        StudentList.jsx
        AddStudent.jsx
        Statistics.jsx
```

## Yeu cau moi truong

- Python 3.10+ (khuyen nghi 3.11)
- Node.js 18+ va npm

## Huong dan chay du an

### 1. Chay Backend (FastAPI)

Mo terminal tai thu muc `backend`:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend chay tai:
- `http://127.0.0.1:8000`
- Swagger Docs: `http://127.0.0.1:8000/docs`

Luu y:
- Lan chay dau se tu tao file `students.db`
- Du lieu mau duoc import tu `sample_data.csv`
- Bang `classes` duoc seed tu dong

### 2. Chay Frontend (React + Vite)

Mo terminal khac tai thu muc `frontend`:

```powershell
cd frontend
npm install
npm run dev
```

Frontend chay tai:
- `http://localhost:5173`

## API chinh

### Students
- `GET /api/students`: Lay danh sach sinh vien
- `GET /api/students?search=<name>`: Tim kiem theo ten
- `POST /api/students`: Them sinh vien
- `PUT /api/students/{student_id}`: Cap nhat sinh vien
- `DELETE /api/students/{student_id}`: Xoa sinh vien
- `GET /api/students/export`: Xuat CSV

### Classes
- `GET /api/classes`: Lay danh sach lop
- `POST /api/classes`: Tao lop
- `GET /api/classes/{class_id}`: Lay thong tin lop
- `PUT /api/classes/{class_id}`: Cap nhat lop
- `DELETE /api/classes/{class_id}`: Xoa lop

### Statistics
- `GET /api/statistics`: Lay thong ke tong hop

## Loi thuong gap

- Khong goi duoc API:
  - Kiem tra backend dang chay cong `8000`
  - Kiem tra frontend dang chay cong `5173`

- Loi schema SQLite cu:
  - Xoa `backend/students.db` roi chay lai backend

- Port da duoc su dung:
  - Doi port trong lenh `uvicorn` hoac trong `frontend/vite.config.js`
