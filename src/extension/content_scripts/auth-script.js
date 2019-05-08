browser.runtime.sendMessage(
  JSON.stringify({ token: localStorage.getItem("user-token") })
);
