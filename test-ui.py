from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).parent


def require(condition, message):
    if not condition:
        raise AssertionError(message)


handler = partial(SimpleHTTPRequestHandler, directory=ROOT)
server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
Thread(target=server.serve_forever, daemon=True).start()

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.set_default_timeout(5000)
        errors = []
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.goto(f"http://127.0.0.1:{server.server_port}", wait_until="domcontentloaded")
        page.locator("#feet").wait_for()

        for people in (1, 20):
            for style in ("cozy", "comfortable", "sprawled"):
                for gear in (False, True):
                    page.locator("#people").fill(str(people))
                    page.locator(f"label[for='{style}']").click()
                    if page.locator("#gear").is_checked() != gear:
                        page.locator(".switch").click()
                    require(page.locator(".person").count() == people, "person icons do not match the input")
                    require(page.locator("#bag").evaluate("node => node.hidden") == (not gear), "cooler diagram state is wrong")
                    require("ft" in page.locator("#feet").inner_text(), "feet output is absent")
                    require("m" in page.locator("#meters").inner_text(), "metres output is absent")
                    require(str(people) in page.locator("#plan-details").inner_text(), "live plan summary is absent")
                    require("Closest common choice" in page.locator("#shop-tip").inner_text(), "shopping guidance is absent")

        page.locator("#people").fill("0")
        require(page.locator("#people").input_value() == "1", "lower limit is not enforced")
        page.locator("#people").fill("25")
        require(page.locator("#people").input_value() == "20", "upper limit is not enforced")
        page.locator("[data-step='-1']").click()
        require(page.locator("#people").input_value() == "19", "decrement button is not live")
        page.locator("[data-step='1']").click()
        require(page.locator("#people").input_value() == "20", "increment button is not live")
        page.locator("#copy-plan").click()
        require(page.locator("#copy-status").inner_text(), "copy feedback is absent")
        require(not errors, f"browser console errors: {errors}")
        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        mobile.goto(f"http://127.0.0.1:{server.server_port}", wait_until="domcontentloaded")
        mobile.locator("#people").wait_for()
        require(mobile.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), "mobile layout overflows horizontally")
        mobile.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()

print("UI interaction tests passed")
