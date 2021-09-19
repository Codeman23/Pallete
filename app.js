//GLOBAL SELECTIONS AND VARIABLES
const colorItems = document.querySelectorAll(".colors__item");
const generateBtn = document.querySelector(".panel__generateBtn");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".colors__title");
const popup = document.querySelector(".copy");
const popupBox = popup.children[0];
const adjustButton = document.querySelectorAll(".colors__adjust");
const lockButton = document.querySelectorAll(".colors__lock");
const closeAdjustments = document.querySelectorAll(".colors__closeBtn");
const sliderContainers = document.querySelectorAll(".colors__sliders");
let initialColors;
//For local storage
let savedPalettes = [];

//EVENT LISTENERS
generateBtn.addEventListener("click", randomColors);

sliders.forEach( slider => {
    slider.addEventListener("input", hslControls);
});

colorItems.forEach( (item, index) => {
    item.addEventListener("change", () => {
      updateTextUi(index);
    })
});

currentHexes.forEach( hex => {
    hex.addEventListener("click", () => {
        copyToClipboard(hex);
    });
});

popup.addEventListener("transitionend", ()=> {
    setTimeout(() => {
        popup.classList.remove("active");
        popupBox.classList.remove("active");
    }, 300);
});

adjustButton.forEach( (button, index) => {
   button.addEventListener("click", () => {
       openAdjustmentPanel(index);
   });
});

closeAdjustments.forEach( (button, index) => {
    button.addEventListener("click", () => {
        closeAdjustmentPanel(index);
    });
});

lockButton.forEach(  (button, index) => {
    button.addEventListener("click", () => {
        const lockIcon = button.querySelector("svg");
        const lockIconAttr = button.querySelector("svg").getAttribute("data-icon");
        lockIconAttr == "lock" ? lockIcon.setAttribute("data-icon", "lock-open") : lockIcon.setAttribute("data-icon", "lock");
        colorItems[index].classList.toggle("locked");
    });
});

//FUNCTIONS
function generateHex() {
    const hexColor = chroma.random();
    return hexColor;
}

function randomColors() {
    initialColors = [];

    colorItems.forEach( (item, index) => {
        const randomColor = generateHex();
        const hexText = item.children[0];

        //Add color to initialColors
        if(item.classList.contains("locked")) {
            initialColors.push(hexText.innerText);
            return;;
        } else {
            initialColors.push(chroma(randomColor).hex());
        }


        //Add color to bg
        hexText.innerText = randomColor;
        item.style.backgroundColor = randomColor;

        //Check fo contrast
        checkTextContrast(randomColor, hexText);

        //Initial Colorize Sliders
        const color = chroma(randomColor);
        const sliders = item.querySelectorAll(".colors__sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);

    });

    //Resets the inputs
    resetInputs();

    //Check for button contrast
    adjustButton.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockButton[index]);
    })
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    luminance > 0.5 ? text.style.color = "black" : text.style.color = "white";
}

function colorizeSliders(color, hue, brightness, saturation) {

    //Scale saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat =chroma.scale([noSat,color,fullSat]);

    //Scale Brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);


    //Update Input Colors
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, 
    rgba(204,75,75),
    rgba(204,204,75 ), 
    rgba(204,204,75 ),
    rgba(75,204,75 ),
    rgba(75,204,204 ),
    rgba(75,75,204 ),
    rgba(204,75,204 ),
    rgba(204,75,75)
    `;
}

function hslControls(e) {
    const index = e.target.getAttribute("data-bright") ||
                    e.target.getAttribute("data-sat") ||
                    e.target.getAttribute("data-hue");

    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];

    let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

    colorItems[index].style.backgroundColor = color;

    //Colorize inputs/sliders
    colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUi(index) {
    const activeItem = colorItems[index];
    const color = chroma(activeItem.style.backgroundColor);
    const textHex = activeItem.querySelector("h2");
    const icons = activeItem.querySelectorAll('.colors__controls button');

    textHex.innerText = color.hex();
    //Check Contrast
    checkTextContrast(color,textHex);
    for (icon of icons) {
        checkTextContrast(color,icon);
    }
}

function resetInputs() {
    const sliders = document.querySelectorAll(".colors__sliders input");

    sliders.forEach(slider => {
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        } else if (slider.name === "brightness") {
            const brightColor = initialColors[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100;
        } else {
            const satColor = initialColors[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
        }
    })
}

function copyToClipboard(hex) {
    const el = document.createElement("textarea");
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    //Popup animation
    popup.classList.add("active");
    popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove("active");
}

//Implement Save to Palette and Local Storage Stuff =============//
const saveBtn = document.querySelector(".panel__saveBtn");
const submitSave = document.querySelector(".save__submit");
const closeSaveBtn = document.querySelector(".save__closeBtn");
const saveContainer = document.querySelector(".save");
const savePopup = saveContainer.children[0];
const saveInput = document.querySelector(".save__name");

//Event Listeners
saveBtn.addEventListener("click", openPalette);
closeSaveBtn.addEventListener("click", closePalette);

//Functions
function openPalette(e){
    saveContainer.classList.add("active");
    savePopup.classList.add("active");
}

function closePalette(e){
    saveContainer.classList.remove("active");
    savePopup.classList.remove("active");
}

randomColors();