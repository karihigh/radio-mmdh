export default class AudioPlayer {
  constructor(radiosData) {
    this.radioAudios = this.initializeAndStartAllRadioAudios(radiosData);
    this.staticAudio = this.initializeAndStartStaticAudio(radiosData);
  }
  
  updateStaticAudioVolume(staticAudioVolume) {
    this.staticAudio.volume = staticAudioVolume;
  }

  updateRadioAudiosVolumes(playingRadioVolume, playingRadioIndex) {
    let radioIndex = 0; 
    for (const radioAudio of this.radioAudios) {
      if (radioIndex === playingRadioIndex) {
        radioAudio.volume = playingRadioVolume;
      } else {
        radioAudio.volume = 0;
      }
      radioIndex += 1;
    }
  }

  // Private methods:

  initializeAndStartAllRadioAudios(radiosData) {
    return radiosData.map((radio) => {
      const completeAudioFilePath = `audios/${radio.id}.mp3`
      const audio = new Audio(completeAudioFilePath);
      audio.volume = 0;
      audio.loop = true;
      audio.play();
      return audio;
    })
  }

  initializeAndStartStaticAudio(radiosData) {
    const staticAudio = new Audio("./audios/static.mp3");
    staticAudio.loop = true;
    staticAudio.play();

    return staticAudio;
  }
}