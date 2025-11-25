const darkMode = document.getElementById(`dark-mode-btn`);
darkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

const countryContainer = document.getElementById(`country-container`);
const searchInput = document.getElementById(`searchinput`);
const filterDropdown = document.getElementById(`filter-dropdown`);

let apiCountries = [];

async function fetchapiCountries() {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/all`);
        if (!response.ok) throw new Error("Error fetching api data");
        const data = await response.json();
        
        apiCountries = data;
        renderCountries(apiCountries);

        } catch (error) {
            console.error(`Failed to fetch countries`, error)
            if (countryContainer) {
            countryContainer.innerHTML = `<p> Sorry, try again later.</p>`;
        }
    }
};

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
  
  card.innerHTML = `
    <img class="flag" src="${escapeHtml(flagUrl)}" alt="Flag of ${escapeHtml(name)}" />
    <div class="country-info">
      <h2 class="country-name">${escapeHtml(name)}</h2>
      <p><strong>Population:</strong> ${escapeHtml(population)}</p>
      <p><strong>Region:</strong> ${escapeHtml(region)}</p>
      <p><strong>Capital:</strong> ${escapeHtml(capital)}</p></div>`;
  
  return card;
}
function renderCountries(countries) {
    if (!countryContainer) return;

       countryContainer.innerHTML = '';

    if (!countries || countries.length === 0) {
        countryContainer.innerHTML = `<p> Country not found </p>`;
        return;
    }
}
 countries.forEach(country => {
        const card = makeCountryCard(country);
        countryContainer.appendChild(card);
});


fetchapiCountries();
