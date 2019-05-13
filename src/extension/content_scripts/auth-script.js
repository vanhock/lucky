const currentToken =
  localStorage.getItem("pp-u-t-s") || sessionStorage.getItem("pp-u-t-s");
if (currentToken) {
  browser.runtime.sendMessage(JSON.stringify({ token: currentToken }));
}

console.log("AuthScript loaded");
window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source !== window) return;

  if (event.data.authorized) {
    browser.runtime.sendMessage(
      JSON.stringify({ token: event.data.authorized })
    );
  }
});
