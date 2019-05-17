console.log("AuthScript loaded");
const port = browser.runtime.connect({ name: "auth" });

port.onMessage.addListener(response => {
  if (Object.keys(response)[0] === "getToken") {
    getToken();
  }
});

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source !== window) return;
  if (event.data.authorized) {
    getToken();
  }
});

function getToken() {
  const token = localStorage.getItem("pp-u-t-s");
  if (token) {
    port.postMessage({ token: token });
  }
}
