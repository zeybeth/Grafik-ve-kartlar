/* Veri Yapısı */
const STORES_DATA = [
  {
    store: "Bakır Talebi",
    description: "2021'den 2024'e bakır talebi yaklaşık %8 artmıştır. Temiz enerjide bakır kullanım oranı %29'dur. 2050 Net Sıfır Emisyon simülasyonuna göre bakır talebi 2 kattan fazla artış gösterebilir.",
    unit: "kt Cu",
    products: [
      { name: "Toplam talep", revenue: 26717 },
      { name: "Diğer kullanımlar", revenue: 18980 },
      { name: "Elektrik ağları", revenue: 4929 },
      { name: "Güneş paneli", revenue: 1657 },
      { name: "Diğer temiz enerji", revenue: 654 },
      { name: "Elektrikli araçlar", revenue: 497 }
    ]
  },
  {
    store: "Lityum Talebi",
    description: "Lityumun temiz enerji kullanımındaki payı 2021'de %40 iken bu oran 2024'te %62'ye yükselmiştir. Net Sıfır Emisyon senaryosuna göre %92'ye yükselmesi tahmin edilmektedir.",
    unit: "kt Li",
    products: [
      { name: "Toplam talep", revenue: 205 },
      { name: "Elektrikli araçlar", revenue: 109 },
      { name: "Diğer kullanımlar", revenue: 77 },
      { name: "Batarya depolama", revenue: 19 }
    ]
  },
  {
    store: "Nikel Talebi",
    description: "Nikele olan talep 2021'den 2024'e kadar yaklaşık %19 artış göstermiştir. Net Sıfır Emisyon senaryosuna göre %125,8'lik talep artışı tahmin edilmektedir.",
    unit: "kt Ni",
    products: [
      { name: "Toplam talep", revenue: 3371 },
      { name: "Diğer kullanımlar", revenue: 2809 },
      { name: "Elektrikli araçlar", revenue: 321 },
      { name: "Diğer temiz enerji", revenue: 224 },
      { name: "Batarya depolama", revenue: 17 }
    ]
  },
  {
    store: "Kobalt Talebi",
    description: "Temiz enerjide kobalt kullanımı payı %20'den %32'ye çıkmıştır. 2050'ye kadar ise %58'e yükselmesi tahmin edilmiştir.",
    unit: "kt Co",
    products: [
      { name: "Toplam talep", revenue: 225 },
      { name: "Diğer kullanımlar", revenue: 154 },
      { name: "Elektrikli araçlar", revenue: 67 },
      { name: "Batarya depolama", revenue: 4 }
    ]
  },
  {
    store: "Grafit Talebi",
    description: "2050 yılına grafit talebinin yaklaşık 3 kat artması beklenmektedir. Temiz enerji kullanımındaki payının ise %32'den %47'ye yükselmesi tahmin edilmiştir.",
    unit: "kt",
    products: [
      { name: "Toplam talep", revenue: 4766 },
      { name: "Diğer kullanımlar", revenue: 3260 },
      { name: "Elektrikli araçlar", revenue: 1260 },
      { name: "Batarya depolama", revenue: 246 }
    ]
  },
  {
    store: "Nadir Toprak Elementleri",
    description: "Bu bölüm için özel bir açıklama bulunmamaktadır. Nadir toprak elementleri talebi verileri gösterilmektedir.",
    unit: "kt REE",
    products: [
      { name: "Toplam talep", revenue: 91 },
      { name: "Diğer kullanımlar", revenue: 72 },
      { name: "Rüzgar türbinleri", revenue: 10 },
      { name: "Elektrikli araçlar", revenue: 8 }
    ]
  }
];

/* Sabitler (Constants) */
const BAR_ANIMATION_BASE_DELAY_MS = 100;
const BAR_ANIMATION_INCREMENT_MS = 150;
const BAR_MIN_PERCENTAGE_WIDTH = 2;
const BAR_MIN_WIDTH_THRESHOLD_PERCENT = 15;
const SCROLL_PER_CARD_FACTOR = 1;
const STICKY_GROUP_GAP = 60;
const WRAPPER_HORIZONTAL_PADDING = 25;
const SCROLL_LOCK_DURATION_MS = 700;

/* DOM Elemanları */
const DOMElements = {
  cardsDiv: document.getElementById('cards'),
  barsDiv: document.getElementById('bars'),
  storeNameH2: document.getElementById('storeName'),
  chartDiv: document.getElementById('chart'),
  newsTopDiv: document.getElementById('news-top'),
  container: document.getElementById('container'),
  newsBottomDiv: document.getElementById('news-bottom'),
  stickyGroup: document.getElementById('sticky-group'),
  finalScrollSpacer: document.getElementById('final-scroll-spacer'),
  wrapper: document.querySelector('.wrapper'),
  body: document.body,
  mineralDescriptionDiv: document.getElementById('mineralDescription'),
  descriptionText: document.getElementById('descriptionText'),
  unitNote: document.getElementById('unitNote'),
};

