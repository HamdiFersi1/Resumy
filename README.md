# 🚀 AI Job Matching Platform

An end-to-end intelligent recruitment system that leverages a **fine-tuned NLP model** to match candidate CVs with job descriptions and generate a compatibility score.  

The platform integrates:
- 🤖 AI-powered matching  
- 🛠️ Admin management tools  
- 📊 Business Intelligence dashboards  
- ⚙️ A complete MLOps lifecycle  

---

## 📌 Key Features

### 🔍 AI Resume Matching Engine
- Fine-tuned transformer models (**BERT / RoBERTa**)  
- Semantic similarity between CVs and job descriptions  
- Match score (0–100%)  
- Explainability layer:
  - Skills matching  
  - Experience relevance  
  - Missing keywords detection  

---

### 🛠️ Admin Dashboard
- User management (Candidates & Recruiters)  
- Job posting and tracking  
- CV database management  
- Match results and candidate ranking  
- Role-Based Access Control (RBAC)  

---

### 📊 BI & Analytics Dashboard
- Hiring funnel analytics  
- Time-to-hire tracking  
- Skill demand insights  
- Candidate pipeline metrics  
- Interactive visualizations  

---

### ⚙️ MLOps Pipeline
- Data ingestion and preprocessing  
- Model training and fine-tuning  
- Experiment tracking (MLflow)  
- API deployment (FastAPI)  
- Monitoring:
  - Model drift  
  - Latency  
  - Accuracy  
- Continuous retraining (CI/CD for ML)  

---

## 🏗️ System Architecture

Frontend (React / Next.js)
        ↓
Backend API (FastAPI / Node.js)
        ↓
ML Service (NLP Matching Model)
        ↓
Database (PostgreSQL)
        ↓
BI Layer (Power BI / Tableau / Charts)
        ↓
MLOps Pipeline (MLflow, Docker, CI/CD)

---

## 🛠️ Tech Stack

### Frontend
- React.js / Vite  
- TailwindCSS / Material UI  

### Backend
- FastAPI / Node.js / Django  
- REST APIs  

### Machine Learning
- Python  
- Hugging Face Transformers  
- Scikit-learn / PyTorch  

### Database
- PostgreSQL  

### MLOps
- MLflow  
- GitHub Actions (CI/CD)  

### BI & Analytics
- Power BI / Tableau / Chart.js  

---

## 🔄 MLOps Lifecycle

1. Data Collection  
2. Data Preprocessing  
3. Model Training  
4. Evaluation  
5. Deployment (API)  
6. Monitoring & Logging  
7. Continuous Retraining  

---

## 🎯 Roadmap

- [ ] Multi-language CV parsing  
- [ ] Advanced explainability (SHAP, LIME)  
- [ ] Real-time job recommendations  
- [ ] LinkedIn integration  
- [ ] AI interview assistant  

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Hamdi Fersi**

---

## ⭐ Contribution & Support

If you find this project useful:
- ⭐ Star the repo  
- 🍴 Fork it  
- 🤝 Contribute  

---

## ⚡ Notes

- Large datasets and trained models are **not included** in the repository  
- Use **Git LFS** or external storage for heavy files  
- Configure `.env` for secrets and API keys  
