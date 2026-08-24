import json
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto("http://127.0.0.1:4173", wait_until="networkidle")

    assert page.locator("#entries .empty").count() == 1
    page.locator("#name").fill("Browser-tested pothos")
    page.locator("#method").select_option(label="Water")
    page.locator("#startedAt").fill("2026-08-24")
    page.locator("#note").fill("North window")
    page.get_by_role("button", name="Add to the bench").click()
    assert page.get_by_text("Browser-tested pothos", exact=True).count() == 1
    assert page.locator("#count-attempting").inner_text() == "1"
    page.get_by_role("button", name="Edit Browser-tested pothos").click()
    page.locator("#edit-name").fill("Edited pothos")
    page.locator("#edit-note").fill("Edited note")
    page.get_by_role("button", name="Save changes").click()
    assert page.get_by_text("Edited pothos", exact=True).count() == 1
    assert page.get_by_text("Edited note", exact=True).count() == 1

    page.locator('[data-action="status"]').select_option("rooting")
    assert page.locator("#count-rooting").inner_text() == "1"
    assert "Moved to Rooting" in page.locator("#toast").inner_text()
    page.reload(wait_until="networkidle")
    assert page.get_by_text("Edited pothos", exact=True).count() == 1
    assert page.locator("#count-rooting").inner_text() == "1"
    with page.expect_download() as download_info:
        page.get_by_role("button", name="Export").click()
    assert download_info.value.suggested_filename.startswith("rooted-backup-")

    page.get_by_role("button", name="Remove Edited pothos").click()
    page.get_by_role("button", name="Keep it").click()
    assert page.get_by_text("Edited pothos", exact=True).count() == 1
    page.get_by_role("button", name="Remove Edited pothos").click()
    page.get_by_role("button", name="Remove record").click()
    page.locator("#entries .empty").wait_for()
    assert page.locator("#entries .empty").count() == 1
    page.get_by_role("button", name="Undo").click()
    assert page.get_by_text("Edited pothos", exact=True).count() == 1
    page.get_by_role("button", name="Remove Edited pothos").click()
    page.get_by_role("button", name="Remove record").click()
    page.locator("#entries .empty").wait_for()

    imported = [{"id": "12345678-import", "name": "Imported fern", "method": "Soil", "startedAt": "2026-08-24", "status": "potted", "note": "Backup restored", "createdAt": "2026-08-24T00:00:00.000Z"}]
    page.once("dialog", lambda dialog: dialog.accept())
    page.locator("#import-data").set_input_files({"name": "rooted-backup.json", "mimeType": "application/json", "buffer": json.dumps(imported).encode()})
    assert page.get_by_text("Imported fern", exact=True).count() == 1
    assert page.locator("#count-potted").inner_text() == "1"
    page.locator("#search").fill("fern")
    assert page.get_by_text("Imported fern", exact=True).count() == 1
    page.locator("#sort").select_option("name")
    page.get_by_role("button", name="Clear").click()
    assert page.locator("#search").input_value() == ""
    assert page.locator("#sort").input_value() == "newest"
    page.locator("#import-data").set_input_files({"name": "invalid.json", "mimeType": "application/json", "buffer": b"not-json"})
    assert "not a valid" in page.locator("#toast").inner_text()

    page.evaluate("localStorage.setItem('rooted-propagations-v1', '{bad json')")
    page.reload(wait_until="networkidle")
    assert "Saved data was unreadable" in page.locator("#toast").inner_text()

    page.set_viewport_size({"width": 390, "height": 844})
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    assert not errors, errors
    browser.close()
