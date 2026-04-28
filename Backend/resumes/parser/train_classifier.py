import pandas as pd
import numpy as np
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import xgboost as xgb
import os

training_data = [
    ("Software Engineer at Google", "Work Experience"),
    ("Developed a chatbot for customer service", "Work Experience"),
    ("Bachelor's Degree in Computer Science", "Education"),
    ("Graduated from Stanford University", "Education"),
    ("Proficient in Python, Java, and SQL", "Skills"),
    ("5+ years experience in software development", "Work Experience"),
    ("Certified AWS Solutions Architect", "Certifications"),
    ("Location: Tunis, Tunisia", "Location"),
    ("Phone: +216 98 765 432", "Contact"),
]

df = pd.DataFrame(training_data, columns=["text", "label"])

# Vectorization
vectorizer = TfidfVectorizer(max_features=1000)
X = vectorizer.fit_transform(df["text"]).toarray()

# Label Encoding
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(df["label"])

# Handle singleton classes
label_counts = pd.Series(y).value_counts()
for label in label_counts[label_counts == 1].index:
    idx = np.where(y == label)[0][0]
    X = np.vstack([X, X[idx]])
    y = np.append(y, label)

# Split
num_classes = len(np.unique(y))
min_test_size = max(num_classes, int(0.2 * len(y)))
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=min_test_size, random_state=42, stratify=y)

# Train model
xgb_model = xgb.XGBClassifier(n_estimators=100, eval_metric="mlogloss", use_label_encoder=False)
xgb_model.fit(X_train, y_train)

# Create directory if it doesn't exist
model_dir = "resumes/parser/models"
os.makedirs(model_dir, exist_ok=True)

# Save everything
joblib.dump(vectorizer, os.path.join(model_dir, "vectorizer.joblib"))
joblib.dump(label_encoder, os.path.join(model_dir, "label_encoder.joblib"))
joblib.dump(xgb_model, os.path.join(model_dir, "xgb_model.joblib"))
print("✅ Model, vectorizer, and encoder saved.")
