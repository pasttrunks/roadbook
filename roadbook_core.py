from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import tempfile
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


APP_VERSION = "1.4.2"
RELEASE_API = "https://api.github.com/repos/pasttrunks/roadbook/releases/latest"
RELEASE_ASSET = "Roadbook.exe"


def version_tuple(value: str) -> tuple[int, ...]:
    numbers = re.findall(r"\d+", str(value).split("-", 1)[0])
    return tuple(int(number) for number in numbers) or (0,)


class RoadbookStore:
    def __init__(self, base_dir: Path | None = None) -> None:
        appdata = Path(os.environ.get("APPDATA") or Path.home())
        self.base_dir = Path(base_dir) if base_dir else appdata / "Roadbook"
        self.data_path = self.base_dir / "roadbook-data.json"
        self.recovery_dir = self.base_dir / "recovery"
        self.settings_path = self.base_dir / "desktop-settings.json"

    def load(self) -> dict[str, Any]:
        if not self.data_path.exists():
            return {"ok": True, "exists": False, "text": ""}
        try:
            text = self.data_path.read_text(encoding="utf-8")
            value = json.loads(text)
            if not isinstance(value, dict):
                raise ValueError("Roadbook data must be a JSON object")
            return {"ok": True, "exists": True, "text": text}
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "exists": True, "text": "", "message": str(exc)}

    def save(self, text: str) -> dict[str, Any]:
        try:
            value = json.loads(text)
            if not isinstance(value, dict):
                raise ValueError("Roadbook data must be a JSON object")
            normalized = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
            self.base_dir.mkdir(parents=True, exist_ok=True)

            if self.data_path.exists():
                previous = self.data_path.read_text(encoding="utf-8")
                if previous == normalized:
                    self._write_mirror(normalized)
                    return {"ok": True, "path": str(self.data_path), "unchanged": True}
                self._save_recovery_copy(previous)

            self._atomic_write(self.data_path, normalized)
            self._write_mirror(normalized)
            return {"ok": True, "path": str(self.data_path), "unchanged": False}
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "message": f"Could not save Roadbook data: {exc}"}

    def storage_info(self) -> dict[str, Any]:
        settings = self._read_settings()
        backup_folder = settings.get("backup_folder", "")
        return {
            "ok": True,
            "data_path": str(self.data_path),
            "recovery_folder": str(self.recovery_dir),
            "backup_folder": backup_folder,
            "backup_path": str(Path(backup_folder) / "Roadbook-auto-backup.json") if backup_folder else "",
        }

    def set_backup_folder(self, folder: str) -> dict[str, Any]:
        try:
            path = Path(folder).expanduser().resolve()
            path.mkdir(parents=True, exist_ok=True)
            settings = self._read_settings()
            settings["backup_folder"] = str(path)
            self.base_dir.mkdir(parents=True, exist_ok=True)
            self._atomic_write(self.settings_path, json.dumps(settings, indent=2) + "\n")
            if self.data_path.exists():
                self._write_mirror(self.data_path.read_text(encoding="utf-8"))
            return {"ok": True, **self.storage_info()}
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "message": f"Could not use that backup folder: {exc}"}

    def get_secret(self, name: str) -> str:
        return str(self._read_settings().get(name, ""))

    def set_secret(self, name: str, value: str) -> None:
        settings = self._read_settings()
        if value:
            settings[name] = value
        else:
            settings.pop(name, None)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self._atomic_write(self.settings_path, json.dumps(settings, indent=2) + "\n")

    def _read_settings(self) -> dict[str, Any]:
        try:
            value = json.loads(self.settings_path.read_text(encoding="utf-8"))
            return value if isinstance(value, dict) else {}
        except (FileNotFoundError, json.JSONDecodeError, OSError):
            return {}

    def _save_recovery_copy(self, text: str) -> None:
        self.recovery_dir.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
        self._atomic_write(self.recovery_dir / f"roadbook-data-{stamp}.json", text)
        copies = sorted(self.recovery_dir.glob("roadbook-data-*.json"), reverse=True)
        for old_copy in copies[10:]:
            old_copy.unlink(missing_ok=True)

    def _write_mirror(self, text: str) -> None:
        folder = self._read_settings().get("backup_folder")
        if not folder:
            return
        target = Path(folder) / "Roadbook-auto-backup.json"
        target.parent.mkdir(parents=True, exist_ok=True)
        self._atomic_write(target, text)

    @staticmethod
    def _atomic_write(path: Path, text: str) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        temp_path = path.with_name(f".{path.name}.{os.getpid()}.tmp")
        temp_path.write_text(text, encoding="utf-8")
        os.replace(temp_path, path)


