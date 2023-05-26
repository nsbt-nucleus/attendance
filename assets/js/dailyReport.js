$(document).ready(function () {

    function dataConverter(val){

        let {userName,userId,in_time,out_time,is_late,hour_completion} = val
        if(out_time == undefined)
            out_time = "not out yet"
        return [userId,userName,in_time,out_time,is_late,hour_completion]
    }

    $.ajax({
        type: "GET",
        url: "http://10.0.61.27:8080/report/daily",
        secure : false,

        success: function (response) {
            console.log("daily response",response)
            response.data.forEach( (data,index)  => {
                data.forEach( (val) => {
                    const oTable = $('#dailyReport').dataTable()
                    const arrayData  = dataConverter(val)
                    oTable.fnAddData(arrayData)
                })
            })

        },
        error : function(data) {
            console.log(data.responseText)
        }
    });

});