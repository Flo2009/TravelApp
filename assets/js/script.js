const startDateSelectorEl=document.querySelector('#start-date');
const endDateSelectorEl=document.querySelector('#end-date');
const cityLinkEl=document.querySelector('.button expanded');

const weatherApiKey = '25382a741e6bced20fc1f59a53126a82';
    // const unsplashAccessKey = '0if3GrDUIH6iysaGK3ST5e-E-EBHqEfaRjhEcoPySwE'; // Your Unsplash API key
const historicalWeatherKey = 'CW426NP8AKREJEMSQQFPQG8MG';
//Add the datepickers at the start for Start and End-Date
$(document).ready(function() {
  $( "#start-date").datepicker({
    changeMonth: true,
    changeYear: true,
  });

  $( "#end-date").datepicker({
    changeMonth: true,
    changeYear: true,
  });
});

   
function getWeather(location, startDate, endDate) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherApiKey}&units=imperial`;
    const forecastUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${startDate}/${endDate}?key=${historicalWeatherKey}`
      
      //`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${weatherApiKey}&units=metric`;
      //get current Weather at location
      fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
          console.log('Current Weather Data:', data);
          if (data.cod === 200) {
            updateCurrentWeather(data);
          } else {

            console.error('Error:', data.message);
          }
        })
        .catch(error => console.error('Error:', error));
  //get the weather per requested period for five days per historical data
      fetch(forecastUrl)
      .then(function(response){
        if (response.ok){
          response.json().then(function (data){
            // console.log('Forecast Data:', data);
            updateForecast(data);
          })
        }else {
          $('#myModal').foundation('open'); 
          $('#error-message').text(`Error: Bad Request`);
          // alert(`Error:${response.statusText}`);
          return;
        }
      });
    };      
       
 //update the current Weather Card 
function updateCurrentWeather(data) {
      $('#weather-info').html(`
        <p id="locName">Location: ${data.name}</p>
        <p>Temperature: ${data.main.temp}°F</p>
        <p>Wind: ${data.wind.speed} mph</p>
        <p>Humidity: ${data.main.humidity}%</p>
      `);
    }
//update the historical weather for the requested period   
function updateForecast(data) {
    console.log(data);
      $('#forecast').empty();
      for (let i = 0; i < 5; i ++) {
        const forecast = data.days[i];
        const card = `
          <div class="card history-card">
            <h5>${forecast.datetime}</h5>
            <p>Temp: ${forecast.temp}°F</p>
            <p>Wind: ${forecast.windspeed} mph</p>
            <p>Humidity: ${forecast.humidity}%</p>
          </div>
        `;
        $('#forecast').append(card);
      }
    }
//Button click event for the "Adventure Button"
  $('#check').click(function() {
    let startDate=startDateSelectorEl.value.trim();
    let endDate=endDateSelectorEl.value.trim();
    console.log(startDate);
    startDate=dayjs(startDate).format('YYYY-MM-DD');
    endDate=dayjs(endDate).format('YYYY-MM-DD');
    console.log(startDate);
      const location = $('#location').val();
      //Make Sure End Date is after Start Date
      if (Date.parse(endDate) <= Date.parse(startDate)){
        $('#myModal').foundation('open'); 
        $('#error-message').text("End Date must be after Start Date to get correct Weather Data");
        return;
        // alert("End Date must be after Start Date");
        //Make Sure all is entered
      }else if (location && startDate && endDate) {
        getWeather(location, startDate, endDate);
      } else {
        $('#myModal').foundation('open'); 
        $('#error-message').text('Please enter all required data.');
        // alert('Please enter all required data.');
        return;
      }
    });
  
