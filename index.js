// DOM manipulation
const $ = document.querySelector.bind(document);

// Utility functions.
const utils = {
  status: (function () {
    let $status = $("#status");
    return (msg) => {
      $status.innerHTML = msg;
    };
  })(),

  log: (function () {
    let $logs = $("#logs");
    return (...rest) => {
      console.log(...rest);
      $logs.innerHTML += rest.join(" ") + "<br/>";
    };
  })(),
};

// Global data.
class Context {
  worker = null;
  form = null;

  constructor() {
    this.worker = new Worker("./worker.js");
    this.worker.onmessage = this.onMessage;
    this.form = new Form(this.startTransferStyle);
  }

  async init() {
    await this.form.init();
  }

  startTransferStyle = (example, target, params) => {
    this.worker.postMessage({
      example,
      target,
      params,
    });
  };

  onMessage = (msg) => {
    let data = msg.data;
    switch (data.status) {
      case "progress":
        utils.status(data.msg);
        if (data.imageData !== null) {
          this.form.renderOutput(data.imageData);
        }
        break;

      case "log":
        utils.log(data.msg);
        break;

      case "done":
        utils.log("creating image data");
        this.form.renderOutput(data.imageData);
        utils.log("all righty then!");
        break;

      default:
        utils.log("unknown message with status: " + data.status);
        break;
    }
  };
}

class Form {
  DEFAULT_RATIO = 4 / 3;
  width = 500;
  height = null;

  constructor(startTransferStyle) {
    this.cam = $("#cam");

    this.exampleSelect = $("#example_select");
    this.exampleUpload = $("#example_upload");
    this.exampleInput = $("#example_input");
    this.exampleFixed = $("#example_fixed");

    this.targetSelect = $("#target_select");
    this.targetUpload = $("#target_upload");
    this.targetInput = $("#target_input");
    this.targetCam = $("#target_cam");

    this.chosenExample = $("#chosen_example");
    this.chosenTarget = $("#chosen_target");

    this.output = $("#output");

    this.submit = $("#submit");

    this.startTransferStyle = startTransferStyle;

    this.values = {
      example: null,
      target: null,
    };

    this.render({
      exampleShowInput: true,
      targetShowInput: true,
    });
  }

  async init() {
    let initializedStreaming = false;

    let setSizes = () => {
      this.cam.width = this.output.width = this.chosenExample.width = this.chosenTarget.width = this.width;
      this.cam.height = this.output.height = this.chosenExample.height = this.chosenTarget.height = this.height;
    };

    // Try to start the webcam.
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      this.cam.srcObject = stream;
      this.cam.play();

      this.cam.addEventListener(
        "canplay",
        (ev) => {
          if (initializedStreaming) {
            return;
          }
          // Infallible operation.
          initializedStreaming = true;
          this.height =
            this.cam.videoHeight / (this.cam.videoWidth / this.width);
          // Assume 4/3 ratio if the video height or width are not available.
          if (isNaN(this.height)) {
            this.height = this.width / this.DEFAULT_RATIO;
          }
          setSizes();
        },
        false
      );
    } catch (exc) {
      utils.log("error when initializing camera:", exc.message, exc.stack);
      // Assume default height.
      this.height = this.width / this.DEFAULT_RATIO;
      setSizes();
    }

    // Examples.
    this.exampleSelect.onchange = (ev) => {
      let exampleShowInput = ev.target.value === "upload";
      this.render({
        exampleShowInput,
      });
    };

    this.exampleInput.onchange = async () => {
      await this.fillCanvasFromFileInput(this.exampleInput, this.chosenExample);
      this.setFormValues({
        example: await Form.canvasToUint8Array(this.chosenExample),
      });
    };

    for (let img of this.exampleFixed.childNodes) {
      img.addEventListener("click", async () => {
        await this.fillCanvasFromImg(img, this.chosenExample);
        this.setFormValues({
          example: await Form.canvasToUint8Array(this.chosenExample),
        });
      });
    }

    // Targets.
    this.targetSelect.onchange = (ev) => {
      let targetShowInput = ev.target.value === "upload";
      this.render({
        targetShowInput,
      });
    };

    $("#target_cam_take").onclick = async () => {
      await this.fillCanvasFromCam(this.chosenTarget);
      this.setFormValues({
        target: await Form.canvasToUint8Array(this.chosenTarget),
      });
    };

    this.targetInput.onchange = async () => {
      await this.fillCanvasFromFileInput(this.targetInput, this.chosenTarget);
      this.setFormValues({
        target: await Form.canvasToUint8Array(this.chosenTarget),
      });
    };

    // Submit and parameters.
    this.submit.onclick = async (ev) => {
      ev.preventDefault();

      if (!this.height) {
        return;
      }

      if (!this.values.example || !this.values.target) {
        alert("missing example or target!");
        return;
      }

      let { example, target } = this.values;
      let params = this.readParameters();
      this.startTransferStyle(example, target, params);
    };
  }

  render({ exampleShowInput, targetShowInput }) {
    if (typeof exampleShowInput !== "undefined") {
      // Show subcomponent.
      this.exampleUpload.style.display = exampleShowInput ? "initial" : "none";
      this.exampleFixed.style.display = !exampleShowInput ? "initial" : "none";
      // Bidirectional sync: make sure the select current value is
      // synchronized with the internal state.
      this.exampleSelect.value = exampleShowInput ? "upload" : "fixed";
      this.exampleUpload.value = "";
    }

    if (typeof targetShowInput !== "undefined") {
      this.targetUpload.style.display = targetShowInput ? "initial" : "none";
      this.targetCam.style.display = !targetShowInput ? "initial" : "none";

      this.targetSelect.value = targetShowInput ? "upload" : "cam";
      this.targetUpload.value = "";
    }
  }

  setFormValues(update) {
    this.values = { ...this.values, ...update };
    this.submit.disabled = !this.values.target || !this.values.example;
  }

  static canvasToUint8Array(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        let ab = await blob.arrayBuffer();
        let u8 = new Uint8Array(ab);
        resolve(u8);
      });
    });
  }

  static resetCanvas(canvas, ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  async fillCanvasFromCam(canvas) {
    let ctx = canvas.getContext("2d");
    Form.resetCanvas(canvas, ctx);
    ctx.drawImage(this.cam, 0, 0, this.width, this.height);
  }

  async fillCanvasFromImg(img, canvas) {
    let ctx = canvas.getContext("2d");
    Form.resetCanvas(canvas, ctx);
    ctx.drawImage(img, 0, 0, this.width, this.height);
  }

  async fillCanvasFromFileInput(fileInput, canvas) {
    return new Promise((resolve) => {
      let ctx = canvas.getContext("2d");
      Form.resetCanvas(canvas, ctx);
      let img = new Image();
      img.onload = async () => {
        ctx.drawImage(img, 0, 0, this.width, this.height);
        URL.revokeObjectURL(img.src);
        resolve();
      };
      img.src = URL.createObjectURL(fileInput.files[0]);
    });
  }

  readParameters() {
    let nearest = Number.parseInt($("#nearest").value);
    let stage = Number.parseInt($("#stage").value);
    let alpha = Number.parseFloat($("#alpha").value);
    let livePreview = $("#live_preview").checked;
    let width = this.width;
    let height = this.height;
    return {
      livePreview,
      nearest,
      stage,
      alpha,
      width,
      height,
    };
  }

  renderOutput(imageData) {
    this.output.getContext("2d").putImageData(imageData, 0, 0);
  }
}

window.addEventListener(
  "load",
  async () => {
    const context = new Context();
    await context.init();
  },
  false
);
