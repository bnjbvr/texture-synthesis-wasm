let $status = document.getElementById('status');
function status(msg) {
    $status.innerHTML = msg;
}

let $logs = document.getElementById('logs');
function log(msg) {
    console.log(msg);
    $logs.innerHTML += msg + '<br/>';
}

let $nearest = document.getElementById('nearest');
let $stage = document.getElementById('stage');
let $alpha = document.getElementById('alpha');
let $style = document.getElementById('style');

var width = 500;
var height = 0;

let video = null;
let inputCanvas = null;
let outputCanvas = null;

let worker = new Worker('./worker.js');

async function startup() {
    video = document.getElementById('video');
    inputCanvas = document.getElementById('input');
    outputCanvas = document.getElementById('output');

    let stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
    video.srcObject = stream;
    video.play();

    let streaming = false;
    video.addEventListener('canplay', function(ev) {
        if (streaming) {
            return;
        }

        height = video.videoHeight / (video.videoWidth/width);

        // Assume 4/3 ratio if the video height or width are not available.
        if (isNaN(height)) {
            height = width / (4/3);
        }

        video.setAttribute('width', width);
        video.setAttribute('height', height);

        inputCanvas.setAttribute('width', width);
        inputCanvas.setAttribute('height', height);

        outputCanvas.setAttribute('width', width);
        outputCanvas.setAttribute('height', height);
    }, false);

    document.getElementById('startbutton').addEventListener('click', function(ev){
        takePicture();
        ev.preventDefault();
    }, false);
}

function canvasToBuffer(canvas) {
    return new Promise(resolve => {
        canvas.toBlob(async blob => {
            let ab = await blob.arrayBuffer();
            resolve(ab);
        });
    });
}

async function takePicture() {
    if (!width || !height) {
        return;
    }

    var context = inputCanvas.getContext('2d');
    inputCanvas.width = width;
    inputCanvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    log('fetching user data...');
    let userData = new Uint8Array(await canvasToBuffer(inputCanvas));
    log('done fetching user data!');

    let nearest = $nearest.value;
    let stage = $stage.value;
    let alpha = $alpha.value;

    // This code would handle a fixed image (from a fixed URL).
    //status('loading image...');
    //let styleImageRequest = await fetch('signac.jpg');
    //styleData = new Uint8Array(await styleImageRequest.arrayBuffer());
    //status('done loading image');

    let reader = new FileReader();
    let styleData = await (function() {
        return new Promise(resolve => {
            reader.onload = e => {
                let buffer = e.target.result;
                resolve(new Uint8Array(buffer))
            };
            reader.readAsArrayBuffer($style.files[0]);
        })
    })();
    log('loaded style file!');

    worker.postMessage({
        styleData, userData, nearest, stage, alpha, height, width
    });

    worker.onmessage = e => {
        let data = e.data;
        switch (data.status) {
        case 'progress':
          status(data.msg);
          break;

        case 'log':
          log(data.msg);
          break;

        case 'done':
          log('creating image data');
          let context = outputCanvas.getContext('2d');
          context.putImageData(data.imageData, 0, 0);
          log('all righty then!');
          break;
        }
    };
}

window.addEventListener('load', startup, false);
