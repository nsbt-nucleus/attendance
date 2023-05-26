$(document).ready(function () {

    data = get_data_object("key");
    if (data != null){
        setTimeout(function () {
            $('.attendance-form').addClass('active');
        }, 300);
    }else{
        setTimeout(function () {
            $('.login-form').addClass('active');
        }, 300);
    }
    
    // In form if (email field is correct) and (password is >= 14 digits) then remove disabed from submit button
    $('#email, #password').on('keyup change click', function () {
        if ($('#name').val() != '' && $('#employeeId').val() != '' && $('#password').val().length >= 6) {
            $('.qr-generator:first').removeAttr('disabled');
        } else {
            $('.qr-generator:first').attr('disabled', 'disabled');
        }
    });


    $('.qr-generator').on('click', function (e) {
        e.preventDefault();
        var data;
        setTimeout(function () {
            $('.login-form').removeClass('active');
            $('.attendance-form').removeClass('active');
            $('.qr-code-container').addClass('active');
        }, 300);

        data = get_data_object("key");
        if (data != null){
            generateQrCode(data + ";" + $(this).attr("data-type"));

        }else{
            var name = $('#name').val();
            var employeeId = $('#employeeId').val();
            var pass = $('#password').val();
            data = name + ";" + employeeId + ";" + window.btoa(pass) + ";" + window.btoa(new Date());
            Save_data("key",data);
            generateQrCode(data + ";" + $(this).attr("data-type"));
        }
        
    });

    function generateQrCode(data){
        setInterval(function () {
            var qrContainer = $('#qr-container');
            qrContainer.empty();
            var qrCode = new QRCode(qrContainer[0], {
                text: data + ";" + new Date(),
                width: 230,
                height: 230,
                colorDark: "#1c1c1c",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L
            });
            qrContainer.removeAttr('title');
        }, 3000);
    }


    function Save_data(key,data) {
        var object = {data: data}
        localStorage.setItem(key, JSON.stringify(object));
      }
      
    function Update_data(main_key,data_value) {
        var val = JSON.parse(localStorage.getItem(main_key));
        var object = {data: data_value};
        localStorage.removeItem(main_key);
        localStorage.setItem(main_key, JSON.stringify(object));
    }
      
    function Delete_data(key) {
        localStorage.removeItem(key);
    }
    
    function get_data_object(key) {
        var object = JSON.parse(localStorage.getItem(key));
        if(object == null) {
            return null;
        }
        else{
            return object["data"];
        }
    }

});