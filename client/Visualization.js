// FIXED SPACING VARIABLES
const CANVAS_WIDTH = 2160
const CANVAS_HEIGHT = 3840
const INFORMATION_CONTAINER_WIDTH = 1225 // tablet
const INFORMATION_CONTAINER_HEIGHT = 1530 // tablet
const INFORMATION_CONTAINER_Y = 790
const RADIO_CARDS_GROUP_Y = 250
const RADIO_CARDS_SEPARATION = 100
const RADIO_CARD_WIDTH = 600
const RADIO_CARD_HEIGHT = 645
const RADIO_CARD_PADDING = 52
const DIAL_GROUP_Y = 3450
const DIAL_IMAGE_WIDTH_HEIGHT_PROPORTION = 6122 / 1005 // (width / height), in pixels
const DIAL_IMAGE_WIDTH_PADDING_PROPORTION = 6122 / 129 // (width / padding), in pixels
const DIAL_WIDTH = 2000
const DIAL_NEEDLE_WIDTH = 5
const INDEX_X = 600
const INDEX_Y = 1200
const SCALE_PONDERATOR = 1.0

// COMPUTED SPACING VARIABLES
const INFORMATION_CONTAINER_X = (CANVAS_WIDTH - INFORMATION_CONTAINER_WIDTH) / 2
const ADJUSTED_RADIO_CARDS_SEPARATION = RADIO_CARDS_SEPARATION + 2 * RADIO_CARD_PADDING
const ADJUSTED_RADIO_CARD_WIDTH = RADIO_CARD_WIDTH - 2 * RADIO_CARD_PADDING
const ADJUSTED_RADIO_CARD_HEIGHT = RADIO_CARD_HEIGHT - 2 * RADIO_CARD_PADDING
const DIAL_HEIGHT = DIAL_WIDTH / DIAL_IMAGE_WIDTH_HEIGHT_PROPORTION
const DIAL_PADDING = DIAL_WIDTH / DIAL_IMAGE_WIDTH_PADDING_PROPORTION
const DIAL_NEEDLE_HEIGHT = DIAL_HEIGHT
const DIAL_GROUP_X = (CANVAS_WIDTH - DIAL_WIDTH) / 2
const POINTER_Y = (DIAL_HEIGHT - DIAL_NEEDLE_HEIGHT) / 2
const DIAL_MOVING_SPACE = DIAL_WIDTH - (2 * DIAL_PADDING)
const CARDS_INITIAL_X = (INFORMATION_CONTAINER_WIDTH / 2) + (RADIO_CARDS_SEPARATION / 2)
const CARDS_FULL_TRANSLATION_STEP = ADJUSTED_RADIO_CARDS_SEPARATION + ADJUSTED_RADIO_CARD_WIDTH

// STYLE VARIABLES
const CANVAS_COLOR = "#00000"
const INFORMATION_CONTAINER_COLOR = "#CDD3D7"
const CARDS_BACKGROUND_COLOR = "#4B4E50"
const CARDS_TEXT_COLOR = "#EFF1F2"
const CANVAS_TEXT_COLOR = CARDS_BACKGROUND_COLOR


export default class Visualization {
  constructor(
    radiosData,
    eachRadioSpaceProportion,
    eachStaticSpaceProportion,
    showDialRadiosBoundaries = false,
  ) {
    this.radiosData = radiosData;
    this.eachRadioSpaceProportion = eachRadioSpaceProportion;
    this.eachStaticSpaceProportion = eachStaticSpaceProportion;

    this.mainSvg = this.initializeMainSvg();
    this.initializeInformationContainer();
    this.radioCardsContainer = this.initializeRadioCardsContainer();
    this.radioCards = this.initializeRadioCards();
    this.radiosIndexContainer = this.initializeRadiosIndexContainer();
    this.dialGroup = this.initializeDialGroup();
    this.initializeRadiosIndexUnorderedList();
    if (showDialRadiosBoundaries) {
      this.initializeDialRadiosBoundaries();
    }
    this.dialNeedle = this.initializeDialNeedle();
  }

  updateDialNeedlePosition(dialProportion) {
    this.dialNeedle.attr("x", dialProportion * DIAL_MOVING_SPACE + DIAL_PADDING - (DIAL_NEEDLE_WIDTH / 2));
  }

  updateRadioCardsPositions(xPositionTranslationSteps) {
    this.radioCards
      .data(this.radiosData)
      .join("div")
      .style("left", (_, i) => CARDS_INITIAL_X + i * (ADJUSTED_RADIO_CARD_WIDTH + ADJUSTED_RADIO_CARDS_SEPARATION) - CARDS_FULL_TRANSLATION_STEP * (xPositionTranslationSteps))
  }

  // Private methods:

  initializeMainSvg() {
    const mainSvg = d3.select("#main-svg");

    mainSvg
      .attr("width", CANVAS_WIDTH)
      .attr("height", CANVAS_HEIGHT);
      
    mainSvg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", CANVAS_COLOR);
    
    return mainSvg;
  }

  initializeInformationContainer() {
    const informationContainer = d3.select("#information-container");

    informationContainer
      .style("position", "absolute")
      .style("width", INFORMATION_CONTAINER_WIDTH)
      .style("height", INFORMATION_CONTAINER_HEIGHT)
      .style("left", INFORMATION_CONTAINER_X)
      .style("top", INFORMATION_CONTAINER_Y)
      .style("background-color", INFORMATION_CONTAINER_COLOR)
      .style("overflow", "hidden");
  }

