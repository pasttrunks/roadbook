import hashlib
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from desktop_app import DesktopApi
from roadbook_core import APP_VERSION, ReleaseUpdater, RoadbookStore, version_tuple


class RoadbookStoreTests(unittest.TestCase):
    def test_primary_recovery_and_external_mirror(self) -> None:
        with tempfile.TemporaryDirectory() as root, tempfile.TemporaryDirectory() as mirror:
            store = RoadbookStore(Path(root))
            first = json.dumps({"vehicle": {"name": "First"}, "expenses": []})
            second = json.dumps({"vehicle": {"name": "Second"}, "expenses": []})

            self.assertTrue(store.save(first)["ok"])
            self.assertEqual(json.loads(store.load()["text"])["vehicle"]["name"], "First")
            self.assertTrue(store.set_backup_folder(mirror)["ok"])
            self.assertTrue(store.save(second)["ok"])

            mirrored = json.loads((Path(mirror) / "Roadbook-auto-backup.json").read_text(encoding="utf-8"))
            self.assertEqual(mirrored["vehicle"]["name"], "Second")
            recovery = list(store.recovery_dir.glob("roadbook-data-*.json"))
            self.assertEqual(len(recovery), 1)
            self.assertEqual(json.loads(recovery[0].read_text(encoding="utf-8"))["vehicle"]["name"], "First")

    def test_rejects_non_object_data(self) -> None:
        with tempfile.TemporaryDirectory() as root:
            result = RoadbookStore(Path(root)).save("[]")
            self.assertFalse(result["ok"])

    def test_desktop_secret_stays_out_of_user_data_and_backup(self) -> None:
        with tempfile.TemporaryDirectory() as root, tempfile.TemporaryDirectory() as mirror:
            store = RoadbookStore(Path(root))
            store.set_secret("visor_api_key", "sk_test_private")
            store.set_backup_folder(mirror)
            store.save(json.dumps({"vehicle": {"name": "Sample"}}))
            self.assertEqual(store.get_secret("visor_api_key"), "sk_test_private")
            self.assertNotIn("sk_test_private", store.data_path.read_text(encoding="utf-8"))
            self.assertNotIn("sk_test_private", (Path(mirror) / "Roadbook-auto-backup.json").read_text(encoding="utf-8"))


class ReleaseUpdaterTests(unittest.TestCase):
    def test_release_notes_match_application_version(self) -> None:
        notes = (Path(__file__).parents[1] / "RELEASE_NOTES.md").read_text(encoding="utf-8")
        self.assertIn(APP_VERSION, notes)

    def test_version_comparison(self) -> None:
        self.assertGreater(version_tuple("v1.10.0"), version_tuple("1.9.9"))
        self.assertEqual(version_tuple("1.1.0"), (1, 1, 0))

    def test_release_url_validation(self) -> None:
        ReleaseUpdater._validate_asset_url(
            "https://github.com/pasttrunks/roadbook/releases/download/v1.2.1/Roadbook.exe"
        )
        with self.assertRaises(ValueError):
            ReleaseUpdater._validate_asset_url("https://example.com/Roadbook.exe")

    def test_executable_and_digest_validation(self) -> None:
        with tempfile.TemporaryDirectory() as root:
            executable = Path(root) / "Roadbook.exe"
            executable.write_bytes(b"MZ" + b"\0" * (1024 * 1024))
            ReleaseUpdater._validate_executable(executable)
            digest = "sha256:" + hashlib.sha256(executable.read_bytes()).hexdigest()
            ReleaseUpdater._verify_digest(executable, digest)
            with self.assertRaises(ValueError):
                ReleaseUpdater._verify_digest(executable, "sha256:" + "0" * 64)

    def test_restart_script_resets_pyinstaller_environment(self) -> None:
        script = ReleaseUpdater._updater_script(Path("C:/temp/new/Roadbook.exe"), Path("C:/Roadbook"), 1234)
        self.assertIn("PYINSTALLER_RESET_ENVIRONMENT = '1'", script)
        self.assertIn("Wait-Process -Id 1234", script)


class VehicleDataTests(unittest.TestCase):
    def test_msrp_lookup_prefers_trim_and_drivetrain(self) -> None:
        payload = {"data": [
            {"trim": "Grand Touring", "description": "Grand Touring 4dr SUV", "msrp": 27970},
            {"trim": "Grand Touring", "description": "Grand Touring 4dr SUV AWD", "msrp": 29220},
            {"trim": "Sport", "description": "Sport 4dr SUV", "msrp": 21545},
        ]}
        with patch("desktop_app.urllib.request.urlopen", return_value=io.BytesIO(json.dumps(payload).encode())):
            result = DesktopApi.__new__(DesktopApi).lookup_msrp({
                "year": 2015, "make": "Mazda", "model": "CX-5",
                "trim": "Grand Touring · 2.5L", "drivetrain": "AWD",
            })
        self.assertTrue(result["ok"])
        self.assertEqual(result["msrp"], 29220)
        self.assertTrue(result["exact"])


if __name__ == "__main__":
    unittest.main()
