console.log("AuthScript loaded");
const port = browser.runtime.connect({ name: "auth" });

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
  } else {
    console.log("Token not found in local storage!");
  }
}
