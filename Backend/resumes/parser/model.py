import spacy
import joblib

nlp = spacy.load("en_core_web_sm")
from sentence_transformers import SentenceTransformer

# Load trained classifier components
vectorizer = joblib.load("resumes/parser/models/vectorizer.joblib")
label_encoder = joblib.load("resumes/parser/models/label_encoder.joblib")
xgb_model = joblib.load("resumes/parser/models/xgb_model.joblib")

model = SentenceTransformer('resumes/parser/models/sbert_section_scoring_v2')
