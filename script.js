/* ------------------ VERİ ------------------ */
const stores = [
  {store:"TeknoSA",products:[
    {name:"Laptop",revenue:24500},{name:"Kulaklık",revenue:18200},
    {name:"Klavye",revenue:9700},{name:"Mouse",revenue:8600},
    {name:"Powerbank",revenue:6200}]},
  {store:"Vatan Bilgisayar",products:[
    {name:"Masaüstü PC",revenue:21000},{name:"Monitör",revenue:17500},
    {name:"SSD",revenue:11200},{name:"Klavye",revenue:9100},
    {name:"Hoparlör",revenue:6900}]},
  {store:"MediaMarkt",products:[
    {name:"Tablet",revenue:19800},{name:"BT Kulaklık",revenue:17600},
    {name:"Smartwatch",revenue:15300},{name:"Powerbank",revenue:9700},
    {name:"Laptop",revenue:23300}]},
  {store:"Gold Teknoloji",products:[
    {name:"Laptop",revenue:22100},{name:"Webcam",revenue:8800},
    {name:"Klavye",revenue:7200},{name:"Mousepad",revenue:4400},
    {name:"Router",revenue:6300}]}
];

/* ------------------ DOM Elemanları ------------------ */
const cardsDiv = document.getElementById('cards');
const barsDiv = document.getElementById('bars');
const storeNameH2 = document.getElementById('storeName');
const chartDiv = document.getElementById('chart');
const newsTopDiv = document.getElementById('news-top');
const container = document.getElementById('container');
const newsBottomDiv = document.getElementById('news-bottom');
const stickyGroup = document.getElementById('sticky-group');
const finalScrollSpacer = document.getElementById('final-scroll-spacer');
const wrapper = document.querySelector('.wrapper');
const body = document.body;

/* ------------------ Kartları DOM'a Ekle ------------------ */
stores.forEach(s => {
  const c = document.createElement('div');
  c.className = 'card';
  c.textContent = s.store;
  cardsDiv.appendChild(c);
});
const cards = [...document.querySelectorAll('.card')];

/* ------------------ Aktif Kart Stilini Güncelle ------------------ */
function updateCardActiveState(activeIndex) {
  cards.forEach((card, i) => {
    if (i === activeIndex) {
      card.classList.add('active-card');
    } else {
      card.classList.remove('active-card');
    }
  });
}

/* ------------------ Grafik Güncelleme Fonksiyonu ------------------ */
function updateChart(idx) {
  if (idx < 0 || idx >= stores.length) return; // Geçersiz indeks kontrolü
  const { store, products } = stores[idx];
  storeNameH2.textContent = store;
  barsDiv.innerHTML = '';
  const max = Math.max(...products.map(p => p.revenue));

  products.sort((a, b) => b.revenue - a.revenue).forEach((p, i) => {
    const barItem = document.createElement('div');
    barItem.className = 'bar-item';

    const barLabel = document.createElement('div');
    barLabel.className = 'bar-label';
    barLabel.textContent = p.name;
    barItem.appendChild(barLabel);

    const barTrack = document.createElement('div');
    barTrack.className = 'bar-track';

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.width = '0%'; // Animasyon için başlangıç değeri

    const barValueSpan = document.createElement('span');
    barValueSpan.className = 'bar-value';
    barValueSpan.textContent = `₺${p.revenue.toLocaleString('tr-TR')}`;

    bar.appendChild(barValueSpan);
    barTrack.appendChild(bar);
    barItem.appendChild(barTrack);
    barsDiv.appendChild(barItem);

    // Animasyonu gecikmeli başlat
    setTimeout(() => {
      bar.style.width = (p.revenue / max * 100) + '%';
      bar.setAttribute('data-animated', 'true');
    }, 100 + i * 150);
  });
}

