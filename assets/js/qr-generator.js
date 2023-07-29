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
    $('#name, #employeeId, #password').on('keyup change click', function () {
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
            $("#qr-container").css("height",$("#qr-container")[0].getBoundingClientRect().width+"px");
        }, 300);

        data = get_data_object("key");
        if (data != null){
            generateQrCode(data + ";" + $(this).attr("data-type"));

        }else{
            var name = $('#name').val();
            var employeeId = $('#employeeId').val();
            var pass = $('#password').val();
            data = name + ";" + employeeId + ";" + btoa(pass) + ";" + btoa(new Date());
            Save_data("key",data);
            generateQrCode(data + ";" + $(this).attr("data-type"));
        }
        
    });

    function generateQrCode(data){
        var qrContainer = $('#qr-container');
        setTimeout(function() {
            qrContainer.empty();
            var qrCode = new QRCode(qrContainer[0], {
                text: data + ";" + getDate(),
                width: 425,
                height: 425,
                colorDark: "#1c1c1c",
                colorLight: "#f7f7f7",
                correctLevel: QRCode.CorrectLevel.M
            });
            qrContainer.removeAttr('title');
            qrContainer.removeAttr('style');
        }, 700);
        setInterval(function () {
            qrContainer.empty();
            var qrCode = new QRCode(qrContainer[0], {
                text: data + ";" + getDate(),
                width: 425,
                height: 425,
                colorDark: "#1c1c1c",
                colorLight: "#f7f7f7",
                correctLevel: QRCode.CorrectLevel.M
            });
            qrContainer.removeAttr('title');
        }, 300000);
    }

    function getDate(){
        var d = new Date();
        return [[d.getDate(),d.getMonth()+1,d.getFullYear()].join("/"),[d.getHours(),d.getMinutes(),d.getSeconds()].join(":")].join(", ");
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
    
    if (get_data_object("key") == null){
        // Event Listner, on register QR Code generation, add a confirmation on leaving page.
        $('.qr-generator[data-type="register"]').on('click', function (e) {
            history.pushState(null, '', '');
        });
    }
    window.onpopstate = function() {
        if ($('.qr-code-container').hasClass('active')){
            console.log(confirm("Did you get this 'Register QR Code' scanned on Attendance System\nIf not then show this QR Code in attendance system to get registered"));
        }
    };
});