let dataContainer = document.querySelector('#data-container');


function generateIconUrl(icon) {
	return `https://openweathermap.org/img/wn/${icon}@2x.png`
}
function generateUrl(city) {
	let weather_api_key = 'a64fd0a15297cf9856d1179365da0b27'
	return `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weather_api_key}&units=metric`;
}

const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

searchBtn.addEventListener('click', function() {
	city = cityInput.value;

	const result = generateUrl(city);
	fetch(result)
		.then(response => response.json())
		.then(data => { 
			//{"cod":"404","message":"city not found"}
			if(data.list) {
				renderWeather(data.list) 
      } else {
        renderError(data)
      }
		})

})


function renderError(data) {
  let error = document.createElement('p');
  error.innerText = data.message;
	dataContainer.innerHTML = ''
  dataContainer.append(error);
}
//function render result to the page
function renderWeather(weatherForecast) {
	if (document.getElementById('weather-forecast') !== null) {
		document.getElementById('weather-forecast').remove();
	}
	var div = document.createElement('div');
	div.setAttribute("id", "weather-forecast");
	dataContainer.innerHTML = ''
	dataContainer.append(div);



	// document.body.innerHTML = JSON.stringify(weatherForecast, null, '\n')

	//covert weatherForecast for every 3hours into weatherForecast per day

	//part1 how filter this 8el per day, 
	//[40items] => [[3],[8],[8],[8],[8],[5]].forEach(daylist=>part2(daylist))
	// {
	// 	17:['18:00','21:00'],
	// 	18:['00:00','03:00',...]
	// }

	// let arr = []
	// arr.push()
	// let dateWeather = {arr: []};
	// dateWeather.arr.push(weatherItem);
	let dateWeather = {}

	weatherForecast.forEach(weatherItem => {
		let date = new Date(weatherItem.dt * 1000);
		let key = date.getDate() + ' ' + date.toLocaleString('default', { month: 'long' }) + ' ' + date.getFullYear();
		if (key in dateWeather) {
			dateWeather[key].push(weatherItem);//object literals
		} else {
			dateWeather[key] = [weatherItem]
		}
	})

	let avgDateWeather = [];

	for (var key in dateWeather) {
		var dateWeatherArray = dateWeather[key];
		let minTemp = Infinity;
		let maxTemp = -Infinity;
		let descWeatherObject = {};

		//logic to find avg temperature and count how many times weather description is repeated
		dateWeatherArray.forEach(dateWeatherArrayItem => {
			let {description, icon} = dateWeatherArrayItem.weather[0]
			let {temp_min, temp_max} = dateWeatherArrayItem.main
			minTemp = Math.min(minTemp,temp_min,temp_max)
			maxTemp = Math.max(maxTemp,temp_min,temp_max)

			if (description in descWeatherObject) {
				descWeatherObject[description]['count']++;
			} else {
				descWeatherObject[description] = { 'count': 1, 'icon': icon };
			}
		})

		//avarage temperature
		//avgTemp = avgTemp / dateWeatherArray.length;

		//most common weather description and icon for a day
		let avgWeatherdesc = '';
		let avgWeathericon = '';
		let maxkey = '';
		for (let key in descWeatherObject) {
			if (maxkey) {
				if (descWeatherObject[key].count >= descWeatherObject[maxkey].count) {
					avgWeatherdesc = key;
					avgWeathericon = descWeatherObject[key].icon;
					maxkey = key;
				}
			} else {
				avgWeatherdesc = key;
				avgWeathericon = descWeatherObject[key].icon;
				maxkey = key;
			}
		}

		//create weather object with days and avg temp and most comon weather description and icon
		avgDateWeather.push({
			'dt_txt': key.toString(),
			'main': {
		//		'temp': avgTemp,
        
				minTemp,
				maxTemp
			},
			'weather': [{ 'description': avgWeatherdesc, 'icon': avgWeathericon }],
			list: dateWeatherArray
		});

		// for (const [key, value] of descWeatherArray) {
		//   console.log(key);
		// }
		// // descWeatherArray.forEach(descWeatherArrayItem =>{
		//   console.log(descWeatherArrayItem);
		// })
		// //console.log(avgTemp);

	}
	//console.log(avgDateWeather);
	//   let date = new Date(weatherItem.dt * 1000)
	// let key = date.getDate();
	// if (key in dateWeather) {
	//   dateWeather[key].push(weatherItem);//object literals
	// } else {
	//   dateWeather[key] = [weatherItem]
	// }




	//cases for list to book convertion problem
	//console.log(dateWeather);
	//console.log(dateWeather[0]);
	// part2 how to work with 8el => 1el
	//date only day,month,year
	//1 we can take the icon what appears most of the times
	//2 we can show uniqe icons inside this 8 possible icons
	//for description the same v1 or v2
	//for temperature we ned to find the smallest inside 8 records and the highest

	// {
	// 	minTemp:,
	// 	maxTemp
	// }

	//!!hint we can take only needed properties, no need to pass whole weather data for row



	avgDateWeather.forEach((data,index,list) => {
		let row = renderRow(index,list)
		div.appendChild(row);

    row.addEventListener('click', function() {
      console.log(data.list);
    });
	})
}

function renderRow(index, list) {
	let obj = list[index]
	//create element for whole row
	let row = document.createElement('p');
	row.className = 'weather-row';

  let deleteBtnDiv = document.createElement('div');
  deleteBtnDiv.className = 'delete-btn-div';

  let deleteBtn = document.createElement('button');
  deleteBtn.innerText = 'Remove';
  deleteBtn.className = 'delete-btn';

  deleteBtn.addEventListener('click', function() {
    row.remove();
		// delete list[index]
		list.splice(index, 1)
		console.log(list)
  })

	let iconHolder = document.createElement('div');
	iconHolder.className = 'icon-holder';
	//create icon
	let icon = obj.weather[0].icon
	let url = generateIconUrl(icon)
	let img = document.createElement('img')
	img.src = url

	//create el for date
	//create el for temperature
	let {	minTemp,maxTemp} = obj.main;
	//temp = parseInt(temp);
	let tempEl = document.createElement('div');
	tempEl.innerText = `${Math.round(minTemp)} / ${Math.round(maxTemp)} °C`;
  tempEl.className = 'temperature';

	//create el for weather condition
	let desc = obj.weather[0].description;
	let descEl = document.createElement('div');
	descEl.innerText = desc;
  descEl.className = 'description';

	const timestamp = Date.parse(obj.dt_txt);
	const myDate = new Date(timestamp);
	const options = { year: 'numeric', month: 'long', day: 'numeric' };//, hour: 'numeric', minute: 'numeric' };
	const formattedDate = new Intl.DateTimeFormat('ua-UA', options).format(myDate);
	let dateEl = document.createElement('div');
	dateEl.innerText = formattedDate;
  dateEl.className = 'date';
	//console.log(myDate2.getMonth()); // "2016-08-31T14:40:00.000Z"

	iconHolder.append(img, tempEl);
  deleteBtnDiv.append(deleteBtn);
	row.append(dateEl, iconHolder, descEl, deleteBtnDiv);
	return row
	//document.body.append(row);
  


	//row.append(date, img,temperature, condition)



	// document.body.append(img, temp, desc/**, date,temperature, condition*/);
	// document.body.append(row)
}
