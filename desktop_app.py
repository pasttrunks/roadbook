from __future__ import annotations

import sys
import subprocess
import tempfile
import threading
import json
import re
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
from typing import Any
from urllib.parse import quote, urlparse

import webview

from roadbook_core import APP_VERSION, ReleaseUpdater, RoadbookStore


def resource_root() -> Path:
    bundled = getattr(sys, "_MEIPASS", None)
    return Path(bundled) if bundled else Path(__file__).resolve().parent


ROOT = resource_root()


class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:
        return


class DesktopApi:
    def __init__(self) -> None:
        self.store = RoadbookStore()
        self.updater = ReleaseUpdater()

    def load_state(self) -> dict[str, Any]:
        return self.store.load()

    def save_state(self, text: str) -> dict[str, Any]:
        return self.store.save(text)

    def get_storage_info(self) -> dict[str, Any]:
        return {**self.store.storage_info(), "version": APP_VERSION}

    def choose_backup_folder(self) -> dict[str, Any]:
        window = webview.windows[0]
        result = window.create_file_dialog(webview.FileDialog.FOLDER, allow_multiple=False)
        if not result:
            return {"ok": False, "cancelled": True, "message": "Folder selection cancelled"}
        selected = result[0] if isinstance(result, (tuple, list)) else result
        return self.store.set_backup_folder(str(selected))

    def open_data_folder(self) -> dict[str, Any]:
        try:
            self.store.base_dir.mkdir(parents=True, exist_ok=True)
            os.startfile(str(self.store.base_dir))  # type: ignore[attr-defined]
            return {"ok": True}
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "message": f"Could not open the data folder: {exc}"}

    def decode_vin(self, vin: str) -> dict[str, Any]:
        cleaned = re.sub(r"[^A-Za-z0-9]", "", vin or "").upper()
        if len(cleaned) != 17 or re.search(r"[IOQ]", cleaned):
            return {"ok": False, "message": "Enter a valid 17-character VIN in Settings first."}
        try:
            url = f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{quote(cleaned)}?format=json"
            request = urllib.request.Request(url, headers={"User-Agent": f"Roadbook/{APP_VERSION}"})
            with urllib.request.urlopen(request, timeout=15) as response:  # noqa: S310
                payload = json.load(response)
            result = (payload.get("Results") or [{}])[0]
            return {
                "ok": True,
                "vin": cleaned,
                "year": result.get("ModelYear", ""),
                "make": result.get("Make", ""),
                "model": result.get("Model", ""),
                "trim": result.get("Trim", ""),
                "body": result.get("BodyClass", ""),
                "drive_type": result.get("DriveType", ""),
            }
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "message": f"NHTSA VIN lookup failed: {exc}"}

    def open_external_url(self, url: str) -> dict[str, Any]:
        try:
            parsed = urlparse(url)
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                raise ValueError("Only web links can be opened")
            webbrowser.open(url)
            return {"ok": True}
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "message": f"Could not open that link: {exc}"}

    def check_for_updates(self) -> dict[str, Any]:
        return self.updater.check()

    def install_update(self, asset_url: str, digest: str) -> dict[str, Any]:
        if not getattr(sys, "frozen", False):
            return {"ok": False, "message": "Automatic updates are available in the packaged Windows app."}
        install_dir = Path(sys.executable).resolve().parent
        result = self.updater.prepare(asset_url, digest, install_dir, os.getpid())
        if not result.get("ok"):
            return result
        try:
            creation_flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
            subprocess.Popen(  # noqa: S603
                [
                    "powershell.exe",
                    "-NoProfile",
                    "-NonInteractive",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-File",
                    result["script_path"],
                ],
                env={**os.environ, "PYINSTALLER_RESET_ENVIRONMENT": "1"},
                creationflags=creation_flags,
                close_fds=True,
            )
            return {"ok": True, "message": "Update ready. Roadbook will restart."}
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "message": f"Could not start the updater: {exc}"}

    def close_for_update(self) -> dict[str, Any]:
        def close_window() -> None:
            if webview.windows:
                webview.windows[0].destroy()

        threading.Timer(0.35, close_window).start()
        return {"ok": True}

    def choose_carfax_file(self) -> dict[str, Any]:
        window = webview.windows[0]
        result = window.create_file_dialog(
            webview.FileDialog.OPEN,
            allow_multiple=False,
            file_types=(
                "Vehicle history files (*.pdf;*.txt;*.csv)",
                "PDF files (*.pdf)",
                "Text files (*.txt;*.csv)",
                "All files (*.*)",
            ),
        )
        if not result:
            return {"ok": False, "message": ""}

        selected = result[0] if isinstance(result, (tuple, list)) else result
        path = Path(selected)
        try:
            if path.suffix.lower() == ".pdf":
                text = self._read_pdf(path)
            else:
                text = path.read_text(encoding="utf-8", errors="replace")
            return {"ok": True, "name": path.name, "text": text}
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "message": f"Could not read {path.name}: {exc}"}

    def save_text_file(self, suggested_name: str, text: str) -> dict[str, Any]:
        window = webview.windows[0]
        suffix = Path(suggested_name).suffix.lower()
        if suffix == ".csv":
            file_types = ("CSV files (*.csv)", "All files (*.*)")
        elif suffix == ".json":
            file_types = ("JSON files (*.json)", "All files (*.*)")
        else:
            file_types = ("Text files (*.txt)", "All files (*.*)")

        result = window.create_file_dialog(
            webview.FileDialog.SAVE,
            save_filename=suggested_name,
            file_types=file_types,
        )
        if not result:
            return {"ok": False, "message": "Save cancelled"}

        selected = result[0] if isinstance(result, (tuple, list)) else result
        path = Path(selected)
        try:
            path.write_text(text, encoding="utf-8")
            return {"ok": True, "name": path.name, "path": str(path)}
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "message": f"Could not save the file: {exc}"}

    @staticmethod
    def _read_pdf(path: Path) -> str:
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        pages: list[str] = []
        for page in reader.pages:
            pages.append(page.extract_text() or "")
        return "\n".join(pages).strip()


class ReusableHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True


def start_server() -> tuple[ThreadingHTTPServer, str]:
    port = 8765
    server = ReusableHTTPServer(("127.0.0.1", port), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, f"http://127.0.0.1:{port}/index.html"


def main() -> None:
    smoke_test = "--smoke-test" in sys.argv
    server, url = start_server()
    try:
        window = webview.create_window(
            f"Roadbook {APP_VERSION} — Your vehicle, organized",
            url,
            js_api=DesktopApi(),
            width=1460,
            height=920,
            min_size=(1040, 680),
            background_color="#edf0f5",
            text_select=True,
        )

        smoke_file = Path(
            os.environ.get(
                "ROADBOOK_SMOKE_FILE",
                str(Path(tempfile.gettempdir()) / "roadbook-smoke-ok.txt"),
            )
        )

        if smoke_test:
            smoke_file.unlink(missing_ok=True)

            def confirm_loaded() -> None:
                ready = window.evaluate_js(
                    "document.documentElement.dataset.appReady === 'true' "
                    "&& document.documentElement.dataset.desktopReady === 'true' "
                    "&& Boolean(window.pywebview?.api?.load_state) "
                    "&& document.querySelectorAll('.nav-item').length === 7 "
                    "&& Boolean(document.getElementById('dueNowCount'))"
                )
                if ready:
                    smoke_file.write_text(
                        "Roadbook loaded and rendered successfully.\n",
                        encoding="utf-8",
                    )
                window.destroy()

            def confirm_loaded_after_bridge() -> None:
                threading.Timer(1.5, confirm_loaded).start()

            window.events.loaded += confirm_loaded_after_bridge

        webview.start(debug=False)

        if smoke_test and not smoke_file.exists():
            raise RuntimeError("Roadbook smoke test ended before the interface loaded")
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
