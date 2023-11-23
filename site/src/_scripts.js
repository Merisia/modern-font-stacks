/**
 * Checks if a font is available to be used on a web page.
 *
 * @param {String} fontName The name of the font to check
 * @param {Function} callback A function to handle the boolean result of the font availability check
 * @license MIT
 * @copyright Sam Clarke 2013
 * @author Sam Clarke <sam@samclarke.com>
 * @url https://www.samclarke.com/javascript-is-font-available/
 * 
 * Modified on 02/2023 to execute the font availability check asynchronously 
 * using requestIdleCallback, and to invoke the callback function with the boolean result of the check.
 */
 
((document) => {
  let width;
  const body = document.body;

  const container = document.createElement('span');
  container.innerHTML = 'wi'.repeat(100);
  container.style.cssText = `
    position:absolute;
    width:auto;
    font-size:128px;
    left:-99999px;
  `;

  const getWidth = (fontFamily) => {
    container.style.fontFamily = fontFamily;

    body.appendChild(container);
    width = container.clientWidth;
    body.removeChild(container);

    return width;
  };

  // Pre compute the widths of monospace, serif & sans-serif
  // to improve performance.
  const monoWidth = getWidth('monospace');
  const serifWidth = getWidth('serif');
  const sansWidth = getWidth('sans-serif');
  
  window.isFontAvailable = (font, callback) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const available =
          monoWidth !== getWidth(`${font},monospace`) ||
          sansWidth !== getWidth(`${font},sans-serif`) ||
          serifWidth !== getWidth(`${font},serif`);
        callback(available);
      });
    } else {
      // Fallback to setTimeout for Safari
      setTimeout(() => {
        const available =
          monoWidth !== getWidth(`${font},monospace`) ||
          sansWidth !== getWidth(`${font},sans-serif`) ||
          serifWidth !== getWidth(`${font},serif`);
        callback(available);
      }, 0);
    }
  };
})(document);


// ----- FONT STACKS ----- //
const fonts = document.querySelector('#fonts');
const previewText = document.querySelector('#preview-text');
const fontWeightRange = document.querySelector('#fontweight');
const fontWeightOutput = document.querySelector('#weightoutput');
const fontWeights = document.querySelectorAll('.font-weights span');
const systemFont = document.querySelectorAll('.font-stack span');
const systemFontWeight = document.querySelectorAll('.font-stack var');
const fontCard = document.querySelectorAll('.font-card');

const changeSize = (newVal) => {
  fonts.style.fontSize = `${newVal}em`;
};

const changeWeight = (newVal) => {
  fonts.style.fontWeight = newVal;
  fonts.setAttribute('data-weight', newVal);
  systemFontWeight.forEach(element => {
    if (newVal === '400'){
      element.innerText = 'normal';
    } else if (newVal === '700') {
      element.innerText = 'bold';
    } else {
      element.innerText = newVal;
    }
  });
};

Array.from(fontWeights).forEach(e => {
  e.addEventListener('click', () => {
    const fontWeightValue = e.innerText;
    fonts.style.fontWeight = fontWeightValue;
    fonts.setAttribute('data-weight', fontWeightValue);
    fontWeightRange.value = fontWeightValue;
    systemFontWeight.forEach(element => {
      if (fontWeightValue === '400'){
        element.innerText = 'normal';
      } else if (fontWeightValue === '700') {
        element.innerText = 'bold';
      } else {
        element.innerText = fontWeightValue;
      }
    });
  });
});

const updateText = (newVal) => {
  const elements = document.querySelectorAll('.font-preview');
  Array.from(elements).forEach((el) => {
    el.innerText = newVal;
  });
};

const enterToBlur = (el) => {
  if (event.key === 'Enter'){
    el.blur();
  }
};

// add event listeners
const fontSizeInput = document.getElementById('fontsize');
fontSizeInput.addEventListener('input', (event) => {
  const newVal = event.target.value;
  document.querySelector('#sizeoutput').innerText = newVal;
  changeSize(newVal);
});
fontSizeInput.addEventListener('change', (event) => {
  const newVal = event.target.value;
  changeSize(newVal);
});

const fontWeightInput = document.getElementById('fontweight');
fontWeightInput.addEventListener('input', (event) => {
  const newVal = event.target.value;
  document.querySelector('#weightoutput').innerText = newVal;
  changeWeight(newVal);
});
fontWeightInput.addEventListener('change', (event) => {
  const newVal = event.target.value;
  changeWeight(newVal);
});

const previewTextInput = document.getElementById('preview-text');
previewTextInput.addEventListener('input', (event) => {
  const newVal = event.target.value;
  updateText(newVal);
});
previewTextInput.addEventListener('change', (event) => {
  const newVal = event.target.value;
  updateText(newVal);
});
previewTextInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    event.target.blur();
  }
});

Array.from(systemFont).forEach((el) => {
  const font = el.innerText;
  isFontAvailable(font, (available) => {
    if (available) {
      el.classList.add('yep');
    } else {
      el.classList.add('nope');
    }
  });
});


// ----- PREVIEW ----- //
const preview = document.querySelector('#preview');
const previewMenu = document.querySelector('#preview details');
const previewButtons = document.querySelectorAll('#preview button');
const urlParams = new URLSearchParams(window.location.search);
const stackParam = urlParams.get('stack');