  initializeRadioCardsContainer() {
    const radioCardsContainer = d3.select("#radio-cards-container");

    radioCardsContainer
      .style("position", "absolute")
      .style("width", CANVAS_WIDTH)
      .style("height", RADIO_CARD_HEIGHT)
      .style("top", RADIO_CARDS_GROUP_Y)
      // .style("overflow", "hidden");
    
    return radioCardsContainer;
  }

  initializeRadioCards() {
    const radioCards = this.radioCardsContainer
      .selectAll("div")
      .data(this.radiosData)
      .join("div")
      .style("position", "absolute")
      .style("width", ADJUSTED_RADIO_CARD_WIDTH)
      .style("height", ADJUSTED_RADIO_CARD_HEIGHT)
      .style("left", (_, i) => CARDS_INITIAL_X + i * (ADJUSTED_RADIO_CARD_WIDTH + ADJUSTED_RADIO_CARDS_SEPARATION))
      .style("background-color", CARDS_BACKGROUND_COLOR)
      .style("padding", RADIO_CARD_PADDING)

    radioCards
      .append("p")
      .text((radioData) => radioData.name)
      .style("color", CARDS_TEXT_COLOR)
      .style("font-family", "gt-pressura-bold")
      .style("font-size", "36")
      .style("margin", "0")

    radioCards
      .append("p")
      .text((radioData) => radioData.subtitle)
      .style("color", CARDS_TEXT_COLOR)
      .style("font-family", "gt-pressura-regular-italic")
      .style("font-size", "24")
      .style("margin", "0")

    radioCards
      .append("p")
      .text((radioData) => radioData.description)
      .style("color", CARDS_TEXT_COLOR)
      .style("font-family", "gt-pressura-light")
      .style("font-size", "16")
      .style("margin", "0")
    
    return radioCards;
  }

  initializeRadiosIndexContainer() {
    // const radiosIndexContainer = d3.select("#radios-index-container");

    // radiosIndexContainer
    //   .style("position", "absolute")
    //   // .style("width", CANVAS_WIDTH)
    //   // .style("height", ADJUSTED_RADIO_CARD_HEIGHT)
    //   .style("left", INDEX_X)
    //   .style("top", INDEX_Y)

    // radiosIndexContainer
    //   .append("p")
    //   .text("Introducción al index")
    //   .style("color", CANVAS_TEXT_COLOR);
    
    // return radiosIndexContainer;
  }

  initializeRadiosIndexUnorderedList() {
    // const radiosIndexUnorderedList = this.radiosIndexContainer
    //   .append("ul")

    // radiosIndexUnorderedList
    //   .selectAll("li")
    //   .data(this.radiosData)
    //   .join("li")
    //   .text((radioData) => radioData.name)
    //   .style("color", CANVAS_TEXT_COLOR)
  }

  initializeDialGroup() {
    const dialGroup = this.mainSvg
      .append("g")
      .attr("transform", `translate(${DIAL_GROUP_X} ${DIAL_GROUP_Y})`);

    dialGroup
      .append('image')
      .attr('xlink:href', 'dial.png')
      .attr('height', DIAL_HEIGHT)
      .attr('width', DIAL_WIDTH)
    
    return dialGroup;
  }

  initializeDialRadiosBoundaries() {
    this.radiosData.forEach((radioData, radioIndex) => {
      if (radioIndex === 0) {
        this.dialGroup
          .append("rect")
          .attr("x", DIAL_PADDING)
          .attr("y", 0)
          .attr("width", (this.eachStaticSpaceProportion / 2) * DIAL_MOVING_SPACE)
          .attr("height", DIAL_HEIGHT)
          .attr("fill", "#0000FF3D");

        this.dialGroup
          .append("rect")
          .attr("x", radioData.endingDialProportion * DIAL_MOVING_SPACE + DIAL_PADDING)
          .attr("y", 0)
          .attr("width", this.eachStaticSpaceProportion * DIAL_MOVING_SPACE)
          .attr("height", DIAL_HEIGHT)
          .attr("fill", "#0000FF3D");
      } else if (radioIndex === this.radiosData.length - 1) {
        console.log()
        this.dialGroup
          .append("rect")
          .attr("x", DIAL_MOVING_SPACE)
          .attr("y", 0)
          .attr("width", (this.eachStaticSpaceProportion / 2) * DIAL_MOVING_SPACE)
          .attr("height", DIAL_HEIGHT)
          .attr("fill", "#0000FF3D");
      } else {
        this.dialGroup
          .append("rect")
          .attr("x", radioData.endingDialProportion * DIAL_MOVING_SPACE + DIAL_PADDING)
          .attr("y", 0)
          .attr("width", this.eachStaticSpaceProportion * DIAL_MOVING_SPACE)
          .attr("height", DIAL_HEIGHT)
          .attr("fill", "#0000FF3D");
      }
      this.dialGroup
        .append("rect")
        .attr("x", radioData.startingDialProportion * DIAL_MOVING_SPACE + DIAL_PADDING)
        .attr("y", 0)
        .attr("width", this.eachRadioSpaceProportion * DIAL_MOVING_SPACE)
        .attr("height", DIAL_HEIGHT)
        .attr("fill", "#FF000037");
    })
  }

  initializeDialNeedle() {
    const dialNeedle = this.dialGroup.append("rect")
      .attr("width", DIAL_NEEDLE_WIDTH)
      .attr("height", DIAL_NEEDLE_HEIGHT)
      .attr("y", POINTER_Y)
      .attr("fill", "red");
    
    return dialNeedle;
  }
}
