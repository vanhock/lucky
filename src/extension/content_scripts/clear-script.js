clear();
document.addEventListener("DOMContentLoaded", clear);
function clear() {
  console.log("Now we are going to clear this document");
  document.body.innerHTML = "";
  document.head.querySelectorAll("*:not(title)").forEach(item => document.head.removeChild(item));
}
