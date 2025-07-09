/* ------------------ VERİ ------------------ */
const stores=[
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
    {name:"Router",revenue:6300}]},
  {store:"Bimeks",products:[
    {name:"Akıllı Telefon",revenue:27400},{name:"Şarj Cihazı",revenue:11300},
    {name:"USB Bellek",revenue:7600},{name:"Tablet",revenue:15100},
    {name:"Klavye",revenue:8200}]},
  {store:"Hepsiburada",products:[
    {name:"Laptop",revenue:29900},{name:"SSD",revenue:18500},
    {name:"Powerbank",revenue:12200},{name:"Kulaklık",revenue:9100},
    {name:"Mouse",revenue:7300}]},
  {store:"Trendyol",products:[
    {name:"BT Kulaklık",revenue:20500},{name:"Tablet",revenue:18800},
    {name:"Akıllı Saat",revenue:13200},{name:"Klavye",revenue:8900},
    {name:"USB Bellek",revenue:5900}]},
  {store:"Amazon Türkiye",products:[
    {name:"Laptop",revenue:27600},{name:"Monitör",revenue:16900},
    {name:"Router",revenue:10100},{name:"Mouse",revenue:8400},
    {name:"Webcam",revenue:6900}]},
  {store:"İtopya",products:[
    {name:"Gaming Laptop",revenue:32500},{name:"Mekanik Klavye",revenue:14300},
    {name:"RGB Mouse",revenue:9700},{name:"Gaming Kulaklık",revenue:12900},
    {name:"SSD",revenue:11200}]},
  {store:"n11 Elektronik",products:[
    {name:"BT Hoparlör",revenue:12300},{name:"Tablet",revenue:19100},
    {name:"Kulaklık",revenue:8800},{name:"Şarj Cihazı",revenue:7500},
    {name:"Laptop",revenue:22200}]}
];

/* ------------------ DOM ------------------ */
const cardsDiv=document.getElementById('cards');
const barsDiv=document.getElementById('bars');
const storeNameH2=document.getElementById('storeName');
const chartDiv = document.getElementById('chart');

/* ------------------ Kartları ekle ------------------ */
stores.forEach(s=>{
  const c=document.createElement('div');
  c.className='card';c.textContent=s.store;
  cardsDiv.appendChild(c);
});
const cards=[...document.querySelectorAll('.card')];

/* ------------------ Grafik ------------------ */
function updateChart(idx){
  const {store,products}=stores[idx];
  storeNameH2.textContent=store;
  barsDiv.innerHTML='';
  const max=Math.max(...products.map(p=>p.revenue));
  
  // Çubukları sırala (en yüksekten en düşüğe) ve oluştur
  products.sort((a,b)=>b.revenue-a.revenue).forEach((p, i)=>{
    const barItem = document.createElement('div');
    barItem.className = 'bar-item';

    const barLabel = document.createElement('div');
    barLabel.className = 'bar-label';
    barLabel.textContent = p.name;
    barItem.appendChild(barLabel);

    const barTrack = document.createElement('div');
    barTrack.className = 'bar-track';

    const bar = document.createElement('div');
    bar.className='bar';
    // Animasyon başlamadan önce genişliği sıfırla
    bar.style.width = '0%'; 
    
    const barValueSpan = document.createElement('span');
    barValueSpan.className = 'bar-value';
    barValueSpan.textContent = `₺${p.revenue.toLocaleString('tr-TR')}`;

    bar.appendChild(barValueSpan);

    barTrack.appendChild(bar);
    barItem.appendChild(barTrack);

    barsDiv.appendChild(barItem);

    // Animasyonu gecikmeli başlat
    setTimeout(() => {
        bar.style.width = (p.revenue/max*100) + '%';
        bar.setAttribute('data-animated', 'true'); // Animasyon bitti bayrağı
    }, 100 + i * 150); // Her bar için hafif gecikme
  });
}

/* ------------------ Kaydırma Takibi ve Kart Güncelleme ------------------ */
function onScroll(){
  let bestIndex = 0;
  let maxVisibleRatio = 0; 
  const chartStickyOffset = 25; // chart'ın top değeri güncellendi

  cards.forEach((card, i) => {
    const cardRect = card.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    if (cardRect.top < viewportHeight && cardRect.bottom > 0) {
      const effectiveTop = Math.max(chartStickyOffset, cardRect.top);
      const effectiveBottom = Math.min(viewportHeight, cardRect.bottom);
      const visibleHeightInStickyArea = effectiveBottom - effectiveTop;
      
      const currentCardRatio = visibleHeightInStickyArea / cardRect.height;

      if (currentCardRatio > maxVisibleRatio) {
        maxVisibleRatio = currentCardRatio;
        bestIndex = i;
      }
    }
  });

  // Sadece aktif kart değiştiğinde grafiği güncelle
  if (currentActiveCardIndex !== bestIndex) {
      currentActiveCardIndex = bestIndex;
      updateChart(currentActiveCardIndex);
  }
}

let currentActiveCardIndex = -1; // Aktif kartı takip etmek için

// Başlangıçta ilk kartı göster
updateChart(0);
currentActiveCardIndex = 0; // Başlangıç indeksini ayarla

// Sadece window'un kaydırma olayını dinle
window.addEventListener('scroll', onScroll);

// Sayfa yüklendiğinde de bir kere kontrol et
window.addEventListener('load', onScroll);