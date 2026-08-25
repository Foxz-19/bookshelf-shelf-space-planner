import os
import socket
import subprocess
import time

from playwright.sync_api import sync_playwright

command = ["npm.cmd" if os.name == "nt" else "npm", "run", "dev", "--", "--host", "127.0.0.1"]
server = subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
try:
    deadline = time.time() + 30
    while time.time() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", 5173), timeout=1): break
        except OSError: time.sleep(.2)
    else: raise RuntimeError("Vite server did not start")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.goto("http://localhost:5173")
        page.wait_for_load_state("networkidle")
        assert page.locator("#now").input_value()
        assert page.locator("#results").get_attribute("aria-label") == "Nap recommendations"
        page.locator("#now").fill("")
        page.get_by_role("button", name="Find my perfect nap").click()
        assert page.get_by_role("alert").get_by_text("Please enter both times").is_visible()
        page.locator("#now").fill("13:00")
        page.locator("#wake").fill("14:35")
        page.get_by_role("button", name="Find my perfect nap").click()
        page.wait_for_selector("h2:has-text('1h 35m to rest')")
        assert page.get_by_text("Sleep Cycle Nap").is_visible()
        assert page.get_by_text("2:30 PM").is_visible()
        page.locator("#wake").fill("")
        assert page.locator("#window").inner_text() == "Choose a wake-up time"
        assert page.get_by_text("Set your times, then let the math do the dreaming.").is_visible()
        page.locator("#wake").fill("14:35")
        page.get_by_role("button", name="Find my perfect nap").click()
        page.wait_for_selector("h2:has-text('1h 35m to rest')")
        page.locator("#time-format").select_option("24h")
        assert page.get_by_text("14:30").is_visible()
        page.locator("#now").fill("23:50")
        page.locator("#wake").fill("00:20")
        assert "tomorrow" in page.locator("#window").inner_text()
        page.get_by_role("button", name="Find my perfect nap").click()
        page.wait_for_selector("h2:has-text('30 min to rest')")
        assert page.get_by_text("00:10").is_visible()
        page.locator("#now").fill("13:00")
        page.locator("#wake").fill("13:00")
        page.get_by_role("button", name="Find my perfect nap").click()
        page.wait_for_selector("h2:has-text('A tiny window')")
        assert page.get_by_text("Your wake-up time is now").is_visible()
        page.locator("#now").fill("13:00")
        page.locator("#wake").fill("13:05")
        page.get_by_role("button", name="Find my perfect nap").click()
        page.wait_for_selector("h2:has-text('A tiny window')")
        for width in (280, 768, 1440):
            page.set_viewport_size({"width": width, "height": 900})
            assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        assert not errors, errors
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=10)
