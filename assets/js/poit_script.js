const searchFormEl=document.querySelector('#city-input-form');
const cityNameInputEl=document.querySelector('#location');

const pointsOfInterestDisplayEl=document.querySelector('#current-card');
const pointsOfInterestContainerEl=document.querySelector('#city-links');

const startDteSelectorEl=document.querySelector('#start-date');
const endDteSelectorEl=document.querySelector('#end-date');

// const errorEl=document.querySelector('#error-message');
const apiKeyAmadeus='Ec4DHZL6kMcHpTShrIZ2RDmZiTsv2INs';
const apiKeyOpenWeather='0d552094f106990cbff9be54fa9c4761';
const unsplashAccessKey = '0if3GrDUIH6iysaGK3ST5e-E-EBHqEfaRjhEcoPySwE'; // Your Unsplash API key

let accessToken ="";
let expiresAt = JSON.parse(localStorage.getItem('expires'));

//0d29kRuZRbWHcs6tXwquGbztzMUcMucaL4SB3Dhvop5AhAB6EdfWV0wb (Pexels API Key for Images)
//initiate the client object
const client = {
    clientId:'TjoaeFDE9hRkdigYZ5PvG6xgmnEprNWn',
    clientSecret: 'nysAxCYOo5UddBa8'
}
//set the client credientials variable
const clientCred='client_credentials'
//set the token buffer for the refresh
const TOKEN_BUFFER = 10;
//set the Amadeus url key for token
const amadeusUrl='https://test.api.amadeus.com/v1/security/oauth2/token';


const formSubmissionHandler = function(event){
    // console.log("I am here2");
    event.preventDefault();
    const cityName=cityNameInputEl.value.trim();
    let startDte = startDteSelectorEl.value.trim();
    let endDte = endDateSelectorEl.value.trim();
    startDte = dayjs(startDte).format('YYYY-MM-DD');
    endDte = dayjs(endDte).format('YYYY-MM-DD');
    
    citySearch(cityName, startDte, endDte);
}
//search the city and ensure it is a valid request
const citySearch = function (cityName, startDte, endDte){
    if (cityName){
        document.getElementById('city-input-form').reset();
        if (expiresAt < 0 || expiresAt == null){
            loadAccessToken(client);
        };
        getLocationData(cityName, apiKeyOpenWeather);
        }else{
        $('#myModal').foundation('open'); 
        $('#error-message').text('No city name available'); //'reveal',
        // alert('No city name available')
        return;
    }
    storeLocation(cityName, startDte, endDte);
}
//store the locations in local storage and add the link buttons to the modal
const storeLocation = function (cityName, startDte, endDte){
    let cityCheck = false;
    let cityLinks=JSON.parse(localStorage.getItem('cityLinks'));
    let cityData={};
    cityData = {
        city: cityName,
        strt: startDte,
        end: endDte
    }
    console.log(cityName);
    console.log(cityLinks);
    if (!cityLinks){
        console.log("what??")
        
        cityLinks=[];
        cityLinks.push(cityData);
        localStorage.setItem('cityLinks',JSON.stringify(cityLinks));
        addCityLinks();
    }else{
        
        for (i=0; i<cityLinks.length; i++){
            if (cityLinks[i].city === cityName){
                
                cityCheck=true;   
            }
        }
        if (cityCheck===false){
            if (cityLinks.length != 10){
                console.log('here we are')
                cityLinks.push(cityData);
                localStorage.setItem('cityLinks',JSON.stringify(cityLinks));
                addCityLinks();
            }else{
                cityLinks=[];
                cityLinks.push(cityData);
                cityCheck=false;
                localStorage.setItem('cityLinks',JSON.stringify(cityLinks));
                addCityLinks();
            }
        }    
    }
}

