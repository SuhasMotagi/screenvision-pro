const startBtn = document.querySelector(".start-btn");
const pauseBtn = document.querySelector(".pause-btn");
const resumeBtn = document.querySelector(".resume-btn");
const stopBtn = document.querySelector(".stop-btn");
const video = document.querySelector(".video");
const statusText = document.getElementById("recording-status");

let mediaRecorder;
let chunks = [];
let combinedStream;
let screenStream;
let webcamStream;

startBtn.addEventListener("click", async () => {
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });

    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    const combinedVideoTracks = [
      ...screenStream.getVideoTracks(),
      ...webcamStream.getVideoTracks()
    ];

    const audioTracks = [
      ...screenStream.getAudioTracks(),
      ...webcamStream.getAudioTracks()
    ];

    combinedStream = new MediaStream([...combinedVideoTracks, ...audioTracks]);

    const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
      ? "video/webm; codecs=vp9"
      : "video/webm";

    mediaRecorder = new MediaRecorder(combinedStream, { mimeType: mime });

    mediaRecorder.ondataavailable = e => chunks.push(e.data);

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: chunks[0].type });
      const url = URL.createObjectURL(blob);
      video.src = url;
      video.play();

      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.webm";
      a.click();

      chunks = [];
      startBtn.disabled = false;
      stopBtn.disabled = true;
      pauseBtn.disabled = true;
      resumeBtn.disabled = true;
      statusText.textContent = "";
    };

    mediaRecorder.start();
    statusText.textContent = "🔴 Recording...";

    startBtn.disabled = true;
    stopBtn.disabled = false;
    pauseBtn.disabled = false;
    console.log("Recording started");

  } catch (err) {
    alert("Error: " + err.message);
    console.error(err);
  }
});

pauseBtn.addEventListener("click", () => {
  if (mediaRecorder.state === "recording") {
    mediaRecorder.pause();
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
    statusText.textContent = "⏸️ Paused";
    console.log("Recording paused");
  }
});

resumeBtn.addEventListener("click", () => {
  if (mediaRecorder.state === "paused") {
    mediaRecorder.resume();
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    statusText.textContent = "🔴 Recording...";
    console.log("Recording resumed");
  }
});

stopBtn.addEventListener("click", () => {
  mediaRecorder.stop();
  screenStream.getTracks().forEach(t => t.stop());
  webcamStream.getTracks().forEach(t => t.stop());
});
