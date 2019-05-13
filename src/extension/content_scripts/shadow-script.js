console.log("this is a shadow script");
window.perfectPixelInspectorActive = false;
browser.runtime.onMessage.addListener(request => {
  const data = request && JSON.parse(request);
  const name = Object.keys(data)[0];
  if (!data || !name) {
    return;
  }
  switch (name) {
    case "checkActive":
      browser.runtime.sendMessage(
        JSON.stringify({
          isActive: window.perfectPixelInspectorActive || false
        })
      );
      break;
    case "reloadPage":
      window.perfectPixelInspectorActive = false;
      location.reload();
  }
});
