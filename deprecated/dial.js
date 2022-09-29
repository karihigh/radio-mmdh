const svg = d3.select("#main-svg");

console.log("hola");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const playAudio = (audioFileName) => {
  const completeAudioFilePath = `audios/${audioFileName}`
  console.log("gonna play ", completeAudioFilePath);
  const audio = new Audio(completeAudioFilePath);
  audio.play();
  // let audio2 = new Audio('02.mp3');
  // console.log("starting to reproduce audio1")
  // audio1.play();
  // await sleep(1000);
  // console.log("starting to reproduce audio2")
  // audio2.play();
}

// playAudios();

// FIXED
CANVAS_WIDTH = 600
CANVAS_HEIGHT = 1000
INFORMATION_WIDTH = 600
INFORMATION_HEIGHT = 700
DIAL_WIDTH = 500
DIAL_HEIGHT = 120
RECT_WIDTH = 10
RECT_HEIGHT = 60

// COMPUTED
INFORMATION_X = (CANVAS_WIDTH - INFORMATION_WIDTH) / 2
INFORMATION_Y = 50
DIAL_X = (CANVAS_WIDTH - DIAL_WIDTH) / 2
DIAL_Y = (CANVAS_HEIGHT - DIAL_HEIGHT) / 2 + 400
POINTER_Y = (DIAL_HEIGHT - RECT_HEIGHT) / 2
DIAL_MOVING_SPACE = DIAL_WIDTH - RECT_WIDTH


// const handleSerialCommunication = async () => {
//   document.querySelector('button').addEventListener('click', async () => {
//     // Prompt user to select any serial port.
//     const port = await navigator.serial.requestPort();
//   });
//   const ports = await navigator.serial.getPorts()
//   console.log(ports);
// }

// if ("serial" in navigator) {
//   console.log("we have serial communication");
//   handleSerialCommunication();
// } else {
//   console.log("we don't have serial communication");
// }

// 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

// const datos = [150, 256, 130, 0, 23, 422, 235];

// const metadataReader = async () => {
//   const text = await fetch("Proyecto MMDH fake data - Hoja 1.json")
//   console.log(text);
// }

// const metadataReader = async () => {
//   const metadata = await d3.json("metadata.json");
//   return metadata
// }
// const metadata = metadataReader().then(metadata => metadata);
// console.log(metadata);


d3.json("metadata.json").then((radios) => {

  console.log(radios);

  let currentRadioIndex = 0;
  // let previousRadio = null;
  // let nextRadio = metadata.length > 1 ? metadata[1] : null;

  svg
    .attr("width", CANVAS_WIDTH)
    .attr("height", CANVAS_HEIGHT);
    
  // Append pink rect just to see the bounds of the svg
  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "pink");
  
  // Information group
  const informationGroup = svg
    .append("g")
    .attr("transform", `translate(${INFORMATION_X} ${INFORMATION_Y})`);
  
  // Append pink rect just to see the bounds of the svg
  const textBackgroundRect = informationGroup.append("rect")
    .attr("width", INFORMATION_WIDTH)
    .attr("height", INFORMATION_HEIGHT)
    .attr("fill", "white");
  
  // informationGroup.append("text")
  //   .value("Hola")

  // Dial group
  const dialGroup = svg
    .append("g")
    .attr("transform", `translate(${DIAL_X} ${DIAL_Y})`);
  
  dialGroup.append("rect")
    .attr("width", DIAL_WIDTH)
    .attr("height", DIAL_HEIGHT)
    .attr("fill", "yellow");

  const movingPointer = dialGroup.append("rect")
    .attr("width", RECT_WIDTH)
    .attr("height", RECT_HEIGHT)
    .attr("y", POINTER_Y)
    .attr("fill", "red");

  const updateDialPosition = (dialProportion) => {
    // movingPointer.transition().duration(40).attr("x", dialProportion * DIAL_MOVING_SPACE);
    movingPointer.attr("x", dialProportion * DIAL_MOVING_SPACE);
  };

  const changeRadioIfNecessary = (dialProportion) => {
    let newRadioIndex = currentRadioIndex;
    const biggerThanCurrentRadioUpperLimit = dialProportion > radios[currentRadioIndex].endingDialProportion;
    const areRemainingNextRadios = currentRadioIndex < radios.length - 1
    const biggerThanNextRadioLowerLimit = areRemainingNextRadios && dialProportion > radios[currentRadioIndex + 1].startingDialProportion
    const lowerThanCurrentRadioLowerLimit = dialProportion < radios[currentRadioIndex].startingDialProportion;
    const areRemainingPreviousRadios = currentRadioIndex > 0
    const lowerThanPreviousRadioUpperLimit = areRemainingPreviousRadios && dialProportion < radios[currentRadioIndex - 1].endingDialProportion
    if (biggerThanCurrentRadioUpperLimit) {
      console.log("bigger than current radio");
      textBackgroundRect.attr("fill", "white");
      if (biggerThanNextRadioLowerLimit) {
        console.log("started next radio");
        newRadioIndex = currentRadioIndex + 1
      }
    } else if (lowerThanCurrentRadioLowerLimit) {
      console.log("lower than current radio");
      textBackgroundRect.attr("fill", "white");
      if (lowerThanPreviousRadioUpperLimit) {
        console.log("started previous radio");
        newRadioIndex = currentRadioIndex - 1
      }
    }

    if (newRadioIndex != currentRadioIndex) {
      currentRadioIndex = newRadioIndex
      textBackgroundRect
        .attr("fill", radios[currentRadioIndex].color);
      playAudio(radios[currentRadioIndex].audioFileName)
    }
  }

  // Simulate user input
  // setInterval(() => {
  //   console.log("gonna move it")
  //   const randomNumber = Math.random();
  //   const randomXPosition = randomNumber * DIAL_WIDTH
  //   updateCurrentFrequency(randomXPosition)
  // }, 5000)

  // svg.on("mousemove", (e) => {
  //   const { x } = e;
  //   movingPointer.attr("x", x);
  // })


  // svg
  //   .selectAll("rect")
  //   .data(datos)
  //   .enter()
  //   .append("rect")
  //   .attr("width", 50)
  //   .attr("fill", "magenta")
  //   .attr("height", (d) => d)
  //   .attr("x", (_, i) => 50 + i * 100);

  const socket = new WebSocket("ws://localhost:8765");

  function openSocket() {
    console.log("Socket open");
    // socket.send("Hello server");
  }
  
  function showData(result) {
    const dialProportionNumber = parseFloat(result.data)
    // console.log(randomNumber)
    // const randomXPosition = randomNumber * DIAL_MOVING_SPACE
    updateDialPosition(dialProportionNumber);
    changeRadioIfNecessary(dialProportionNumber);
  }

  socket.onopen = openSocket;
  socket.onmessage = showData;
});
