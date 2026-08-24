import os
import subprocess
import time
from urllib.request import urlopen

from playwright.sync_api import sync_playwright


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


command = ["npm.cmd" if os.name == "nt" else "npm", "run", "dev", "--", "--host", "127.0.0.1"]
server = subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

try:
    for _ in range(60):
        try:
            urlopen("http://127.0.0.1:5173", timeout=0.2)
            break
        except OSError:
            time.sleep(0.1)
    else:
        raise RuntimeError("Vite did not start within six seconds")

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1366, "height": 768})
        page.goto("http://127.0.0.1:5173", wait_until="networkidle")

        require(page.locator(".day").count() == 7, "Expected all seven sleep rows")
        require(page.evaluate("document.documentElement.scrollHeight <= window.innerHeight"), "Laptop layout must not scroll")

        page.locator("#sleep-0").fill("6.5")
        require(page.locator(".day").first.locator(".delta").inner_text() == "−1.5 hrs", "Daily deficit did not update")
        require("49.5 hours" in page.locator("#message").inner_text(), "Weekly debt did not update")

        page.locator("#goal").fill("7")
        require(page.locator(".day").first.locator(".delta").inner_text() == "−0.5 hrs", "Goal change did not update each day")

        page.locator("#goal").fill("99")
        require(page.locator("#goal").input_value() == "24", "Out-of-range goal was not normalized")
        require("limited" in page.locator("#goal-error").inner_text(), "Goal validation was not announced")

        page.locator("#reset").click()
        require(page.locator("dialog[open]").count() == 1, "Reset confirmation did not open")
        page.locator("dialog .danger").click()
        page.locator("dialog[open]").wait_for(state="detached")
        require(page.locator("#goal").input_value() == "0", "Reset did not clear goal")
        values = page.locator(".stepper input").evaluate_all("inputs => inputs.map(input => input.value)")
        require(all(value == "0" for value in values), "Reset did not clear all sleep entries")
        require("All inputs are now zero" in page.locator("#notice").inner_text(), "Reset status was not announced")
        browser.close()
finally:
    server.terminate()
    try:
        server.wait(timeout=3)
    except subprocess.TimeoutExpired:
        server.kill()

print("UI_SMOKE_PASS")
