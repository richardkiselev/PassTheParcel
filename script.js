const backgrounds = ["bg1.png", "bg2.png", "bg3.png"];
const randomBackground =
  backgrounds[Math.floor(Math.random() * backgrounds.length)];
let currentBackground = randomBackground;

function setBackground(background) {
  currentBackground = background;
  document.body.style.backgroundImage = `url("./assets/${background}")`;
}

setBackground(currentBackground);

window.addEventListener("message", (event) => {
  const backgroundAppFrame = Array.from(
    document.querySelectorAll(".window iframe"),
  ).find(
    (frame) =>
      frame.title === "Backgrounds" && frame.contentWindow === event.source,
  );

  if (!backgroundAppFrame || !backgrounds.includes(event.data)) return;
  setBackground(event.data);
});

const windowContainer = document.getElementById("windowContainer"); // Grabs window container from index.html

const clock = document.getElementById("clock");

function updateClock() {
  clock.textContent = new Date().toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

updateClock();
setInterval(updateClock, 1000);

let highestZIndex = 1000;
let windowCount = 0;
let malwareWindowTimer = null;

function openApp(name, path) {
  windowCount++;

  const appWindow = document.createElement("div");
  appWindow.className = "window";

  const offset = (windowCount * 30) % 200;

  appWindow.style.left = `calc(50% - 350px + ${offset}px)`;
  appWindow.style.top = `calc(50% - 250px + ${offset}px)`;

  appWindow.style.zIndex = ++highestZIndex;

  appWindow.innerHTML = `
        <div class="window-titlebar">
            <span class="window-title">${name}</span>

            <div class="window-controls">
                <button class="close" title="Close">✕</button>
            </div>
        </div>

        <iframe
            src="${path}"
            title="${name}"
            sandbox="allow-scripts allow-forms allow-same-origin"
        ></iframe>
    `; //Iframe allows me to embed app info inside of the main html page

  windowContainer.appendChild(appWindow);

  const titlebar = appWindow.querySelector(".window-titlebar");
  const closeButton = appWindow.querySelector(".close");
  const appFrame = appWindow.querySelector("iframe");

  if (appFrame.title === "Backgrounds") {
    appFrame.addEventListener("load", () => {
      appFrame.contentWindow.postMessage(currentBackground, "*");
    });
  }

  appWindow.addEventListener("pointerdown", () => {
    highestZIndex++;
    appWindow.style.zIndex = highestZIndex;
  });

  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    appWindow.remove();
  });

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  titlebar.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;

    dragging = true;

    const rect = appWindow.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    titlebar.setPointerCapture(event.pointerId);
  });

  titlebar.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    appWindow.style.left = `${event.clientX - offsetX}px`;
    appWindow.style.top = `${event.clientY - offsetY}px`;
  });

  titlebar.addEventListener("pointerup", () => {
    dragging = false;
  });

  titlebar.addEventListener("pointercancel", () => {
    dragging = false;
  });
}

function openMalwareWindows() {
  if (malwareWindowTimer !== null) return;

  let windowsOpened = 0;
  const openNextWindow = () => {
    openApp("Malware", "./apps/malware.html");
    windowsOpened++;

    if (windowsOpened === 20) {
      clearInterval(malwareWindowTimer);
      malwareWindowTimer = null;
    }
  };

  openNextWindow();
  malwareWindowTimer = setInterval(openNextWindow, 1000);
}
