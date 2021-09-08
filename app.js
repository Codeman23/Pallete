//Global selections and variables
const colorDivs = document.querySelectorAll(".colors__item");
const sliders = document.querySelectorAll('input[type="range"]');

//Eventlisteners
sliders.forEach( slider => {
    slider.addEventListener("input", hslControls);
});

//Functions
function generateHex() {
    const hexColor = chroma.random();
    return hexColor;
}

function randomColors() {
    colorDivs.forEach( (div, index) => {
        const randomColor = generateHex();
        const hexText = div.children[0];

        //Add colorto the bg
        hexText.innerText = randomColor;
        div.style.backgroundColor = randomColor;

        //Check fo contrast
        checkTextContrast(randomColor, hexText);

        //Initial Colorize Sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".colors__sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);

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

    const bgColor = colorDivs[index].querySelector("h2").innerText;
    let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

    colorDivs[index].style.backgroundColor = color;
}

randomColors();