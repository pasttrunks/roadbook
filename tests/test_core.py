import hashlib
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

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


class ReleaseUpdaterTests(unittest.TestCase):
    def test_release_notes_match_application_version(self) -> None:
        notes = (Path(__file__).parents[1] / "RELEASE_NOTES.md").read_text(encoding="utf-8")
        self.assertIn(APP_VERSION, notes)

    def test_version_comparison(self) -> None:
        self.assertGreater(version_tuple("v1.10.0"), version_tuple("1.9.9"))
        self.assertEqual(version_tuple("1.1.0"), (1, 1, 0))

    def test_release_url_validation(self) -> None:
        ReleaseUpdater._validate_asset_url(
            "https://github.com/pasttrunks/roadbook/releases/download/v1.1.0/Roadbook-Windows.zip"
        )
        with self.assertRaises(ValueError):
            ReleaseUpdater._validate_asset_url("https://example.com/Roadbook-Windows.zip")

    def test_bundle_and_digest_validation(self) -> None:
        with tempfile.TemporaryDirectory() as root:
            archive = Path(root) / "Roadbook-Windows.zip"
            with zipfile.ZipFile(archive, "w") as bundle:
                bundle.writestr("Roadbook/Roadbook.exe", b"exe")
                bundle.writestr("Roadbook/Roadbook.exe.config", b"config")
                bundle.writestr("Roadbook/_internal/library.dll", b"dll")
            with zipfile.ZipFile(archive) as bundle:
                ReleaseUpdater._validate_bundle(bundle)
            digest = "sha256:" + hashlib.sha256(archive.read_bytes()).hexdigest()
            ReleaseUpdater._verify_digest(archive, digest)
            with self.assertRaises(ValueError):
                ReleaseUpdater._verify_digest(archive, "sha256:" + "0" * 64)


if __name__ == "__main__":
    unittest.main()
