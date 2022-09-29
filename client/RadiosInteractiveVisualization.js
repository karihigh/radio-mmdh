export default class RadiosInteractiveVisualization {
  constructor(
    radiosData,
    eachRadioSpaceProportion,
    eachStaticSpaceProportion,
    visualization,
    audioPlayer,
  ) {
    this.radios = radiosData;
    this.eachRadioSpaceProportion = eachRadioSpaceProportion;
    this.eachStaticSpaceProportion = eachStaticSpaceProportion;
    this.visualization = visualization;
    this.audioPlayer = audioPlayer;
  }

  updateApplication(newDialProportion) {
    this.visualization.updateDialNeedlePosition(newDialProportion);
    this.updateRadios(newDialProportion)
  }

  // Private methods:

  updateRadios(newDialProportion) {
    // Update the position of the radio cards
    const xPositionTranslationSteps = this.softStepFunction(newDialProportion);
    this.visualization.updateRadioCardsPositions(xPositionTranslationSteps);

    // Update all audios volumes
    const { staticAudioVolume, playingRadioVolume, playingRadioIndex } = this.computeAllAudiosVolumes(newDialProportion)
    this.audioPlayer.updateStaticAudioVolume(staticAudioVolume);
    this.audioPlayer.updateRadioAudiosVolumes(playingRadioVolume, playingRadioIndex);
  }

  softStepFunction(newDialProportion) {
    const transposedNewDialProportion = newDialProportion + (this.eachStaticSpaceProportion / 2)
    const xPositionTranslationSteps = this.transposedSoftStepFunction(transposedNewDialProportion) - 0.5
    return xPositionTranslationSteps;
  }

  transposedSoftStepFunction(transposedNewDialProportion) {
    let inBetweenProportion;
    const cycleLength = this.eachStaticSpaceProportion + this.eachRadioSpaceProportion
    const cycleIndex = Math.floor((transposedNewDialProportion + this.eachRadioSpaceProportion) / cycleLength)
    const remainder = transposedNewDialProportion % cycleLength
    if (remainder < this.eachStaticSpaceProportion) {
      inBetweenProportion = remainder / this.eachStaticSpaceProportion;
    } else {
      inBetweenProportion = 0
    }
    return cycleIndex + inBetweenProportion
  }

  computeAllAudiosVolumes(newDialProportion) {
    const playingRadioIndex = this.getPlayingRadioIndex(newDialProportion);
    const staticAudioVolume = this.getStaticAudioVolume(newDialProportion);

    const playingRadioVolume = 1 - staticAudioVolume;

    return { staticAudioVolume, playingRadioVolume, playingRadioIndex }
  }

  getPlayingRadioIndex(newDialProportion) {
    const halfRadiosSeparationProportion = this.eachStaticSpaceProportion / 2
    let playingRadioIndex;
    let radioIndex = 0;
    for (const radio of this.radios) {
      const playingLowerBound = radio.startingDialProportion - halfRadiosSeparationProportion
      const playingUpperBound = radio.endingDialProportion + halfRadiosSeparationProportion
      if (playingLowerBound < newDialProportion && newDialProportion < playingUpperBound) {
        playingRadioIndex = radioIndex;
        break
      } 
      radioIndex += 1;
    }

    return playingRadioIndex
  }

  getStaticAudioVolume(newDialProportion) {
    let staticAudioVolume;
    const cycleLength = this.eachStaticSpaceProportion + this.eachRadioSpaceProportion
    const remainder = newDialProportion % cycleLength
    const halfRadiosSeparationProportion = this.eachStaticSpaceProportion / 2
    if (0 < remainder && remainder <= halfRadiosSeparationProportion) {
      staticAudioVolume = (halfRadiosSeparationProportion - remainder) / halfRadiosSeparationProportion
    } else if (halfRadiosSeparationProportion < remainder && remainder <= (halfRadiosSeparationProportion + this.eachRadioSpaceProportion)) {
      staticAudioVolume = 0;
    } else {
      staticAudioVolume = (remainder - (halfRadiosSeparationProportion + this.eachRadioSpaceProportion)) / halfRadiosSeparationProportion
    }

    return staticAudioVolume;
  }
}
