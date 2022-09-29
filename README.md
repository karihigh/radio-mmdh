# Radios - MMDH

**Contribuidores/contributors**: @agustinkrebs, @nebil
## Documentación en español:

### Introducción
Texto

### Componentes principales
Texto

### Carpetas y archivos
#### `client/audios/`
Carpeta con todos los audios, tanto los de las radios como el de estática

#### `client/d3-package/`
Carpeta con el código fuente de la librería d3, en su versión 7.6.1.
La última versión se puede descargar en https://d3js.org/.

#### `client/fonts/`
Carpeta con todos los archivos `.ttf` de las fuentes de texto utilizadas en la
visualización.

#### `client/radios_data.csv`
Archivo con la metadata de las radios. En particular, contiene los textos que serán
utilizados para rellenar la visualización.

#### `client/csv_to_json_converter.py`
Archivo de python encargado de convertir la metadata de las radios (presente en
`radios_data.csv`) a un formato JSON (`radios_data.json`). Este archivo luego se utiliza
como información de input para la visualización.

#### `client/radios_data.json`
Archivo con la metadata de `radios_data.csv` pero en formato JSON (output de
`csv_to_json_converter.py`).

#### `client/RadiosInteractiveVisualization.js`
Archivo en donde se encuentra la clase principal asociada al código del cliente. Su
misión es orquestrar los métodos de la visualización y del reproductor de audio, así
como computar las métricas que estos necesiten como input.

#### `client/Visualization.js`
Archivo en donde se encuentra la clase que maneja todo lo asociado a la visualización.
Inicializa los elementos en pantalla al ser instanciada, y expone métodos para
actualizarlos.

#### `client/AudioPlayer.js`
Archivo en donde se encuentra la clase que maneja todo lo asociado a la reproducción de
audios mp3. Inicializa los audios de cada radio y estática, y expone métodos para
actualizar sus volúmenes.

#### `client/getRadiosDataWithStartingAndEndingProportions.js`
Archivo en donde se encuentra una función para agregarle los atributos
`startingDialProportion` y `endingDialProportion` a cada objeto del archivo
`radios_data.json`.

#### `client/main.js`
Archivo de punto de entrada a toda la lógica de la visualización. En particular:
1. Instancia las clases y llama a las funciones recién mencionadas.
2. Instancia el websocket del cliente.
3. Agrega event listeners al websocket. En particular, asocia el evento de nuevo mensaje
al método principal de `RadiosInteractiveVisualization` para así actualizar toda la
visualización y audios a la nueva posición en el rango.

#### `client/index.html`
Archivo en donde se encuentra el código de HTML de la visualización. Contiene meramente
configuración y tags fijos/principales. El resto de los elementos son creados de manera
dinámica al inicializar la clase `Visualization`. 

#### `client/font-styles.css`
Archivo que agrega disponibiliza las fonts ubicadas en `fonts/` para poder ser
referenciadas desde el código de la visualización.

#### `client/dial.png`
Imagen de fondo para el dial.

#### `server/potentiometer_reader.py`
Archivo que contiene la función asíncrona que lee las señales del potenciómetro, las
normaliza al rango [0, 1], y las envía a través del websocket al cliente.

#### `server/potentiometer_reader_simulation.py`
Archivo que simula la función anterior enviando números ficticios en el rango [0, 1].
Esto es conveniente para poder debuggear la aplicación sin necesidad del potenciómetro.

#### `server/websocket_server.py`
Archivo que inicializa el websocket y lo conecta a una de las dos funciones anteriores
para enviar números al cliente.

### Librerías requeridas

### Comandos necesarios
Start potentiometer reader and websocket server:
```
cd server
python3 websocket_server.py
```
Convert csv data to JSON:
```
cd client
python3 csv_to_json_converter.py
```

Start visualization through python:
```
python3 -m http.server
```
