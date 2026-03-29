import os
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import IsolationForest
from joblib import dump, load
from app.utils.features import FEATURE_COLUMNS

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
LOGREG_PATH = os.path.join(MODEL_DIR, "logreg.joblib")
TREE_PATH = os.path.join(MODEL_DIR, "tree.joblib")
ISO_PATH = os.path.join(MODEL_DIR, "isoforest.joblib")


def _ensure_dir():
    os.makedirs(MODEL_DIR, exist_ok=True)


def _train_synthetic() -> Tuple[LogisticRegression, DecisionTreeClassifier, IsolationForest]:
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
    return logreg, tree, isof


def ensure_models():
    _ensure_dir()
    if os.path.exists(LOGREG_PATH) and os.path.exists(TREE_PATH) and os.path.exists(ISO_PATH):
        return
    logreg, tree, isof = _train_synthetic()
    dump(logreg, LOGREG_PATH)
    dump(tree, TREE_PATH)
    dump(isof, ISO_PATH)


def load_models():
    ensure_models()
    return load(LOGREG_PATH), load(TREE_PATH), load(ISO_PATH)


def predict_with_explainability(df: pd.DataFrame) -> Tuple[np.ndarray, List[Dict], List[List[str]], np.ndarray]:
    logreg, tree, isof = load_models()
    X = df[FEATURE_COLUMNS].values

    logreg_probs = logreg.predict_proba(X)[:, 1]
    tree_probs = tree.predict_proba(X)[:, 1]
    risk = (logreg_probs + tree_probs) / 2

    drift_scores = -isof.decision_function(X)
    drift_flags = drift_scores > np.percentile(drift_scores, 75)

    feature_contributions = []
    decision_paths = []
    for i, row in df.iterrows():
        contrib = []
        for idx, feature in enumerate(FEATURE_COLUMNS):
            impact = float(logreg.coef_[0][idx] * row[feature])
            direction = "increase" if impact >= 0 else "decrease"
            contrib.append({"feature": feature, "impact": abs(impact), "direction": direction})
        contrib_sorted = sorted(contrib, key=lambda x: x["impact"], reverse=True)
        feature_contributions.append(contrib_sorted)

        node_indicator = tree.decision_path([row[FEATURE_COLUMNS].values])
        leaf_id = tree.apply([row[FEATURE_COLUMNS].values])[0]
        feature = tree.tree_.feature
        threshold = tree.tree_.threshold
        path = []
        for node_id in node_indicator.indices:
            if leaf_id == node_id:
                continue
            if feature[node_id] != -2:
                feat_name = FEATURE_COLUMNS[feature[node_id]]
                thresh = threshold[node_id]
                value = row[feat_name]
                rule = f"{feat_name} <= {thresh:.2f}" if value <= thresh else f"{feat_name} > {thresh:.2f}"
                path.append(rule)
        decision_paths.append(path)

    return risk, feature_contributions, decision_paths, drift_flags
