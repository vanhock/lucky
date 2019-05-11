let active = false;
browser.runtime.onMessage.addListener(request => {
  switch (request) {
    case "checkActive":
      browser.runtime.sendMessage(JSON.stringify({ isActive: active }));
      break;
    case "toggleActive":
      active = !active;
  }
});
