$(document).ready(function () {
    
  var myModal = $("#attendance-alert");


  $("#user-register").submit(function (e) {
    e.preventDefault();
    var formData = new FormData(e.target);
    let data = Object.fromEntries(formData);
    const { user_name, email, description, phoneNo } = data;
    if (user_name && email && description && phoneNo) {
      console.log(JSON.stringify(data));

      $.ajax({
        type: "POST",
        url: "http://10.0.61.27:8080/users",
        contentType: "application/json",
        data: JSON.stringify(data),
        dataType: "json",
        success: function (data) {
          console.log(data);
          myModal.modal("show");
          $(".modal-title").text("user register successfully");
          $(".modal-body > p").text(data.message);
        },
        error: function (data) {
          console.log(data);
          myModal.modal("show");
          $(".modal-title").text("user register failed");
          $(".modal-body > p").text(JSON.parse(data.responseText).message);
          JSON.parse(data.responseText).errors.forEach((data) =>
            $(".modal-body > p").append(`<br> ${data}`)
          );
        },
      });
    } else {
        myModal.modal("show");
        $(".modal-title").text("cannot register user");
        $(".modal-body > p").text("required all the fileds");       
    }
  });
});