let cards = [];
let currentActiveCardIndex = -1;
let isScrollingByClick = false;

let pinStartScrollY = 0;
let pinEndScrollY = 0;
let chartFixedTopOffset = 0;
let stickyGroupHeight = 0;
let totalFixedScrollDuration = 0;

function updateCardActiveState(activeIndex) {
  cards.forEach((card, i) => {
    if (i === activeIndex) {
      card.classList.add('active-card');
    } else {
      card.classList.remove('active-card');
    }
  });
}

function formatRevenue(value) {
  return value.toLocaleString('tr-TR');
}

/* UI Güncelleme Fonksiyonları */
function createCardElement(storeData, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.textContent = storeData.store;
  card.dataset.index = index;

  card.addEventListener('click', () => {
    const clickedIndex = parseInt(card.dataset.index);

    isScrollingByClick = true;

    updateChart(clickedIndex);
    updateCardActiveState(clickedIndex);
    currentActiveCardIndex = clickedIndex;

    const scrollPerCard = window.innerHeight * SCROLL_PER_CARD_FACTOR;
    const targetScrollY = pinStartScrollY + (clickedIndex * scrollPerCard);

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });

    setTimeout(() => {
      isScrollingByClick = false;
    }, SCROLL_LOCK_DURATION_MS);
  });
  return card;
}

function initializeCards() {
  DOMElements.cardsDiv.innerHTML = '';
  cards = [];

  STORES_DATA.forEach((storeData, index) => {
    const card = createCardElement(storeData, index);
    DOMElements.cardsDiv.appendChild(card);
    cards.push(card);
  });
}

function updateChart(idx) {
  if (idx < 0 || idx >= STORES_DATA.length) return;

  const { store, products, description, unit } = STORES_DATA[idx];

  DOMElements.storeNameH2.textContent = store;
  DOMElements.barsDiv.innerHTML = '';

  const maxRevenue = products.length > 0 ? Math.max(...products.map(p => p.revenue)) : 1;

  products.sort((a, b) => b.revenue - a.revenue).forEach((product, i) => {
    const barItem = document.createElement('div');
    barItem.className = 'bar-item';

    const barLabel = document.createElement('div');
    barLabel.className = 'bar-label';
    barLabel.textContent = product.name;
    barItem.appendChild(barLabel);

    const barTrack = document.createElement('div');
    barTrack.className = 'bar-track';

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.width = '0%';

    const barValueSpan = document.createElement('span');
    barValueSpan.className = 'bar-value';
    barValueSpan.textContent = `${formatRevenue(product.revenue)} ${unit}`;

    bar.appendChild(barValueSpan);
    barTrack.appendChild(bar);
    barItem.appendChild(barTrack);
    DOMElements.barsDiv.appendChild(barItem);

    setTimeout(() => {
      let calculatedWidth = (product.revenue / maxRevenue * 100);
      let finalWidthPercent = Math.max(calculatedWidth, BAR_MIN_PERCENTAGE_WIDTH);

      bar.style.width = finalWidthPercent + '%';
      bar.setAttribute('data-animated', 'true');

      if (calculatedWidth < BAR_MIN_WIDTH_THRESHOLD_PERCENT) {
        bar.setAttribute('data-min-width', 'true');
      }
    }, BAR_ANIMATION_BASE_DELAY_MS + i * BAR_ANIMATION_INCREMENT_MS);
  });

  DOMElements.descriptionText.textContent = description;
  DOMElements.mineralDescriptionDiv.style.display = 'block';
  DOMElements.unitNote.textContent = `Birim: ${unit}`;
}