const stacksAvail = Array.from(previewButtons, el => el.className);

// If has proper URL param
if (stacksAvail.includes(stackParam)) {
  preview.className = '';
  preview.classList.add(stackParam);
  previewButtons.forEach(el => {
     el.dataset.on = false;
  });
  document.querySelector(`#preview .${CSS.escape(stackParam)}`).dataset.on = true;
  document.querySelector(`#${CSS.escape(stackParam)}`).scrollIntoView();
  document.querySelector(`#${CSS.escape(stackParam)}`).classList.add('highlight');
  
  document.addEventListener('click', e => {
    fontCard.forEach(el => {
       el.classList.remove('highlight');
    });
  }, { once: true });
}

// Font stack buttons
previewButtons.forEach(e => {
  e.addEventListener('click', function(){
    preview.className = '';
    preview.classList.add(this.className);
    previewMenu.removeAttribute("open");
    previewButtons.forEach(el => {
       el.dataset.on = false;
    });
    this.dataset.on = true;
    // urlParams.set('stack', this.className);
    // window.history.replaceState(null, null, '?' + urlParams + '#preview');
    // window.history.replaceState({}, document.title, location.protocol + '//' + location.host + location.pathname);
  });
});


// ----- MENU ACTIONS ----- //
const menu = document.querySelector('#menu details');
const menuLinks = document.querySelectorAll('#menu nav a');

menuLinks.forEach(e => {
  e.addEventListener('click', () => {
    menu.removeAttribute("open");
  });
});

document.addEventListener('click', event => {
  const isClickInside = menu.contains(event.target);
  if (!isClickInside) {
    menu.removeAttribute("open");
  }
});

document.querySelectorAll('.smooth-scroll').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(anchor.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
    window.history.replaceState(null, null, anchor.getAttribute('href'));
  });
});

const fontWeightNames={
  100: 'Thin',
  200:' Extra Light',
  300:'Light',
  400:'Regular',
  500:'Medium',
  600:'Semibold',
  700:'Bold',
  800:'Extra Bold',
  900:'Black',
};

const fontWeightsIdentifiers = Object.keys(fontWeightNames);

fontWeightsIdentifiers.forEach(fontWeight => {
  const elements = [...document.querySelectorAll(`.weight-${fontWeight}`)];
  elements.forEach(element => {
    element.innerHTML = fontWeightNames[fontWeight]

    // Créer une copie de l'élément
    const italicSpan = element.cloneNode(true);
    // Ajouter la classe "italic" à la copie
    italicSpan.classList.add('italic');

    // Ajouter le texte "Italic" à la copie
    const weightText = italicSpan.textContent.trim();
    if(weightText === "Regular") {
      italicSpan.textContent = `Italic`;
    } else {
      italicSpan.textContent = `${weightText} Italic`;
    }

    // Insérer l'élément italique après l'élément d'origine
    element.parentNode.insertBefore(italicSpan, element.nextSibling);
  })
});

const titles = [...document.querySelectorAll('.font-title')];
titles.forEach(title=>{
  const div = document.createElement("div");

  // Ajouter la classe "italic" à la copie
  div.classList.add('Aa');

  div.textContent = `Aa`;

  // Insérer l'élément italique après l'élément d'origine
  title.parentNode.insertBefore(div, title.previousSibling);
})



function addGoogleFonts(fontsArray) {
  const params =[];
  // Créer une liste des styles de police à partir de l'entrée
  const fontStyles = "ital,wght@"+ [...fontWeightsIdentifiers.map(f => `0,${f}`), ...fontWeightsIdentifiers.map(f => `1,${f}`)].join(';');

  fontsArray.forEach(font => {
    const fontName = font.replace(/ /g, '+')
    params.push(`family=${fontName}:${fontStyles}`)
  })

  // Créer l'URL pour les polices Google Fonts
  const fontsURL = `https://fonts.googleapis.com/css2?${params.join('&')}`;

  console.log(fontsURL)

  // Créer une balise link
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = fontsURL;

  // Ajouter la balise link à l'élément head du document
  document.head.appendChild(linkElement);

  // Créer le code CSS pour les classes correspondantes aux polices chargées
  const styleElement = document.createElement('style');
  let cssCode = '';

  fontsArray.forEach(font => {
    const className = font.toLowerCase().replace(/ /g, '-');
    cssCode += `
      .${className} {
        font-family: "${font}", sans-serif;
      }
    `;

    const systemUI = document.querySelector('#system-ui')
    const italicSpan = systemUI.cloneNode(true);
    italicSpan.id=className
    italicSpan.classList= `font-card ${className}`

    italicSpan.querySelector('h3').innerText = font
    italicSpan.querySelector('.font-stack code').innerHTML = `font-family:
            <span class="yep">'${font}'</span>,
            <span class="yep">sans-serif</span>;
            <strong>font-weight: <var>normal</var>;</strong>`

    systemUI.parentNode.insertBefore(italicSpan, systemUI.previousSibling);
  });

  styleElement.innerHTML = cssCode;

  // Ajouter le code CSS à l'élément head du document
  document.head.appendChild(styleElement);
}

// Utilisation de la fonction avec l'entrée [Libre Franklin]
const fontsToLoad = ['Libre Franklin', 'Raleway'];
addGoogleFonts(fontsToLoad);