/* ------------------ Sabitleme ve Kaydırma Hesaplamaları ------------------ */
let currentActiveCardIndex = -1;
let stickyGroupOriginalOffsetTop = 0;
let stickyGroupHeight = 0;
let chartFixedTopOffset = 0; // Grafiğin ekranın tepesine göre sabitleneceği offset
let totalFixedScrollDuration = 0; // Toplam kaydırma süresi
let pinStartScrollY = 0; // sticky-group'un sabitlenmeye başlayacağı kaydırma noktası
let pinEndScrollY = 0;    // sticky-group'un sabitlenmesinin biteceği kaydırma noktası

function calculateFixedSection() {
  const viewportHeight = window.innerHeight;

  // Geçici olarak relative yapıp gerçek pozisyonunu ve boyutunu alalım
  stickyGroup.style.position = 'relative';
  stickyGroup.style.top = 'auto';
  stickyGroup.style.left = 'auto';
  stickyGroup.style.transform = 'none'; // Transform'u sıfırla

  stickyGroupOriginalOffsetTop = stickyGroup.offsetTop;
  stickyGroupHeight = stickyGroup.offsetHeight;

  const newsTopHeight = newsTopDiv.offsetHeight;
  const containerOnlyHeight = container.offsetHeight; // Grafik ve kartları içeren div

  // Grafik (container) ekranın dikey ortasına gelsin istiyoruz.
  // stickyGroup'un top değeri, newsTop'un yüksekliği çıkarıldıktan sonra
  // container'ın ortalanmasını sağlayacak şekilde ayarlanır.
  chartFixedTopOffset = (viewportHeight / 2) - (newsTopHeight + (containerOnlyHeight / 2));

  // fixedTopOffset negatif olamaz (ekranın dışına çıkmamalı)
  if (chartFixedTopOffset < 0) {
    chartFixedTopOffset = 0;
  }

  // sticky-group'un sabitlenmeye başlayacağı kaydırma noktası
  pinStartScrollY = stickyGroupOriginalOffsetTop - chartFixedTopOffset;
  if (pinStartScrollY < 0) pinStartScrollY = 0; // Eksi olamaz

  // Her bir kart değişimi için kaydırma alanı (örneğin 1 viewport yüksekliği)
  const scrollPerCard = viewportHeight; // Her kart geçişi için tam ekran kaydırma

  // Toplam sabitlenme süresi (son kartın da tam gösterilmesi için)
  // Mağaza sayısı (stores.length) - 1, çünkü 0'dan başlıyor ve son karta kadar kaydırma gerekiyor.
  totalFixedScrollDuration = (stores.length - 1) * scrollPerCard;

  // sticky-group'un sabitlenmesinin biteceği kaydırma noktası
  pinEndScrollY = pinStartScrollY + totalFixedScrollDuration;

  // body'ye dinamik padding-bottom ekleyerek kaydırma çubuğunu uzat
  // stickyGroupHeight: sabitlenen elemanın kendi yüksekliği.
  // finalScrollSpacer.offsetHeight: en alttaki boşluk elemanının yüksekliği.
  body.style.paddingBottom = `${totalFixedScrollDuration + stickyGroupHeight + finalScrollSpacer.offsetHeight}px`;

  console.log("--- Recalculating Fixed Section ---");
  console.log("newsTopHeight:", newsTopHeight);
  console.log("containerOnlyHeight:", containerOnlyHeight);
  console.log("stickyGroupOriginalOffsetTop:", stickyGroupOriginalOffsetTop);
  console.log("stickyGroupHeight (total):", stickyGroupHeight);
  console.log("chartFixedTopOffset (stickyGroup):", chartFixedTopOffset);
  console.log("pinStartScrollY:", pinStartScrollY);
  console.log("totalFixedScrollDuration:", totalFixedScrollDuration);
  console.log("pinEndScrollY:", pinEndScrollY);
  console.log("Body padding-bottom:", body.style.paddingBottom);
}


