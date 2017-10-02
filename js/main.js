var prevButton, nextButton, submitButton;
var inputField;
var minDate; //smallest date visible
var maxDate; //greatest date visible
var visContainer;
var id;

var xhttp;

var appCount;
var secondsInApp;

var chartConfig;
var chart;
var hasBeenPlotted = false;

var host = "http://advvs07.gm.fh-koeln.de:4567/api";

window.onload = function(){
  prevButton = document.getElementById("btn_prev");
  nextButton = document.getElementById("btn_next");
  submitButton = document.getElementById("btn_submit");
  inputField = document.getElementById("input_id");
  visContainer = document.getElementById("vis_container");

  maxDate = new Date(); //init max date = today
  minDate = new Date(); minDate.setDate(minDate.getDate() - 7);

  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = ajaxCallback;

  prevButton.onclick = prevBtnAction;
  nextButton.onclick = nextBtnAction;
  submitButton.onclick = submitBtnAction;
  inputField.onkeydown = submitInputAction;

  initializeChartConfig();
  plotVis();

}

var ajaxCallback = function callback(){
  if(this.readyState == 4 && this.status == 200){
    if(this.responseText == "null"){
      alert("Falsche Probanden-ID.")
      visContainer.className = "invisible";
    } else{
      var data = JSON.parse(this.responseText);

      appCount = new Array();
      secondsInApp = new Array();

      data.forEach(function(entry){
        appCount.push({t: new Date(entry.singleDate), y: entry.openAppCount});
        secondsInApp.push({t: new Date(entry.singleDate), y: entry.secondsInApp/60});
      });
      visContainer.className = "visible";
      updateChartConfig(appCount, secondsInApp);
    }
  }
}

var submitInputAction = function submitOnEnter(e){
  if(e.keyCode == 13){
    e.preventDefault();
    submitBtnAction();
  }
}

var submitBtnAction = function showAndLoadVis(){
  var _id = inputField.value;
  if(_id){
    id = _id;
    getDataFromApi(id, minDate, maxDate);
  }
}

function getDataFromApi(id, mindate, maxdate){
  var url = host + "?id=" + id + "&start=" + mindate.getTime() + "&end=" + maxdate.getTime();

  xhttp.open("GET", url, true);
  xhttp.send();
}


var prevBtnAction = function minusSevenDays(){
  maxDate.setDate(maxDate.getDate()-7);
  minDate.setDate(minDate.getDate()-7);

  getDataFromApi(id, minDate, maxDate);

  // enableNextButton
  nextButton.disabled = false;
  nextButton.className = "button-primary";

}

var nextBtnAction = function plusSevenDays(){
  maxDate.setDate(maxDate.getDate()+7);
  minDate.setDate(minDate.getDate()+7);

  getDataFromApi(id, minDate, maxDate);

  // disable nextButton if maxDate = today
  if(maxDate.toDateString() == new Date().toDateString()){
    nextButton.disabled = true;
    nextButton.className = "button";
  }
}

function plotVis(){
  var ctx = document.getElementById("visualization");
  chart = new Chart(ctx, chartConfig);
}

function updateChartConfig(appCount, secondsInApp){
  console.log(chartConfig);
  chartConfig.data.datasets[0].data = appCount;
  chartConfig.data.datasets[1].data = secondsInApp;
  chart.update();
}

function initializeChartConfig(){
  chartConfig = {
      type: 'line',
      data: {
          datasets: [{
              label: '# App geöffnet',
              data: null,
              borderWidth: 3,
              borderColor: 'rgb(24, 179, 240)',
              fill: false
          }, {
              label: 'Minuten in App verbracht',
              data: null,
              borderWidth: 3,
              borderColor: 'rgb(0, 230, 200)',
              fill: false
          }
        ]
      },
      options: {
        responsive: true,
          scales: {
              xAxes: [{
                type: "time",
                time: {
                  unit: "day"
                },
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: 'Datum'
                }
              }],
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  }

}
