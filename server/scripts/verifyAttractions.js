const path = require('path');
const destinations = require(path.resolve(__dirname, '..', 'data', 'destinations.js'));
const attractions = require(path.resolve(__dirname, '..', 'data', 'attractions.js'));
const normalized = x => String(x || '').trim().toLocaleLowerCase('en');
const seenIds = new Set(), seenNames = new Set(); let duplicates = 0;
for (const a of attractions) {
 const id = normalized(a.id), key = normalized(a.destination) + '::' + normalized(a.name);
 if (seenIds.has(id) || seenNames.has(key)) { console.log('Duplicate:', a.destination, a.name); duplicates++; }
 seenIds.add(id); seenNames.add(key);
}
const names = destinations.map(d => typeof d === 'string' ? d : d.name);
let low = 0;
for (const name of names) {
 const count = attractions.filter(a => normalized(a.destination) === normalized(name)).length;
 console.log(name + ': ' + count);
 if (count < 10) low++;
}
console.log('Destination count:', names.length);
console.log('Attraction count:', attractions.length);
console.log('Destinations below 10:', low);
console.log('Duplicates:', duplicates);
if (low || duplicates) process.exitCode = 1;