function onScroll() {
  const scrollY = window.scrollY;
  const wrapperLeftOffset = wrapper.offsetLeft + parseFloat(getComputedStyle(wrapper).paddingLeft);
  const wrapperContentWidth = wrapper.offsetWidth - (parseFloat(getComputedStyle(wrapper).paddingLeft) + parseFloat(getComputedStyle(wrapper).paddingRight));

  // --- stickyGroup Sabitleme Mantığı ---
  if (scrollY >= pinStartScrollY && scrollY < pinEndScrollY) {
    // Sabitlenme aşamasında
    stickyGroup.style.position = 'fixed';
    stickyGroup.style.top = `${chartFixedTopOffset}px`;
    stickyGroup.style.left = `${wrapperLeftOffset}px`;
    stickyGroup.style.transform = `none`;
    stickyGroup.style.width = `${wrapperContentWidth}px`;

    // Kart değişimini tetikle - SADECE grafik ortadayken ve sabitlenme devam ederken
    // Kaydırma ilerlemesini hesapla
    const scrollProgressInFixedSection = scrollY - pinStartScrollY;
    const progressRatio = scrollProgressInFixedSection / totalFixedScrollDuration; // 0'dan 1'e

    // İndeksi hesapla ve Yuvarla
    const newActiveIndex = Math.round(progressRatio * (stores.length - 1));

    if (newActiveIndex >= 0 && newActiveIndex < stores.length && currentActiveCardIndex !== newActiveIndex) {
      currentActiveCardIndex = newActiveIndex;
      updateChart(currentActiveCardIndex);
      updateCardActiveState(currentActiveCardIndex);
    }

  } else if (scrollY < pinStartScrollY) {
    // Sabitlenme başlamadan önce (yukarıda)
    stickyGroup.style.position = 'relative';
    stickyGroup.style.top = '0';
    stickyGroup.style.left = '0';
    stickyGroup.style.transform = 'none';
    stickyGroup.style.width = '100%';

    // En başa dönünce ilk kartı göster
    if (currentActiveCardIndex !== 0) {
      currentActiveCardIndex = 0;
      updateChart(currentActiveCardIndex);
      updateCardActiveState(currentActiveCardIndex);
    }

  } else {
    // Sabitlenme bittikten sonra (aşağıda)
    stickyGroup.style.position = 'relative';
    // stickyGroup'un 'top' değeri, sabitlendiği noktadan sonra nereye düşeceğini belirler.
    // Başlangıç offsetTop'una, sabitlenme süresi boyunca kaydedilen mesafeyi ekleriz,
    // ve sonra sabitlenme için kullanılan chartFixedTopOffset'ı çıkarırız.
    // Bu, elementin "fixed" konumdan "relative" konuma geçişini pürüzsüzleştirir.
    stickyGroup.style.top = `${(pinEndScrollY + chartFixedTopOffset) - stickyGroupOriginalOffsetTop}px`;
    stickyGroup.style.left = '0';
    stickyGroup.style.transform = 'none';
    stickyGroup.style.width = '100%';

    // En sona inince son kartı göster
    if (currentActiveCardIndex !== stores.length - 1) {
      currentActiveCardIndex = stores.length - 1;
      updateChart(currentActiveCardIndex);
      updateCardActiveState(currentActiveCardIndex);
    }
  }
}

// Başlangıçta ve pencere boyutu değiştiğinde hesaplamaları yap
window.addEventListener('load', () => {
  // Başlangıçta elemanların normal akışta olduğundan emin ol
  stickyGroup.style.position = 'relative';
  newsBottomDiv.style.position = 'relative';
  calculateFixedSection();
  updateChart(0); // İlk kartı yükle
  currentActiveCardIndex = 0;
  updateCardActiveState(currentActiveCardIndex);
  onScroll(); // Sayfa yüklendiğinde bir kere çalıştır
});

window.addEventListener('resize', () => {
  // Yeniden boyutlandırmada pozisyonları sıfırla ve yeniden hesapla
  stickyGroup.style.position = 'relative';
  newsBottomDiv.style.position = 'relative';
  calculateFixedSection();
  onScroll(); // Yeniden hesapladıktan sonra mevcut kaydırma konumuna göre pozisyonla
});

window.addEventListener('scroll', onScroll);