// balanced random product header
const productPairs = [
  {type:'Electronics', cost:30},
  {type:'Fashion', cost:40},
  {type:'Pharmacy', cost:20},
  {type:'Electronics', cost:50},
  {type:'Fashion', cost:30},
  {type:'Pharmacy', cost:40}
];
const pair = productPairs[Math.floor(Math.random() * 6)];
document.getElementById('productHeader').innerHTML =
  `Product type: <strong>${pair.type}</strong> | Cost: <strong>€${pair.cost}</strong>`;
