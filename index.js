const darkMode = document.getElementById(`dark-mode-btn`);
darkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    
    const isDark = document.body.classList.contains('dark');
    if (isDark) {
      darkMode.innerHTML = '<i class="fa-solid fa-moon" aria-hidden="true"></i><span>Dark Mode</span>';
      darkMode.setAttribute('aria-pressed', 'true');
    } else {
      darkMode.innerHTML = '<i class="fa-regular fa-moon" aria-hidden="true"></i><span>Dark Mode</span>';
      darkMode.setAttribute('aria-pressed', 'false');
    }
});

const countryContainer = document.getElementById(`country-container`);
const searchInput = document.getElementById(`searchinput`);
const filterDropdown = document.getElementById(`filter-dropdown`);
const backBtn = document.getElementById(`back-btn`);

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
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,region,subregion,capital,tld,currencies,languages,borders');
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
        }}
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
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
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
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === '') {
      e.preventDefault();
      showDetailContent(country);
    }
  });
  card.style.cursor = 'pointer';
  return card;

  async function showDetailContent(country) {
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
  if (country.tld && country.tld.length > 0) {
    topLevelDomain = country.tld.join(', ');
  }
  let currencies = 'N/A';
  if (country.currencies) {
    currencies = Object.values(country.currencies)
    .map(currencies => currencies.name)
    .join(', ');
  }
  let languages = 'N/A';
  if (country.languages) {
    languages = Object.values(country.languages).join(', ');
  }
  const borderCodes = await getBorderCountries(country.borders);
  let borderButtonsHTML = '';
  if (borderCodes.length > 0) {
    borderButtonsHTML = 
    `<div class = "border-countries">
      <p><strong>Border Countries:</strong></p>
    <div class = "border-buttons">
    ${borderCodes.map(name => `<button class= "border-btn" data-country= "${name}">${name}</button>`).join('')}
    </div>
    </div>`;
  }
  detailContent.innerHTML = 
`<div class="country-detail">
   <img class="detail-flag" src="${country.flags.png}" alt="Flag of ${country.name.common}">
 <div class="detail-info">
    <h1>${country.name.common}</h1>
  <div class="detail-columns">
  <div class="detail-column">
   <p><strong>Native Name:</strong> ${nativeName}</p>
   <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
   <p><strong>Region:</strong> ${country.region}</p>
   <p><strong>Sub Region:</strong> ${country.subregion || 'N/A'}</p>
   <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
  </div>
  <div class="detail-column">
    <p><strong>Top Level Domain:</strong> ${topLevelDomain}</p>
    <p><strong>Currencies:</strong> ${currencies}</p>
    <p><strong>Languages:</strong> ${languages}</p>
  </div>
</div>
${borderButtonsHTML}
</div>
</div>`;
borderButtonListener();
}

function borderButtonListener() {
  const borderButtons = document.querySelectorAll('.border-btn');
  
  borderButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const countryName = button.getAttribute('data-country');
      
      try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          showDetailContent(data[0]);
        }
      } catch (error) {
        console.error('Error fetching border country:', error);
      }});
  });}
}
function backToHomePage() {
  const detailPage = document.getElementById('detail-page');
  detailPage.style.display = 'none';
  
  document.querySelector('.main-container').style.display = 'block';
  window.scrollTo(0,0);
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

async function getBorderCountries(borderCodes) {
  if (!borderCodes || borderCodes.length === 0) {
    return [];
  }
  try {
    const countryCodes = borderCodes.join(',');
    console.log('code string', countryCodes);
    const response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${countryCodes}`);
    if (!response.ok) {
      return [];
    }

    const countries = await response.json();
    console.log('Fetched border countries:', countries)
    return countries.map(country => country.name.common);

  } catch (error) {
    console.error('Error fetching border countries:', error);
    return [];
  }
}

searchInput.addEventListener('input', combofilters);
filterDropdown.addEventListener('change', combofilters);
backBtn.addEventListener('click', backToHomePage);

fetchapiCountries();
