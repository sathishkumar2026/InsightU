import os
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import IsolationForest
from joblib import dump

FEATURE_COLUMNS = [
    "academic_variance",
    "sudden_drop",
    "attendance_trend",
    "behavioral_delay_mean",
    "behavioral_inactive_mean",
    "load_estimate",
]

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


def train():
    os.makedirs(MODEL_DIR, exist_ok=True)
    rng = np.random.default_rng(42)
    X = rng.normal(0, 1, size=(400, len(FEATURE_COLUMNS)))
    weights = np.array([1.2, 1.0, -1.1, 0.8, 0.6, 0.4])
    logits = X @ weights + rng.normal(0, 0.5, size=400)
    y = (1 / (1 + np.exp(-logits)) > 0.5).astype(int)

    logreg = LogisticRegression(max_iter=500)
    logreg.fit(X, y)

    tree = DecisionTreeClassifier(max_depth=4, random_state=42)
    tree.fit(X, y)

    isof = IsolationForest(random_state=42)
    isof.fit(X)

    dump(logreg, os.path.join(MODEL_DIR, "logreg.joblib"))
    dump(tree, os.path.join(MODEL_DIR, "tree.joblib"))
    dump(isof, os.path.join(MODEL_DIR, "isoforest.joblib"))


if __name__ == "__main__":
    train()
