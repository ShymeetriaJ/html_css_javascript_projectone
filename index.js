const darkMode = document.getElementById(`dark-mode-btn`);
darkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

const countryContainer = document.getElementById(`country-container`);
const searchInput = document.getElementById(`searchinput`);
const filterDropdown = document.getElementById(`filter-dropdown`);

let apiCountries = [];

function convertHtml(string) {
    return String(string)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function fetchapiCountries() {
    console.log('starting fetch....')
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital');
        console.log('Response status:', response.status);
        if (!response.ok) throw new Error("Error fetching api data");

        const data = await response.json();
        
        apiCountries = data;
        renderCountries(apiCountries);

        console.log('Successfully fetched countries:', data.length);
        } catch (error) {
            console.error(`Failed to fetch countries`, error)
            if (countryContainer) {
            countryContainer.innerHTML = `<p> Sorry, try again later.</p>`;
        }
    }
}
function renderCountries(countries) {
    if (!countryContainer) return;

       countryContainer.innerHTML = '';

    if (!countries || countries.length === 0) {
        countryContainer.innerHTML = `<p> Country not found </p>`;
        return;
    }

countries.forEach(country => {
        const card = makeCountryCard(country);
        countryContainer.appendChild(card);
    });
}


function makeCountryCard(country = {} ) {

let name = "No name";
if (country && country.name && country.name.common) {
  name = country.name.common;
}

let flagUrl = "";
if (country && country.flags) {
  if (country.flags.png) {
    flagUrl = country.flags.png;
  } else if (country.flags.svg) {
    flagUrl = country.flags.svg;
  }
}

let population = "N/A";
if (typeof country.population === "number") {
  population = country.population.toLocaleString();
}

let region = "N/A";
if (country && country.region) {
  region = country.region;
}

let capital = "N/A";
if (country && Array.isArray(country.capital) && country.capital.length > 0) {
  capital = country.capital[0];
}

const card = document.createElement('article');
  card.className = 'country-card';
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', `Country card for ${name}`);
  
  card.innerHTML = 
    `<img class="flag" src="${convertHtml(flagUrl)}" alt="Flag of ${convertHtml(name)}" />
    <div class="country-info">
      <h2 class="country-name">${convertHtml(name)}</h2>
      <p><strong>Population:</strong> ${convertHtml(population)}</p>
      <p><strong>Region:</strong> ${convertHtml(region)}</p>
      <p><strong>Capital:</strong> ${convertHtml(capital)}</p></div>`;
  
  card.addEventListener('click', () => {
    showDetailContent(country);
  });
  
  function showDetailContent(country) {
    document.querySelector('.main-container').style.display = 'none';
    const detailPage = document.getElementById('detail-page');
    detailPage.style.display = 'block';

    const detailContent = document.getElementById('detail-content');

    let nativeName = country.name.common;
    if (country.name.nativeName) {
      const nativeNameObject = Object.values(country.name.nativeName)[0];
      if (nativeNameObject.common) {
        nativeName = nativeNameObject.common;
      }
    }
  let topLevelDomain = 'N/A';
  if (country.topLevelDomain && country.topLevelDomain.length > 0) {
    topLevelDomain = country.topLevelDomain.join(', ');
  }
  let currencies = 'N/A';
  if (country.currencies) {
    currencies = Object.values(country.currencies)
    .map(currencies => currencies.name)
    .join(', ');
  }
  }
  card.style.cursor ='pointer';

  return card;
}

function combofilters() {
  const searchCountry = searchInput.value.trim().toLowerCase();
  const searchRegion = filterDropdown.value;
  
  let filterCountries = apiCountries;

  if (searchRegion !== '') {
    filterCountries = filterCountries.filter(country => {
      return country.region === searchRegion;
  });
}
  if (searchCountry !== '') {
    filterCountries = filterCountries.filter(country => {
  const countryName = country.name.common.toLowerCase();
  return countryName.includes(searchCountry);
  });
}
renderCountries(filterCountries);
}
searchInput.addEventListener('input', combofilters);
filterDropdown.addEventListener('change', combofilters);

fetchapiCountries();
