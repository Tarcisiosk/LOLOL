// data.js
document.addEventListener("deviceready", this.onDeviceReady, false);
var regions = ['BR', 'EUNE', 'EUNW', 'JP', 'KR'];

function onDeviceReady() {
}

$("#summoner_search").click(function(){
    var summoner_name = $("#summoner_search_text").val();
    pleaseWait.modal('show');
    SearchSummoner(summoner_name);
});

$("#close_data_dialog").click(function(){
    $('#champs').empty();
    $('#dataDialog').modal('hide');

});

//SUMMONER -> ID 1710401
    //MATCHES -> 783638382
        //DATA