/* Sabitleme ve Kaydırma Hesaplamaları */
function calculateFixedSection() {
  const viewportHeight = window.innerHeight;

  DOMElements.stickyGroup.style.position = 'relative';
  DOMElements.stickyGroup.style.top = 'auto';
  DOMElements.stickyGroup.style.left = 'auto';
  DOMElements.stickyGroup.style.transform = 'none';
  DOMElements.stickyGroup.style.width = '100%';

  const stickyGroupOriginalOffsetTop = DOMElements.stickyGroup.offsetTop;
  const containerTopRelativeToStickyGroup = DOMElements.container.offsetTop;

  const wasMineralDescriptionHidden = DOMElements.mineralDescriptionDiv.style.display === 'none';
  if (wasMineralDescriptionHidden) {
    DOMElements.mineralDescriptionDiv.style.display = 'block';
  }
  stickyGroupHeight = DOMElements.stickyGroup.offsetHeight;
  if (wasMineralDescriptionHidden) {
    DOMElements.mineralDescriptionDiv.style.display = 'none';
  }

  pinStartScrollY = stickyGroupOriginalOffsetTop + containerTopRelativeToStickyGroup;
  chartFixedTopOffset = -containerTopRelativeToStickyGroup;

  const scrollPerCard = viewportHeight * SCROLL_PER_CARD_FACTOR;
  totalFixedScrollDuration = (STORES_DATA.length - 1) * scrollPerCard;
  pinEndScrollY = pinStartScrollY + totalFixedScrollDuration;

  const totalBodyPaddingBottom = totalFixedScrollDuration + stickyGroupHeight + DOMElements.finalScrollSpacer.offsetHeight + DOMElements.newsBottomDiv.offsetHeight;
  DOMElements.body.style.paddingBottom = `${totalBodyPaddingBottom}px`;

  DOMElements.cardsDiv.style.maxHeight = `${DOMElements.chartDiv.offsetHeight}px`;
}

/* Olay Dinleyicileri */
function handleScroll() {
  const scrollY = window.scrollY;

  const wrapperStyle = getComputedStyle(DOMElements.wrapper);
  const wrapperPaddingLeft = parseFloat(wrapperStyle.paddingLeft);
  const wrapperPaddingRight = parseFloat(wrapperStyle.paddingRight);
  const wrapperContentWidth = DOMElements.wrapper.offsetWidth - (wrapperPaddingLeft + wrapperPaddingRight);

  if (scrollY >= pinStartScrollY && scrollY < pinEndScrollY) {
    DOMElements.stickyGroup.style.position = 'fixed';
    DOMElements.stickyGroup.style.top = `${chartFixedTopOffset}px`;
    DOMElements.stickyGroup.style.left = '50%';
    DOMElements.stickyGroup.style.transform = 'translateX(-50%)';
    DOMElements.stickyGroup.style.width = `${wrapperContentWidth}px`;
  } else if (scrollY < pinStartScrollY) {
    DOMElements.stickyGroup.style.position = 'relative';
    DOMElements.stickyGroup.style.top = '0';
    DOMElements.stickyGroup.style.left = '0';
    DOMElements.stickyGroup.style.transform = 'none';
    DOMElements.stickyGroup.style.width = '100%';
  } else {
    DOMElements.stickyGroup.style.position = 'absolute';
    DOMElements.stickyGroup.style.top = `${pinEndScrollY + chartFixedTopOffset}px`;
    DOMElements.stickyGroup.style.left = '50%';
    DOMElements.stickyGroup.style.transform = 'translateX(-50%)';
    DOMElements.stickyGroup.style.width = `${wrapperContentWidth}px`;
  }

  if (!isScrollingByClick) {
    if (scrollY >= pinStartScrollY && scrollY < pinEndScrollY) {
        const scrollProgressInFixedSection = scrollY - pinStartScrollY;
        const progressRatio = scrollProgressInFixedSection / totalFixedScrollDuration;
        const newActiveIndex = Math.round(progressRatio * (STORES_DATA.length - 1));

        if (newActiveIndex >= 0 && newActiveIndex < STORES_DATA.length && currentActiveCardIndex !== newActiveIndex) {
            currentActiveCardIndex = newActiveIndex;
            updateChart(currentActiveCardIndex);
            updateCardActiveState(currentActiveCardIndex);
        }
    } else if (scrollY < pinStartScrollY) {
        if (currentActiveCardIndex !== 0) {
            currentActiveCardIndex = 0;
            updateChart(currentActiveCardIndex);
            updateCardActiveState(currentActiveCardIndex);
        }
    } else {
        if (currentActiveCardIndex !== STORES_DATA.length - 1) {
            currentActiveCardIndex = STORES_DATA.length - 1;
            updateChart(currentActiveCardIndex);
            updateCardActiveState(currentActiveCardIndex);
        }
    }
  }
}

function handleResize() {
  DOMElements.stickyGroup.style.position = 'relative';
  calculateFixedSection();
  handleScroll();
}

function setupEventListeners() {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
}

/* Başlangıç Fonksiyonu */
function init() {
  initializeCards();
  updateChart(0);

  setTimeout(() => {
    calculateFixedSection();
    currentActiveCardIndex = 0;
    updateCardActiveState(currentActiveCardIndex);
    handleScroll();
  }, 100);

  setupEventListeners();
}

window.addEventListener('load', init);