//Get the Geo Location for the Amadeus Request
const getLocationData = function (cityName, apiKey){
        if (typeof cityName==='undefined' || isNaN(cityName)!==true){
         return;
        }
         const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`
         
         
         fetch(apiUrl)
         .then(function(response){
             if (response.ok){
                 response.json().then(function (data){
                     // console.log(data);
                     getPointsOfInterests(data, cityName, apiKeyAmadeus);
                    
                 });
             }else {
                $('#myModal').foundation('open'); 
                $('#error-message').text(`Error:${response.statusText}`);
                //  alert(`Error:${response.statusText}`);
                 return;
             }
         })
         .catch(function (error){
            $('#myModal').foundation('open'); 
            $('#error-message').text('Unable to connect to OpenWeather');
            //  alert('Unable to connect to OpenWeather');
             return;
         });
     }

//get the points of interest or the activities from Amadeus API
const getPointsOfInterests = function (location, cityName, apiKey){
        if (location.length===0){
            $('#myModal').foundation('open'); 
            $('#error-message').text(`No location data present!`);
            // alert(`No location data present!`);
            return;
        }
        let access = JSON.parse(localStorage.getItem('token'));
        const lat=location[0].lat;
        const lon=location[0].lon;
        if (access!=null){
            const apiUrl=`https://test.api.amadeus.com/v1/shopping/activities?latitude=${lat}&longitude=${lon}&radius=1`;
            fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${access}`
                    
                }
            }).then(res => {
                    
                    return res.json();
                }).then(function(data){
                    
                    localStorage.setItem('activities',JSON.stringify(data)); 
                    localStorage.setItem('cities',JSON.stringify(cityName)); 
                    displayActivities();
                });
                
            }else{
                alert("No Token yet");
                return;
            }
    };

//function to get the token with a HTML POST request
function loadAccessToken(client) {
    fetch(amadeusUrl, {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: new URLSearchParams({
    'grant_type': 'client_credentials',
    'client_id': client.clientId,
    'client_secret': client.clientSecret
  })
}).then(res => {
    //return the response as JSON
       return res.json();
      })
      //extract the data with the token and the expire time and parse it to the function
      .then(function(data){
        // console.log(data);
        storeAccessToken(data);
      });
        
    }

//store token and time in localStorage as "database" 
function storeAccessToken(response) {
    // console.log(response);
    accessToken = response.access_token;
    localStorage.setItem('token',JSON.stringify(accessToken)); 
    expiresAt = response.expires_in; 'access_token'
    // console.log(accessToken);
    localStorage.removeItem('expires');
    console.log(expiresAt);

    localStorage.setItem('expires',JSON.stringify(expiresAt)); 
    
  }

//load new token at the start of the web page and clear local storage to have full 30min with the new token
function start(){
    // localStorage.clear();
    addCityLinks();
    loadAccessToken(client);
}

//reduce the token time to determin when to get a new token
const timeCheck = function (expiresAt){
    // console.log(expiresAt);
    if (expiresAt!=null){
        // console.log (expiresAt);
        expiresAt = JSON.parse(localStorage.getItem('expires'));
        expiresAt = expiresAt+TOKEN_BUFFER;
        // console.log (expiresAt);
        const timeInterval = setInterval(function(){
             expiresAt = JSON.parse(localStorage.getItem('expires'));
            //  console.log("here2");
             expiresAt--;
            //  console.log (expiresAt);
             localStorage.setItem('expires',JSON.stringify(expiresAt)); 

             if (expiresAt<0 || expiresAt==null){
                //  clearInterval(timeInterval);
                 loadAccessToken(client);
                 timeCheck(expiresAt);
             }
         }, 1000)
        // console.log(expiresAt);
    }else{
        expiresAt = JSON.parse(localStorage.getItem('expires'));
        timeCheck(expiresAt);
    }
}

//display up to 20 Activities
const displayActivities = function(){
    activityData = JSON.parse(localStorage.getItem('activities'));
    // console.log(activityData);
    if (activityData.length==0 || typeof activityData == 'undefined' || activityData == null || activityData.data.length==0){
        // console.log("here");
        $('#myModal').foundation('open'); 
        $('#error-message').text("No Activities Posted. Was a City selected?");
        // alert("No Activities Posted. Was a City selected?");
        return;
    }
   
    // console.log(activityData.data[0].name)
    $('#activities-list').empty();  
    for (let i=0; i < activityData.data.length; i++){
        // console.log("here2");
        if (typeof activityData.data[i].name == 'undefined' || activityData.data[i].name == null){
            alert("no data present");
            return;
        }else{
            if (i<20){
                // console.log(i);
                $('#activities-list').append(`<li>${activityData.data[i].name}</li>`);
            }
          }
    }
    let location = JSON.parse(localStorage.getItem('cities'));
    // console.log(location);
    updateBackgroundImage(location);
};

//update the Background per location searched for
const updateBackgroundImage = function (location) {
    
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${location}&client_id=${unsplashAccessKey}`;
    // console.log(unsplashUrl)
    fetch(unsplashUrl)
      .then(response => response.json())
      .then(data => {
        if (data.results.length > 0) {
          const imageUrl = data.results[0].urls.regular;
          $('#activities').css('background-image', `url(${imageUrl})`);
          
        } else {
          console.error('No images found for the location.');
        }
      })
      .catch(error => console.error('Error fetching image:', error));
  }

  //run application from the links
  const getLinkCityData = function(){
    
    citySearch($(this).attr('city'), $(this).attr('start-date'), $(this).attr('end-date'));
    getWeather($(this).attr('city'), $(this).attr('start-date'), $(this).attr('end-date'));
}

//add cities as links maximum number us is 10
const addCityLinks = function(){
    let cityArray = [];
    cityArray = JSON.parse(localStorage.getItem('cityLinks'));
    const cityLinks = $('#city-links');
    cityLinks.empty();
    // console.log("hello");
    if (cityArray !== null){
        for (city of cityArray){
            // console.log(city);
            //create city link button on the card
            const cityLinkButton=$('<button>')
            .addClass('button expanded')
            .text(city.city)
            .attr('city', city.city)
            .attr('start-date', city.strt)
            .attr('end-date', city.end);
            cityLinkButton.on('click',getLinkCityData);

            cityLinks.append(cityLinkButton);

        }
    }
}  
//render function at start 
start();

searchFormEl.addEventListener('submit', formSubmissionHandler);
//call the token expire function
timeCheck(expiresAt);
//script for the foundation framework
$(document).foundation();



