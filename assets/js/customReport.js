import { server } from "./config.js";

$(document).ready(function () {
  const baseUrl = new URL(server + "/report/day-wise");

  $("#download-btn").click((e) => {
    const startDate = $("#start-date").val();
    const endDate = $("#end-date").val();
    if (startDate === undefined || endDate === undefined) {
      baseUrl.searchParams.remove("start-date");
      baseUrl.searchParams.remove("end-date");
    }
    const downloadURL = baseUrl.href.replace("report/", "report/download/");
    console.log("download url", downloadURL);
    downloadCSV(downloadURL);
  });


  $("#customDateForm").submit(function (e) {
    e.preventDefault();
    const startDate = $("#start-date").val();
    const endDate = $("#end-date").val();
    if (startDate === undefined || endDate === undefined) {
      showToast("start-date or end-date need to be filled");
      return;
    }
    baseUrl.searchParams.set("start-date", startDate);
    baseUrl.searchParams.set("end-date", endDate);
    GetData(baseUrl);
  });

  GetData(baseUrl);

});


function GetData(url) {
  $.ajax({
    type: "GET",
    url: url,
    secure: false,

    success: function (response) {
      //clear datatable
      const oTable = $("#customReport").dataTable();
      oTable.fnClearTable();
      response.data.forEach((val, index) => {
        const arrayData = dataConverter(val);
        oTable.fnAddData(arrayData);
      });
      showToast(response.message);
    },
    error: function (error) {
      showToast(error.responseJSON.message);
    },
  });
}

function dataConverter(val) {
  let { user_name, user_id, in_time, out_time, date, is_late } = val;
  if (out_time == undefined) out_time = "not out yet";
  return [user_id, user_name, in_time, out_time, date, is_late];
}


function showToast(message) {
  if (message === undefined || message === null) {
    message = "Something went wrong...";
  }
  let date = new Date();
  let toastID = "toast" + date.getHours() + date.getMinutes() + date.getSeconds();
  let toast = $('<div class="toast w-100" role="alert" id="' + toastID + '" aria-live="assertive" aria-atomic="true"></div>');
  let toastHeader = $('<div class="toast-header"> <strong class="me-auto">Attendance System...</strong> <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button> </div>');
  let toastBody = $('<div class="toast-body">' + message + "</div>");
  toastHeader.appendTo(toast);
  toastBody.appendTo(toast);
  $(".toast-container").prepend(toast);
  $("#" + toastID).toast("show");
  setTimeout(function () {
    toast.remove();
  }, 3000);
  return toastID;
}

function downloadCSV(url) {
  $.ajax({
    url: url,
    method: "GET",
    dataType: "text",
    success: function (data) {
      console.log(data);
      var downloadLink = document.createElement("a");
      var blob = new Blob([data], { type: "text/csv" });
      var blobUrl = window.URL.createObjectURL(blob);
      downloadLink.href = blobUrl;
      downloadLink.download = `${new Date().toDateString()}.csv`;
      downloadLink.click();
      window.URL.revokeObjectURL(blobUrl); // Clean up the URL object
      showToast("csv file downloaded sucessfully");
    },
    error: function (error) {
      console.log("Error occurred:", error);
    },
  });
}