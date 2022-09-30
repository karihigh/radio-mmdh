# Radios - MMDH

**Contribuidores/contributors**: @agustinkrebs, @karihigh, @nebil
## Documentación en español:
### Introducción
Esta aplicación emula el funcionamiento de una radio antigua. Además de reproducir audios, la visualización muestra en pantalla información contextual de la emisora que está siendo reproducida.

En particular, el código de este repositorio se encarga de leer la señal de un potenciómetro físico (la "perilla" de la radio), generar y actualizar la visualización en pantalla, y reproducir los audios asociados a cada radio.

### Componentes principales y diseño general

#### Cliente y servidor
El código de este repositorio se basa en dos componentes principales: el cliente y el servidor. El servidor es quien lee la señal emitida por el potenciómetro, la procesa, y la envía a través de un websocket al cliente. Por otro lado, el cliente se encarga de recibir esa señal (o mejor dicho, un número decimal entre 0 y 1) y actualiza toda la visualización y sonido en consecuencia.

#### El dial
La base para la modelación abstracta de este proyecto es el dial. Se puede pensar en este como una recta númerica entre 0 y 1 sobre la cual la aguja de la radio se mueve. Esto se puede ver reflejado en la siguiente figura:

![Figura 1](https://github.com/karihigh/radio-mmdh/blob/main/documentation-images/Figure%201.png)

De la imagen también se puede desprender que existen dos tipos de "zonas" dentro de la
recta: radios y estática. Cuando la aguja se encuentra en una zona de radio, en pantalla se mostrará la información de esa radio en el centro, y se escuchará solamente su audio. Por el contrario, cuando la aguja está en las zonas de estática, las tarjetas con información se estarán desplazándo horizontalmente (transicionando entre tarjetas vecinas) y se esuchará un ruido de estática junto al audio de una de las dos radios vecinas con un volumen disminuido (dependiendo de la posición específica de la aguja en esta zona).

Por otro lado, la distribución espacial de las radios en esta recta númerica depende de dos parámetros principales:

- `RADIOS_STATIC_SPACE_PROPORTION`: el _ratio_ entre el el espacio de las radios y el espacio de las zonas de estática (en términos de la figura, la cantidad: `b / a`). Esta constante está definida al inicio del archivo `client/getRadiosDataWithStartingAndEndingProportions.js`.
- `radiosAmount`: la cantidad de radios en la visualización. Esta no es una variable definida explícitamente, sino una que se calcula al momento de leer el archivo de metadata (explicado en la sección _Carpetas y archivos_).

Con estas dos variables, se puede computar cuánto espacio ocupará cada zona de estática y cada radio (`eachStaticSpaceProportion` y `eachRadioSpaceProportion` respectivamente, o bien, `a` y `b` en la figura). Estos números también son computados en `client/getRadiosDataWithStartingAndEndingProportions.js` y son retornados para ser ocupados por el resto del código del cliente. Finalmente estos dos números permiten computar las posiciones de inicio (`startingDialProportion`) y término (`endingDialProportion`) de cada radio.

#### Audios

Esta visualización interactiva funciona con n + 1 audios, en donde n es la cantidad de radios (el + 1 proviene del audio de estática). Cada audio a reproducir debe estar guardado en formato .mp3 en la carpeta `client/audios/`, con nombres de archivo correspondientes al identificador de cada radio en el archivo de metadata.

Por otro lado, la reproducción de audios también tiene una correspondencia directa con la posición de la aguja y el espaciado recién descrito. En la siguiente figura se puede observar cómo varían los volúmenes de cada radio en función de la posición de la aguja:

![Figura 2](https://github.com/karihigh/radio-mmdh/blob/main/documentation-images/Figure%202.png)

En colores se muestran los volúmenes de las distintas radios (en donde 0 es totalmente en silencio, y 1 es su máximo volumen), y en negro el volumen del canal del audio de estática. Con esto, queda en evidencia cómo se entremezclan estos canales de sonido en zonas de estática, y cómo se escucha el sonido de una sola radio en las zonas de radio.

Por último, la reproducción de audios se apoya fuertemente en la interfaz `HTMLAudioElement` del navegador, la cual es manipulada programáticamente a través del constructor `Audio()`. Esta permite: reproducir audios a partir de archivos .mp3, setear volúmenes, y reproducir los audios en loop. Respecto a esto último (y dado que este proyecto intenta emular el funcionamiento de una radio real), cada audio comienza a reproducirse apenas se inicializa la visualización, y se volverán a reproducir _ad infinitum_ cada vez que terminen. Así, al transicionar de la zona de una radio a otra, lo único que se altera son los volúmenes, sin la necesidad de pausar ni comenzar a reproducir ningun audio nuevamente. El audio de estática también se reproduce en loop.

#### Visualización
La parte encargada de desplegar elementos visuales en pantalla (es decir, la visualización propiamente tal) se apoya fuertemente en la librería `d3`. A partir de los métodos de esta es que se modifican los elementos del DOM.

Una parte bastante específica (pero necesaria de explicar) del funcionamiento de la visualización es la posición dinámica de las tarjetas de las radios. La siguiente figura ilustra la función de la cantidad de "pasos" de movimiento horizontal en base a la posición de la aguja (denominada arbitrariamente como _soft step function_):

![Figura 3](https://github.com/karihigh/radio-mmdh/blob/main/documentation-images/Figure%203.png)

En estos términos, un "paso" es la distancia que se deben mover horizontalmente las tarjetas para pasar de una tarjeta en el medio a la siguiente. La equivalencia en pixeles de un "paso" es calculada en la visualización a partir del ancho de la tarjeta y de la separación entre ellas.

Como se observa en la figura, mientras la aguja está en una zona de radio, la posición de las tarjetas queda fija, mientra que al encontrarse en zonas de estática, las tarjetas se mueven para transicionar a su vecina.

Ahora bien, implementar directamente esta función en código era una tarea difícil (principalmente debido al inicio de `a / 2` en el eje horizontal), por lo que se optó por implementar la función trasladada en `a / 2` en el eje x, y `0.5` en el eje y (moviendo el "ciclo de repetición" al origen, lo cual era más fácil de implementar). Esta función trasladada se puede observar en la siguiente figura en color verde:

![Figura 4](https://github.com/karihigh/radio-mmdh/blob/main/documentation-images/Figure%204.png)

Así, la cantidad de pasos de traslación se calcula ocupando la función `softStepFunction`, quien a su vez ocupa internamente la función `transposedSoftStepFunction`.

#### Lectura y procesamiento del potenciómetro
Para leer del potenciómetro, se ocuparon diversas librerías externas (las cuales se pueden encontrar en el archivo `server/potentiometer_reader.py`). Lo importante a mencionar es lo siguiente: la señal emitida por el potenciómetro es ruidosa. Ante eso, se utilizaron dos aproximaciones de software para lidiar con este problema:
- Media móvil (opción recomendada): se calcula el promedio de las últimas n lecturas y ese es el número que se envía. El _trade-off_ acá tiene que ver con la "suavidad" de la lectura procesada vs. la velocidad de "respuesta". Entre mayor sea el n, más suave será, pero más lenta la velocidad de respuesta.
- Tolerancia: se envía un nuevo número solo si el nuevo dato tiene una diferencia mayor (con respecto a la lectura anterior) que una variable de tolerancia. Entre mayor es la tolerancia, más estable es la señal emitida, pero también más "escalonada" se vuelve.

Cual sea el caso que se elija, el valor de la lectura original debe mapearse al rango [0, 1], en donde en el 0 queda el valor menor del potenciómetro, y en 1 su valor máximo.

#### Metadata
Para desplegar la información de los textos de cada tarjeta de radio (y para poder hacer la correcta asociación entre identificadores y archivos mp3), esta aplicación necesita como input un archivo llamado `radios_data.csv` (ubicado dentro de la carpeta `client`) en donde sus columnas estén separadas por `,`, no por `;`. Acá se debe detallar la información de cada radio por campo. Los campos son:
- `id`: identificador de la radio. Este será ocupado para asociar cada radio con su archivo mp3, el cual debe tener el mismo identificador como nombre (ejemplo: `5.mp3`, para la radio con `id` = `5`).
- `name`: el nombre de la radio.
- `subtitle`: el subtítulo de la radio.
- `description`: la descripción de la radio.

Este es el archivo que se lee para gener uno con la misma información pero en formato JSON.

### Carpetas y archivos
A continuación se describen las carpetas y archivos principales de este repositorio.
#### `client/audios/`
Carpeta con todos los audios, tanto los de las radios como el de estática.

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
Archivo que agrega/disponibiliza las fonts ubicadas en `fonts/` para poder ser
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

### Librerías requeridas antes de correr la aplicación

Para esta aplicación, se utilizaron las siguientes librerías de python:
```py
busio
digitalio
board
adafruit_mcp3xxx
websockets
```
Todas estas deben instalarse por separado con el siguiente comando:
```
pip3 install <librería>
```

### Comandos para correr la aplicación
#### Servidor
Para "servir" el código del servidor, primero se debe entrar a la carpeta `server/`:
```
cd server
```
Y luego ejecturar el archivo `websocket_server.py`:
```
python3 websocket_server.py
```
Esto dejará esa terminal ocupada leyendo y enviando los datos del potenciómetro (o bien, del simulador).
#### Cliente
Abrir una nueva terminal, y primero entrar a la carpeta `client/`:
```
cd client
```
Luego, correr el script que lee los datos del archivo .csv y los guarda en un archivo .json:
```
python3 csv_to_json_converter.py
```
Finalmente, debemos servir la aplicación desde el lado del cliente:
```
python3 -m http.server
```

Con eso la aplicación ya está corriendo en su totalidad. Basta con ir a `http://localhost:8000/` y comenzar a interactuar con ella.
