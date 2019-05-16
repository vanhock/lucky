const currentToken = getToken();
if (currentToken) {
  browser.runtime.sendMessage(JSON.stringify({ token: currentToken }));
}

console.log("AuthScript loaded");
window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source !== window) return;

  if (event.data.authorized) {
    const token = getToken();
    console.log("Authorized message call");
    browser.runtime.sendMessage(JSON.stringify({ token: token }));
  }
});

function getToken() {
  localStorage.getItem("pp-u-t-s") || sessionStorage.getItem("pp-u-t-s");
}
