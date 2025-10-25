from submissions.models import Result
from dataclasses import dataclass
from typing import Optional


@dataclass
class ResultDto:
    output: Optional[str]
    outcome: Result.Outcome
