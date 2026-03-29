from app.ml.pipeline import ensure_models, predict_with_explainability
import pandas as pd
from app.utils.features import FEATURE_COLUMNS


def test_pipeline_runs():
    ensure_models()
    df = pd.DataFrame([{c: 0.1 for c in FEATURE_COLUMNS}])
    risk, contrib, paths, drift = predict_with_explainability(df)
    assert len(risk) == 1
    assert len(contrib) == 1
    assert isinstance(paths[0], list)
