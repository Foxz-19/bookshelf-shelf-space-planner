"""Browser smoke coverage for Shelfwise's required user journey."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=ROOT))
Thread(target=server.serve_forever, daemon=True).start()

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"http://127.0.0.1:{server.server_port}", wait_until="networkidle")

        page.locator("#book-title").fill("A Wizard of Earthsea")
        page.locator("#book-width").fill("1.2")
        page.get_by_role("button", name="Place on Shelf").click()
        assert page.get_by_role("button", name="Remove A Wizard of Earthsea, 1.20 in").count() == 1
        assert page.locator("#remaining-space").inner_text() == "28.80 in left"

        page.locator("#book-title").fill("Almost Full")
        page.locator("#book-width").fill("24")
        page.get_by_role("button", name="Place on Shelf").click()
        assert "is-warning" in page.locator("#meter-fill").get_attribute("class")

        page.locator("#book-title").fill("The Long Book")
        page.locator("#book-width").fill("30")
        page.get_by_role("button", name="Place on Shelf").click()
        assert "over" in page.locator("#remaining-space").inner_text()
        assert "is-overflow" in page.locator("#meter-fill").get_attribute("class")
        page.reload(wait_until="networkidle")
        assert page.locator(".book").count() == 3

        page.get_by_role("button", name="Remove A Wizard of Earthsea, 1.20 in").click()
        assert page.locator(".book").count() == 2
        page.get_by_role("button", name="Undo").click()
        assert page.locator(".book").count() == 3
        page.get_by_role("button", name="Remove A Wizard of Earthsea, 1.20 in").click()
        assert page.locator(".book").count() == 2
        page.get_by_role("button", name="Clear Books").click()
        assert page.get_by_role("dialog").is_visible()
        page.get_by_role("button", name="Clear Shelf").click()
        page.get_by_role("dialog").wait_for(state="hidden")
        page.wait_for_function("document.querySelectorAll('.book').length === 0")
        assert page.locator(".book").count() == 0
        assert "first story" in page.locator("#empty-state").inner_text()
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()
    server.server_close()
