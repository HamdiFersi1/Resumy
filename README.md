🚀 AI Job Matching Platform

An end-to-end intelligent recruitment system that leverages a fine-tuned NLP model to match candidate CVs with job descriptions and generate a compatibility score. The platform includes a full Admin Dashboard, BI Analytics Dashboard, and a robust MLOps pipeline for continuous model improvement.

📌 Features
🔍 AI Resume Matching Engine
Fine-tuned transformer model (BERT / RoBERTa)
Semantic similarity scoring between CVs and job descriptions
Match score (0–100%)
Explainability:
Skills match
Experience relevance
Missing keywords detection
🛠️ Admin Dashboard
User management (Candidates / Recruiters)
Job posting & tracking
CV database management
Match results & rankings
Role-Based Access Control (RBAC)
📊 BI Dashboard
Hiring funnel analytics
Time-to-hire tracking
Skill demand insights
Candidate pipeline metrics
Interactive visualizations
⚙️ MLOps Pipeline
Data ingestion & preprocessing
Model training & fine-tuning
Experiment tracking (MLflow)
Deployment via API (FastAPI)
Monitoring (drift, latency, accuracy)
Continuous retraining (CI/CD for ML)

🏗️ Architecture
Frontend (React / Next.js)
        ↓
Backend API (FastAPI / Node.js)
        ↓
ML Service (Matching Model)
        ↓
Database (PostgreSQL / MongoDB)
        ↓
BI Layer (Power BI / Tableau / Charts)
        ↓
MLOps Pipeline (MLflow, Docker, Kubernetes)

🛠️ Tech Stack

Frontend

React.js / Vite
TailwindCSS / Material UI

Backend

FastAPI / Node.js / Django
REST API

Machine Learning

Python
HuggingFace Transformers
Scikit-learn / PyTorch

Database

PostgreSQL 

MLOps

MLflow
GitHub Actions (CI/CD)

BI & Analytics

Power BI / Tableau / Chart.js

🔄 MLOps Lifecycle
Data Collection
Data Preprocessing
Model Training
Evaluation
Deployment (API)
Monitoring & Logging
Continuous Retraining
🎯 Roadmap
 Multi-language CV parsing
 Advanced explainability (SHAP, LIME)
 Real-time recommendations
 LinkedIn integration
 AI interview assistant

 📄 License

This project is licensed under the MIT License.

👨‍💻 Author
Hamdi Fersi
