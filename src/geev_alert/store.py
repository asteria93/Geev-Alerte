from __future__ import annotations

import json
from pathlib import Path


class SeenStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._ids = self._load_ids()

    def has(self, listing_id: str) -> bool:
        return listing_id in self._ids

    def add(self, listing_id: str) -> None:
        self._ids.add(listing_id)

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {"seen_ids": sorted(self._ids)}
        self.path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def _load_ids(self) -> set[str]:
        if not self.path.exists():
            return set()
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return set()

        raw_ids = data.get("seen_ids") if isinstance(data, dict) else None
        if not isinstance(raw_ids, list):
            return set()

        ids: set[str] = set()
        for raw_id in raw_ids:
            if raw_id is None:
                continue
            ids.add(str(raw_id))
        return ids
