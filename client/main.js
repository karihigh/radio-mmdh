import RadiosInteractiveVisualization from "./RadiosInteractiveVisualization.js"
import AudioPlayer from "./AudioPlayer.js"
import Visualization from "./Visualization.js"
import getRadiosDataWithStartingAndEndingProportions from "./getRadiosDataWithStartingAndEndingProportions.js"

const radiosDataJsonFilePath = "radios_data.json"

async function main() {

  const {
    radiosProcessedData, eachRadioSpaceProportion, eachStaticSpaceProportion
  } = await getRadiosDataWithStartingAndEndingProportions(radiosDataJsonFilePath);

  const startButton = document.getElementById("start-button");

  startButton.onclick = () => {
    
    const audioPlayer = new AudioPlayer(radiosProcessedData);
    const visualization = new Visualization(
      radiosProcessedData,
      eachRadioSpaceProportion,
      eachStaticSpaceProportion,
      false,
    );
    
    const interactiveVisualization = new RadiosInteractiveVisualization(
      radiosProcessedData,
      eachRadioSpaceProportion,
      eachStaticSpaceProportion,
      visualization,
      audioPlayer,
    )
      
    const socket = new WebSocket("ws://localhost:8765");
    
    socket.onopen = () => { console.log("Client: socket open") };
    socket.onmessage = (incomingMessage) => {
      const dialProportionNumber = parseFloat(incomingMessage.data);
      interactiveVisualization.updateApplication(dialProportionNumber);
    };

    // Hide button once the it's clicked
    startButton.style.display = "none";
  }    
}

main()
    