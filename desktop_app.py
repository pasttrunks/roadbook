from __future__ import annotations

import sys
import tempfile
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
from typing import Any

import webview


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
    def choose_carfax_file(self) -> dict[str, Any]:
        window = webview.windows[0]
        result = window.create_file_dialog(
            webview.OPEN_DIALOG,
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
            webview.SAVE_DIALOG,
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
            "Roadbook — Your vehicle, organized",
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
                smoke_file.write_text("Roadbook loaded successfully.\n", encoding="utf-8")
                window.destroy()

            window.events.loaded += confirm_loaded

        webview.start(debug=False)

        if smoke_test and not smoke_file.exists():
            raise RuntimeError("Roadbook smoke test ended before the interface loaded")
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
