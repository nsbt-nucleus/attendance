$(function () {
  function showToast(header, message) {
    if (message === undefined || message === null) {
      message = "Something went wrong...";
    }
    let date = new Date();
    let toastID =
      "toast" + date.getHours() + date.getMinutes() + date.getSeconds();
    let toast = $(
      '<div class="toast" role="alert" id="' +
        toastID +
        '" aria-live="assertive" aria-atomic="true"></div>'
    );
    let toastHeader = $(
      '<div class="toast-header"> <strong class="me-auto">' +
        header +
        '</strong> <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button> </div>'
    );
    let toastBody = $('<div class="toast-body">' + message + "</div>");
    toastHeader.appendTo(toast);
    toastBody.appendTo(toast);
    $(".toast-container").append(toast);
    $("#" + toastID).toast("show");
    setTimeout(function () {
      toast.remove();
    }, 3000);
    return toastID;
  }

  let past_user = undefined;

  // facingMode: "environment"

  const constraints = {
    audio: false,
    video: { facingMode: "user", video: { frameRate: { ideal: 10, max: 15 } } },
  };

  setInterval(function () {
    let userName = $("#userId").val();
    if (userName === "scanning" || userName.length == 0) {
      $("#btnUpload").attr("disabled", "disabled");
      $("#btnOutTime").attr("disabled", "disabled");
    } else {
      setTimeout(function () {
        $("#btnUpload").removeAttr("disabled");
        $("#btnOutTime").removeAttr("disabled");
      }, 500);
    }
  }, 100);

  function max_element(array) {
    if (array.length == 0) return null;
    var modeMap = {};
    var maxEl = array[0],
      maxCount = 1;
    for (var i = 0; i < array.length; i++) {
      var el = array[i];
      if (modeMap[el] == null) modeMap[el] = 1;
      else modeMap[el]++;
      if (modeMap[el] > maxCount) {
        maxEl = el;
        maxCount = modeMap[el];
      }
    }
    return maxEl;
  }

  let face_result = [];

  var myModal = new bootstrap.Modal(
    document.getElementById("attendance-alert"),
    {
      keyboard: true,
    }
  );

  $(".dismiss").click(() => {
    myModal.hide();
  });

  Webcam.set({
    width: 360,
    height: 270,
    image_format: "jpeg",
    jpeg_quality: 100,
  });
  Webcam.attach("#webcam");

  // script start
  const video = document.getElementsByTagName("video")[0];

  Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("../../models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("../../models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("../../models"),
  ]).then(startWebcam);

  const fetchUser = async () => {
    const response = await fetch("http://10.0.61.27:8080/users");
    return response.json();
  };

  function startWebcam() {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((error) => {
        showToast("error starting web cam", error);
        // myModal.show();
        // $(".modal-title").text("error starting web cam");
        // $(".modal-body > p").text(error);
      });
  }


  async function getLabeledFaceDescriptions() {
    const users = await fetchUser();
    const labels = [];
    users.data[0].forEach((user, index) => {
      labels.push(user.userId);
    });
    console.log(labels);
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = [];


        for (let j = 1; j <= 2; j++) {
          console.log(`../../labels/${label}/${j}.jpeg`);
          const img = await faceapi.fetchImage(
            `../../labels/${label}/${j}.jpeg`
          );

          const detections = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!detections) {
            throw new Error(`no faces detected for ${label}`);
          }

          descriptions.push(detections.descriptor);
        }

        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  }

  video.addEventListener("play", async () => {
    const maxDescriptorDistance = 0.48;
    const labeledFaceDescriptors = await getLabeledFaceDescriptions();
    const faceMatcher = new faceapi.FaceMatcher(
      labeledFaceDescriptors,
      maxDescriptorDistance
    );

    $("#spinner").hide();
    const canvas = faceapi.createCanvasFromMedia(video);
    $("#canvas").empty();
    $("#canvas").append(canvas);
    const displaySize = { width: 360, height: 270 };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      const results = resizedDetections.map((d) => {
        return faceMatcher.findBestMatch(d.descriptor, maxDescriptorDistance);
      });

      if (results.length >= 2) {
        showToast("attendance alert", "only one person at a time please");
      }

      if (results.length == 1) {
        results.forEach((result, i) => {
          const box = resizedDetections[i].detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, {
            label: result,
          });
          drawBox.draw(canvas);
          face_result.push(result._label);
          if (face_result.length >= 5) {
            let max = max_element(face_result);
            face_result = [];
            $("#userId").val(max);
            let current_user = $("#userId").val();

            if (current_user === "unknown") {
              $("#userId").val("scanning");
            }

            if (current_user !== "scanning" && current_user != past_user) {
              console.log("capturing....");
              past_user = current_user;
              $("#btnCapture").click();
            }
          }
        });
        show_toast = false;
      }
    }, 200);
  });

  // script end
  $("#btnCapture").click(function () {
    Webcam.snap(function (data_uri) {
      $("#imgCapture")[0].src = data_uri;
      $("#btnUpload").removeAttr("disabled");
    });
  });
  $("#btnUpload").click(function () {
    $("#btnUpload").html(`<div class="spinner-border" role="status" ></div>`);
    const image = $("#imgCapture")[0].src;
    const userId = $("#userId").val();
    if (userId === undefined || userId.length == 0) {
      $("#btnUpload").text("in-time");
      // myModal.show();
      // $(".modal-title").text("cannot take attendance");
      // $(".modal-body > p").text("userId cannot be empty");
      showToast("userId cannot be empty");
      return;
    }
    const basicJson = { data: image, userId };
    console.log(basicJson.email);
    const stringJson = JSON.stringify(basicJson);
    $.ajax({
      type: "POST",
      url: "http://10.0.61.27:8080/attendance/in-time",
      contentType: "application/json",
      data: JSON.stringify(basicJson),
      dataType: "json",
      success: function (data) {
        $("#btnUpload").text("in-time");
        console.log(data);
        // myModal.show();
        // $(".modal-title").text("attendance in-time register successfully");
        // $(".modal-body > p").text(data.message);
        showToast("attendance in-time register successfully", data.message);
      },
      error: function (data) {
        $("#btnUpload").text("in-time");
        console.log(data);

        // myModal.show();
        // $(".modal-title").text("attendance in-time register failed");
        // $(".modal-body > p").text(JSON.parse(data.responseText).message);
        let message = JSON.parse(data.responseText).message;
        JSON.parse(data.responseText).errors.forEach(
          (data) => (message += `<br> ${data}`)
        );
        showToast("attendance in-time register failed", message);
      },
    });
  });

  $("#btnOutTime").click(function () {
    $("#btnOutTime").html(`<div class="spinner-border" role="status" ></div>`);
    const userId = $("#userId").val();
    if (userId === undefined || userId.length == 0) {
      $("#btnOutTime").text("out-time");
      myModal.show();
      $(".modal-title").text("cannot take attendance");
      $(".modal-body > p").text("userId cannot be empty");
      return;
    }
    $.ajax({
      type: "GET",
      url: "http://10.0.61.27:8080/attendance/out-time/" + userId,
      success: function (data) {
        $("#btnOutTime").text("out-time");
        // myModal.show();
        // $(".modal-title").text("attendance out-time register successfully");
        // $(".modal-body > p").text(data.message);
        showToast("attendance out-time register successfully", data.message);
      },
      error: function (data) {
        $("#btnOutTime").text("out-time");
        console.log(data);
        // myModal.show();
        // $(".modal-title").text("attendance out-time register failed");
        // $(".modal-body > p").text(JSON.parse(data.responseText).message);
        // JSON.parse(data.responseText).errors.forEach((data) =>
        //   $(".modal-body > p").append(`<br> ${data}`)
        // );

        let message = JSON.parse(data.responseText).message;
        JSON.parse(data.responseText).errors.forEach(
          (data) => (message += `<br> ${data}`)
        );
        showToast("attendance in-time register failed", message);
      },
    });
  });
});
