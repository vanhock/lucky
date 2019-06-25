const puppeteer = require("puppeteer");
const utf8 = require("utf8");
class PuppeteerPlugin {
  apply(registerAction) {
    let browser;
    const config = {
      headless: true,
      defaultViewport: { width: 1280, height: 768 }
    };
    registerAction("beforeStart", async () => {
      browser = await puppeteer.launch(config);
    });

    const scrollFunction = async (
      page,
      scrollDelay,
      scrollValue = 500,
      maxScrollCount = 20
    ) => {
      try {
        let allowScroll = true;
        let scrollCount = 0;
        let currentScroll = 0;
        while (allowScroll && maxScrollCount > scrollCount) {
          await page.evaluate(
            `window.scrollTo(0, window.pageYOffset + ${scrollValue})`
          );
          const newScroll = await page.evaluate("window.pageYOffset");
          allowScroll = await page.evaluate(
            "document.body.scrollHeight !== window.pageYOffset + document.documentElement.clientHeight"
          );
          await page.waitFor(scrollDelay);
          if (scrollCount > 1 && newScroll === currentScroll) {
            break;
          }
          scrollCount++;
        }
      } catch (e) {}
      return page.content();
    };

    registerAction("afterResponse", async ({ response }) => {
      const contentType = response.headers["content-type"];
      const isHtml = contentType && contentType.split(";")[0] === "text/html";
      if (isHtml) {
        const url = response.request.href;
        const page = await browser.newPage();
        await page.goto(url);
        const content = await page.content();
        //const content = await scrollFunction(page, 600);
        await page.close();
        return utf8.encode(content);
      } else {
        return response.body;
      }
    });

    registerAction("afterFinish", () => browser && browser.close());
  }
}

module.exports = PuppeteerPlugin;
