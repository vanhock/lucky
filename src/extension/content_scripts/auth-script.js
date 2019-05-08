browser.runtime.sendMessage(
  JSON.stringify({ token: localStorage.getItem("user-token") })
);

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source !== window) return;

  if (event.data.token) {
    browser.runtime.sendMessage(JSON.stringify({ token: event.data.token }));
  }
});