class ReleaseUpdater:
    def __init__(self, current_version: str = APP_VERSION) -> None:
        self.current_version = current_version

    def check(self) -> dict[str, Any]:
        try:
            request = urllib.request.Request(
                RELEASE_API,
                headers={
                    "Accept": "application/vnd.github+json",
                    "User-Agent": f"Roadbook/{self.current_version}",
                    "X-GitHub-Api-Version": "2026-03-10",
                },
            )
            with urllib.request.urlopen(request, timeout=12) as response:  # noqa: S310
                release = json.load(response)
            asset = next((item for item in release.get("assets", []) if item.get("name") == RELEASE_ASSET), None)
            if not asset:
                raise ValueError(f"The latest release has no {RELEASE_ASSET} asset")
            latest = str(release.get("tag_name", "")).lstrip("v")
            return {
                "ok": True,
                "current_version": self.current_version,
                "latest_version": latest,
                "available": version_tuple(latest) > version_tuple(self.current_version),
                "notes": release.get("body") or "Maintenance and reliability improvements.",
                "release_url": release.get("html_url", ""),
                "asset_url": asset.get("browser_download_url", ""),
                "digest": asset.get("digest", ""),
            }
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "message": f"Could not check for updates: {exc}"}

    def prepare(self, asset_url: str, digest: str, install_dir: Path, process_id: int) -> dict[str, Any]:
        update_root: Path | None = None
        try:
            self._validate_asset_url(asset_url)
            install_dir = install_dir.resolve()
            if install_dir.parent == install_dir or not (install_dir / "Roadbook.exe").exists():
                raise ValueError("Roadbook's installation folder could not be verified")

            update_root = Path(tempfile.mkdtemp(prefix="roadbook-update-"))
            downloaded_exe = update_root / RELEASE_ASSET
            request = urllib.request.Request(asset_url, headers={"User-Agent": f"Roadbook/{self.current_version}"})
            with urllib.request.urlopen(request, timeout=60) as response, downloaded_exe.open("wb") as output:  # noqa: S310
                shutil.copyfileobj(response, output)
            self._verify_digest(downloaded_exe, digest)
            self._validate_executable(downloaded_exe)

            script_path = update_root / "install-roadbook-update.ps1"
            script_path.write_text(
                self._updater_script(downloaded_exe, install_dir, process_id),
                encoding="utf-8-sig",
            )
            return {"ok": True, "script_path": str(script_path), "version": self.current_version}
        except Exception as exc:  # noqa: BLE001
            if update_root:
                shutil.rmtree(update_root, ignore_errors=True)
            return {"ok": False, "message": f"Could not prepare the update: {exc}"}

    @staticmethod
    def _validate_asset_url(url: str) -> None:
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.netloc.lower() != "github.com":
            raise ValueError("Update downloads must come from github.com")
        if not parsed.path.startswith("/pasttrunks/roadbook/releases/download/") or not parsed.path.endswith(f"/{RELEASE_ASSET}"):
            raise ValueError("The update URL is not an official Roadbook release asset")

    @staticmethod
    def _verify_digest(archive: Path, expected: str) -> None:
        if not expected.startswith("sha256:"):
            raise ValueError("GitHub did not provide a SHA-256 digest for this update")
        hasher = hashlib.sha256()
        with archive.open("rb") as update_file:
            for chunk in iter(lambda: update_file.read(1024 * 1024), b""):
                hasher.update(chunk)
        actual = hasher.hexdigest()
        if actual.lower() != expected.split(":", 1)[1].lower():
            raise ValueError("The update checksum did not match GitHub's release digest")

    @staticmethod
    def _validate_executable(executable: Path) -> None:
        if executable.stat().st_size < 1024 * 1024:
            raise ValueError("The downloaded Roadbook executable is unexpectedly small")
        with executable.open("rb") as app_file:
            if app_file.read(2) != b"MZ":
                raise ValueError("The downloaded update is not a Windows executable")

    @staticmethod
    def _updater_script(downloaded_exe: Path, install_dir: Path, process_id: int) -> str:
        def ps(value: Path) -> str:
            return str(value).replace("'", "''")

        return f"""$ErrorActionPreference = 'Stop'
$source = '{ps(downloaded_exe)}'
$install = '{ps(install_dir)}'
$exe = Join-Path $install 'Roadbook.exe'

Wait-Process -Id {int(process_id)} -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 750

if (-not (Test-Path -LiteralPath $exe)) {{ throw 'Roadbook installation could not be verified.' }}
Copy-Item -LiteralPath $source -Destination $exe -Force
$env:PYINSTALLER_RESET_ENVIRONMENT = '1'
if ($env:ROADBOOK_UPDATE_SMOKE_TEST -eq '1') {{
  Start-Process -FilePath $exe -ArgumentList '--smoke-test'
}} else {{
  Start-Process -FilePath $exe
}}
"""
