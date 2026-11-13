const hotels = [
  {
    "id": "hotel001",
    "image": "https://cache.marriott.com/content/dam/marriott-renditions/HYDLK/hydlk-exterior-8197-hor-clsc.jpg?downsize=1215px%3A%2A&interpolation=progressive-bilinear&output-quality=70",
    "name": "ITC Kohenur",
    "destination": "Hyderabad",
    "countryCode": "IN",
    "address": "HITEC City, Madhapur, Hyderabad, Telangana",
    "location": {
      "latitude": 17.4254,
      "longitude": 78.3756
    },
    "description": "A luxury hotel in HITEC City with premium rooms, dining and leisure facilities.",
    "price": {
      "amount": 12000,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Swimming Pool",
      "Restaurant",
      "Spa",
      "Fitness Centre"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true
  },
  {
    "id": "hotel002",
    "image": "https://y.cdrst.com/foto/hotel-sf/54303/granderesp/trident-hyderabad-exterior-146799a8.jpg",
    "name": "Trident Hyderabad",
    "destination": "Hyderabad",
    "countryCode": "IN",
    "address": "HITEC City, Hyderabad, Telangana",
    "location": {
      "latitude": 17.4504,
      "longitude": 78.3808
    },
    "description": "A luxury hotel located in the HITEC City business district.",
    "price": {
      "amount": 11000,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Swimming Pool",
      "Restaurant",
      "Spa",
      "Fitness Centre"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true
  },
  {
    "id": "hotel003",
    "image": "https://www.travenix.com/wp-content/uploads/2023/12/ITC-Kakatiya.jpg",
    "name": "ITC Kakatiya",
    "destination": "Hyderabad",
    "countryCode": "IN",
    "address": "Begumpet, Hyderabad, Telangana",
    "location": {
      "latitude": 17.4435,
      "longitude": 78.4616
    },
    "description": "An established luxury hotel in the Begumpet area of Hyderabad.",
    "price": {
      "amount": 9500,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Swimming Pool",
      "Restaurant",
      "Spa",
      "Fitness Centre"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true
  },
  {
    "id": "hotel004",
    "image": "https://r1imghtlak.mmtcdn.com/fd7f110cbb7311ee89f90a58a9feac02.jpg",
    "name": "Taj Krishna",
    "destination": "Hyderabad",
    "countryCode": "IN",
    "address": "Banjara Hills, Hyderabad, Telangana",
    "location": {
      "latitude": 17.4156,
      "longitude": 78.4484
    },
    "description": "A luxury hotel in Banjara Hills with accommodation and dining facilities.",
    "price": {
      "amount": 10000,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Swimming Pool",
      "Restaurant",
      "Spa",
      "Fitness Centre"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true
  },
  {
    "id": "hotel009",
    "name": "New Hotel Suhail",
    "destination": "Hyderabad",
    "countryCode": "IN",
    "address": "4-1-527, Troop Bazaar, behind G.P.O, Abids, Hyderabad",
    "location": {
      "latitude": 17.38688,
      "longitude": 78.47736
    },
    "description": "A centrally located hotel in the Abids area of Hyderabad.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Parking",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/35/ea/25/caption.jpg?h=1200&s=1&w=1200"
  },
  {
    "id": "hotel010",
    "name": "Royalton Hotel",
    "destination": "Hyderabad",
    "countryCode": "IN",
    "address": "5-9-208/2, Chirag Ali Lane, Abids, Hyderabad",
    "location": {
      "latitude": 17.393211,
      "longitude": 78.4735
    },
    "description": "A centrally located hotel in the Abids area of Hyderabad.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Fitness Centre"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.royaltonhotel.in/images/gallery/small/royaltonpic-s-20.jpg"
  },
  {
    "id": "hotel011",
    "name": "Hyderabad Marriott Hotel & Convention Centre",
    "destination": "Hyderabad",
    "countryCode": "IN",
    "address": "Tank Bund Road, opposite Hussain Sagar Lake, Hyderabad",
    "location": {
      "latitude": 17.424608,
      "longitude": 78.4868128
    },
    "description": "A luxury hotel overlooking Hussain Sagar Lake with dining and convention facilities.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Swimming Pool",
      "Restaurant",
      "Spa",
      "Fitness Centre"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://cache.marriott.com/content/dam/marriott-renditions/HYDMC/hydmc-exterior-9852-hor-wide.jpg?downsize=375px%3A%2A&interpolation=progressive-bilinear&output-quality=70"
  },
  {
    "id": "hotel005",
    "image": "https://www.itchotels.com/content/dam/itchotels/in/umbrella/itc/hotels/itcgrandgoa-goa/gallery/overview/resort-exterior.png",
    "name": "ITC Grand Goa",
    "destination": "Goa",
    "countryCode": "IN",
    "address": "Arossim Beach, Cansaulim, Goa",
    "location": {
      "latitude": 15.3077,
      "longitude": 73.9095
    },
    "description": "A luxury beachfront resort in South Goa.",
    "price": {
      "amount": 14000,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Swimming Pool",
      "Restaurant",
      "Spa",
      "Beach Access"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true
  },
  {
    "id": "hotel006",
    "image": "https://weddingsutra.com/images/Vendor_Images/Venues/hyatt-goa/hyatt-goa-10.jpg",
    "name": "Grand Hyatt Goa",
    "destination": "Goa",
    "countryCode": "IN",
    "address": "Bambolim, Goa",
    "location": {
      "latitude": 15.4636,
      "longitude": 73.8567
    },
    "description": "A luxury resort overlooking Bambolim Bay.",
    "price": {
      "amount": 13000,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Swimming Pool",
      "Restaurant",
      "Spa",
      "Fitness Centre"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true
  },
  {
    "id": "hotel007",
    "image": "https://media-cdn.tripadvisor.com/media/photo-s/0f/51/c6/47/street--v16174569.jpg",
    "name": "Vivanta Goa, Panaji",
    "destination": "Goa",
    "countryCode": "IN",
    "address": "Panaji, Goa",
    "location": {
      "latitude": 15.4989,
      "longitude": 73.8278
    },
    "description": "A premium hotel located in the city of Panaji.",
    "price": {
      "amount": 7500,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Fitness Centre"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true
  },
  {
    "id": "hotel008",
    "image": "https://cache.marriott.com/marriottassets/marriott/GOIMC/goimc-exterior-3043-hor-feat.jpg",
    "name": "Goa Marriott Resort & Spa",
    "destination": "Goa",
    "countryCode": "IN",
    "address": "Miramar, Panaji, Goa",
    "location": {
      "latitude": 15.4815,
      "longitude": 73.8078
    },
    "description": "A waterfront resort in the Miramar area of Panaji.",
    "price": {
      "amount": 12000,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Swimming Pool",
      "Restaurant",
      "Spa",
      "Fitness Centre"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true
  },
  {
    "id": "hotel012",
    "name": "Vivanta Dal View",
    "destination": "Kashmir",
    "countryCode": "IN",
    "address": "Kralsangri, Srinagar, Jammu and Kashmir",
    "location": {
      "latitude": 34.0867,
      "longitude": 74.876
    },
    "description": "Accommodation option in Kashmir. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://images.trvl-media.com/lodging/5000000/4590000/4584300/4584283/9e9407f2.jpg?impolicy=resizecrop&ra=fill&rh=575&rw=575"
  },
  {
    "id": "hotel013",
    "name": "The Lalit Grand Palace Srinagar",
    "destination": "Kashmir",
    "countryCode": "IN",
    "address": "Gupkar Road, Srinagar, Jammu and Kashmir",
    "location": {
      "latitude": 34.0795,
      "longitude": 74.884
    },
    "description": "Accommodation option in Kashmir. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://hblimg.mmtcdn.com/content/hubble/img/srinagar/mmt/activities/m_activities_srinagar_the_lalit_grand_palace_1_l_562_842.jpg"
  },
  {
    "id": "hotel014",
    "name": "The Grand Dragon Ladakh",
    "destination": "Ladakh",
    "countryCode": "IN",
    "address": "Old Road, Leh, Ladakh",
    "location": {
      "latitude": 34.1642,
      "longitude": 77.5847
    },
    "description": "Accommodation option in Ladakh. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.thegranddragonladakh.com/assets/new-img/rooms/premier-heritage/1.jpg"
  },
  {
    "id": "hotel015",
    "name": "Hotel Singge Palace",
    "destination": "Ladakh",
    "countryCode": "IN",
    "address": "Fort Road, Leh, Ladakh",
    "location": {
      "latitude": 34.1658,
      "longitude": 77.584
    },
    "description": "Accommodation option in Ladakh. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.singgepalace.com/accomodation-in-leh/img/facade1.jpg"
  },
  {
    "id": "hotel016",
    "name": "The Himalayan",
    "destination": "Manali",
    "countryCode": "IN",
    "address": "Hadimba Road, Manali, Himachal Pradesh",
    "location": {
      "latitude": 32.2497,
      "longitude": 77.181
    },
    "description": "Accommodation option in Manali. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://thehimalayan.com/wp-content/uploads/2013/11/evo-december-2018-cover-the-himalayan-manali.jpg"
  },
  {
    "id": "hotel017",
    "name": "ManuAllaya Resort Spa",
    "destination": "Manali",
    "countryCode": "IN",
    "address": "Sunny Side, Chadiyari, Manali, Himachal Pradesh",
    "location": {
      "latitude": 32.2515,
      "longitude": 77.1838
    },
    "description": "Accommodation option in Manali. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://media.dpauls.com/drive-server/images/packages/india/manali/ManuAllaya-Exterior-Winter-View.jpg"
  },
  {
    "id": "hotel018",
    "name": "The Oberoi Cecil",
    "destination": "Shimla",
    "countryCode": "IN",
    "address": "Chaura Maidan, Shimla, Himachal Pradesh",
    "location": {
      "latitude": 31.1005,
      "longitude": 77.164
    },
    "description": "Accommodation option in Shimla. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.oberoihotels.com/-/media/oberoi-hotel/the-oberoi-cecil/Overview-new/banner-images/desktop1920x980/banner1.jpg"
  },
  {
    "id": "hotel019",
    "name": "Hotel Willow Banks",
    "destination": "Shimla",
    "countryCode": "IN",
    "address": "The Mall, Shimla, Himachal Pradesh",
    "location": {
      "latitude": 31.1048,
      "longitude": 77.1712
    },
    "description": "Accommodation option in Shimla. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://static.toiimg.com/photo/66695176/Hotel-Willow-Banks.jpg?resize=4&width=748"
  },
  {
    "id": "hotel020",
    "name": "Rambagh Palace",
    "destination": "Jaipur",
    "countryCode": "IN",
    "address": "Bhawani Singh Road, Jaipur, Rajasthan",
    "location": {
      "latitude": 26.9124,
      "longitude": 75.7873
    },
    "description": "Accommodation option in Jaipur. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://res.cloudinary.com/lusso-travel/image/upload/q_100%2Cw_980/4919-hotel-rambagh-palace"
  },
  {
    "id": "hotel021",
    "name": "ITC Rajputana",
    "destination": "Jaipur",
    "countryCode": "IN",
    "address": "Palace Road, Jaipur, Rajasthan",
    "location": {
      "latitude": 26.922,
      "longitude": 75.801
    },
    "description": "Accommodation option in Jaipur. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://cache.marriott.com/content/dam/marriott-renditions/JAILC/jailc-exterior-6607-hor-feat.jpg?downsize=1920px%3A%2A&interpolation=progressive-bilinear&output-quality=70"
  },
  {
    "id": "hotel022",
    "name": "The Oberoi Amarvilas",
    "destination": "Agra",
    "countryCode": "IN",
    "address": "Taj East Gate Road, Agra, Uttar Pradesh",
    "location": {
      "latitude": 27.168,
      "longitude": 78.0422
    },
    "description": "Accommodation option in Agra. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.wildfrontierstravel.com/media/cache/driver/upload/mirror/dhruv-wildfrontierstravel-com/630f6cea_002TheOberoiAmarvilasAgraExterior2.jpeg"
  },
  {
    "id": "hotel023",
    "name": "ITC Mughal",
    "destination": "Agra",
    "countryCode": "IN",
    "address": "Fatehabad Road, Agra, Uttar Pradesh",
    "location": {
      "latitude": 27.1574,
      "longitude": 78.05
    },
    "description": "Accommodation option in Agra. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://r1imghtlak.ibcdn.com/3fe643f8f52311e7bb4e0a4cef95d023.jpg"
  },
  {
    "id": "hotel024",
    "name": "The Imperial New Delhi",
    "destination": "Delhi",
    "countryCode": "IN",
    "address": "Janpath, New Delhi",
    "location": {
      "latitude": 28.6258,
      "longitude": 77.219
    },
    "description": "Accommodation option in Delhi. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://indulgedtraveler.com/wp-content/uploads/2019/05/64758951.jpg"
  },
  {
    "id": "hotel025",
    "name": "The Leela Palace New Delhi",
    "destination": "Delhi",
    "countryCode": "IN",
    "address": "Diplomatic Enclave, Chanakyapuri, New Delhi",
    "location": {
      "latitude": 28.579,
      "longitude": 77.189
    },
    "description": "Accommodation option in Delhi. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://static.travelated.com/storage/hotels/s1/898/89838191381.webp?format=webp&mode=crop&scale=down&w=3840&webp.quality=75"
  },
  {
    "id": "hotel026",
    "name": "BrijRama Palace",
    "destination": "Varanasi",
    "countryCode": "IN",
    "address": "Darbhanga Ghat, Varanasi, Uttar Pradesh",
    "location": {
      "latitude": 25.303,
      "longitude": 83.006
    },
    "description": "Accommodation option in Varanasi. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://static.prod.r53.tablethotels.com/media/ecs/global/magazine/story-images/20220319/BrijRama.jpg"
  },
  {
    "id": "hotel027",
    "name": "Taj Ganges Varanasi",
    "destination": "Varanasi",
    "countryCode": "IN",
    "address": "Nadesar Palace Grounds, Varanasi, Uttar Pradesh",
    "location": {
      "latitude": 25.336,
      "longitude": 82.987
    },
    "description": "Accommodation option in Varanasi. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/0e8936cf5ea63c56b7a1e2024ce684ff151ab577-2880x1395.jpg?auto=format&dpr=2&w=480"
  },
  {
    "id": "hotel028",
    "name": "Kumarakom Lake Resort",
    "destination": "Kerala",
    "countryCode": "IN",
    "address": "Kumarakom, Kottayam, Kerala",
    "location": {
      "latitude": 9.617,
      "longitude": 76.43
    },
    "description": "Accommodation option in Kerala. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.kumarakomlakeresort.in/assets/images/luxury-accommodation/heritage-villas/gallery/heritage-villas-7.jpg"
  },
  {
    "id": "hotel029",
    "name": "Taj Bekal Resort & Spa",
    "destination": "Kerala",
    "countryCode": "IN",
    "address": "Kappil Beach, Bekal, Kerala",
    "location": {
      "latitude": 12.391,
      "longitude": 75.04
    },
    "description": "Accommodation option in Kerala. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://keralaconnections.co.uk/wp-content/uploads/2021/07/Taj-Bekal-Bekal-Northern-Beaches-Kerala-Icon.jpg"
  },
  {
    "id": "hotel030",
    "name": "Fragrant Nature Munnar",
    "destination": "Munnar",
    "countryCode": "IN",
    "address": "Pothamedu, Munnar, Kerala",
    "location": {
      "latitude": 10.075,
      "longitude": 77.06
    },
    "description": "Accommodation option in Munnar. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://media1.thrillophilia.com/filestore/mq9uvh7bisfhtwn73x0h89tqj2j5_fragnant4.png?h=650&w=576"
  },
  {
    "id": "hotel031",
    "name": "Blanket Hotel & Spa",
    "destination": "Munnar",
    "countryCode": "IN",
    "address": "Attukad Waterfall Road, Munnar, Kerala",
    "location": {
      "latitude": 10.055,
      "longitude": 77.064
    },
    "description": "Accommodation option in Munnar. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.kayak.com/rimg/himg/a1/23/1a/expedia_group-2785166-8e221a-808245.jpg?crop=true&height=607&width=836"
  },
  {
    "id": "hotel032",
    "name": "Savoy - IHCL SeleQtions",
    "destination": "Ooty",
    "countryCode": "IN",
    "address": "Sylks Road, Ooty, Tamil Nadu",
    "location": {
      "latitude": 11.407,
      "longitude": 76.701
    },
    "description": "Accommodation option in Ooty. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://cdn.audleytravel.com/1050/750/79/42231-flora-superior-rooms-savoy-hotel-ooty.jpg"
  },
  {
    "id": "hotel033",
    "name": "Sterling Ooty Elk Hill",
    "destination": "Ooty",
    "countryCode": "IN",
    "address": "Ramalingam Road, Ooty, Tamil Nadu",
    "location": {
      "latitude": 11.41,
      "longitude": 76.7
    },
    "description": "Accommodation option in Ooty. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://photos.bringfido.com/lodging/8/4/5/43548/43548_49811031.jpg?density=2x&size=slide"
  },
  {
    "id": "hotel034",
    "name": "Radisson Blu Plaza Hotel Mysore",
    "destination": "Mysuru",
    "countryCode": "IN",
    "address": "Maharana Pratap Road, Mysuru, Karnataka",
    "location": {
      "latitude": 12.305,
      "longitude": 76.659
    },
    "description": "Accommodation option in Mysuru. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://r1imghtlak.mmtcdn.com/7a046364daed11e5a607001ec9b85d13.jpg"
  },
  {
    "id": "hotel035",
    "name": "Southern Star Mysore",
    "destination": "Mysuru",
    "countryCode": "IN",
    "address": "Vinoba Road, Mysuru, Karnataka",
    "location": {
      "latitude": 12.307,
      "longitude": 76.646
    },
    "description": "Accommodation option in Mysuru. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://southernstarmysore1mysore.in-hotel.net/data/Pics/OriginalPhoto/17057/1705742/1705742928/southern-star-mysore-mysore-pic-4.JPEG"
  },
  {
    "id": "hotel036",
    "name": "Evolve Back Hampi",
    "destination": "Hampi",
    "countryCode": "IN",
    "address": "Kampli Road, Hampi, Karnataka",
    "location": {
      "latitude": 15.27,
      "longitude": 76.48
    },
    "description": "Accommodation option in Hampi. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://assets.simplotel.com/simplotel/image/upload/x_0%2Cy_6%2Cw_2400%2Ch_1350%2Cr_0%2Cc_crop/q_95%2Cw_900%2Cdpr_1%2Cf_auto%2Cfl_progressive%2Cc_limit/evolve-back-hampi/resort-facade-night"
  },
  {
    "id": "hotel037",
    "name": "Hyatt Place Hampi",
    "destination": "Hampi",
    "countryCode": "IN",
    "address": "Vidyanagar Township, Toranagallu, Karnataka",
    "location": {
      "latitude": 15.17,
      "longitude": 76.625
    },
    "description": "Accommodation option in Hampi. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2018/08/08/1432/HBXZH-P014-Exterior-Lawn-Dusk.jpg/HBXZH-P014-Exterior-Lawn-Dusk.16x9.jpg?imwidth=1920"
  },
  {
    "id": "hotel038",
    "name": "Taj Coromandel",
    "destination": "Chennai",
    "countryCode": "IN",
    "address": "Nungambakkam, Chennai, Tamil Nadu",
    "location": {
      "latitude": 13.06,
      "longitude": 80.249
    },
    "description": "Accommodation option in Chennai. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.beyondyatra.com/assets/images/imgtg/chennai/acc/taj_coromandel_chennai___.jpg"
  },
  {
    "id": "hotel039",
    "name": "The Leela Palace Chennai",
    "destination": "Chennai",
    "countryCode": "IN",
    "address": "Adyar Seaface, Chennai, Tamil Nadu",
    "location": {
      "latitude": 13.01,
      "longitude": 80.27
    },
    "description": "Accommodation option in Chennai. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.theleela.com/prod/content/assets/2026-01/leela-chennai-5-star-hotel.webp"
  },
  {
    "id": "hotel040",
    "name": "Evolve Back Coorg",
    "destination": "Coorg",
    "countryCode": "IN",
    "address": "Siddapur, Kodagu, Karnataka",
    "location": {
      "latitude": 12.397,
      "longitude": 75.85
    },
    "description": "Accommodation option in Coorg. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://extranet.traveldhamaka.com/assets/property-photo/EVOLVE%20BACK%2C%20COORG-EVOLVE%20BACK-try66t5.JPG"
  },
  {
    "id": "hotel041",
    "name": "The Tamara Coorg",
    "destination": "Coorg",
    "countryCode": "IN",
    "address": "Yavakapadi, Kodagu, Karnataka",
    "location": {
      "latitude": 12.22,
      "longitude": 75.72
    },
    "description": "Accommodation option in Coorg. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://assets.cntraveller.in/photos/667907887542e46e7ef43151/16%3A9/w_1280%2Cc_limit/Coorg%20%283%29%20%281%29.jpg"
  },
  {
    "id": "hotel042",
    "name": "The Oberoi Grand Kolkata",
    "destination": "Kolkata",
    "countryCode": "IN",
    "address": "Jawaharlal Nehru Road, Kolkata, West Bengal",
    "location": {
      "latitude": 22.563,
      "longitude": 88.351
    },
    "description": "Accommodation option in Kolkata. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://dreamofacity.com/wp-content/uploads/2016/12/1-oberoi-grand-hotel-exterior-viewed-along-chowringhee-road.jpg"
  },
  {
    "id": "hotel043",
    "name": "ITC Royal Bengal",
    "destination": "Kolkata",
    "countryCode": "IN",
    "address": "EM Bypass, Kolkata, West Bengal",
    "location": {
      "latitude": 22.544,
      "longitude": 88.397
    },
    "description": "Accommodation option in Kolkata. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.lionelindia.com/holidays/assets/images/slide2.jpg"
  },
  {
    "id": "hotel044",
    "name": "Mayfair Darjeeling",
    "destination": "Darjeeling",
    "countryCode": "IN",
    "address": "The Mall, Darjeeling, West Bengal",
    "location": {
      "latitude": 27.041,
      "longitude": 88.266
    },
    "description": "Accommodation option in Darjeeling. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/c5/e5/54/caption.jpg?h=-1&s=1&w=1200"
  },
  {
    "id": "hotel045",
    "name": "Windamere Hotel",
    "destination": "Darjeeling",
    "countryCode": "IN",
    "address": "Observatory Hill, Darjeeling, West Bengal",
    "location": {
      "latitude": 27.043,
      "longitude": 88.268
    },
    "description": "Accommodation option in Darjeeling. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://im.whatshot.in/img/2019/Feb/point-8-windamere-hotel-facebook-page-1551251689.jpg?wp=1"
  },
  {
    "id": "hotel046",
    "name": "Mayfair Waves",
    "destination": "Puri",
    "countryCode": "IN",
    "address": "Chakratirtha Road, Puri, Odisha",
    "location": {
      "latitude": 19.795,
      "longitude": 85.825
    },
    "description": "Accommodation option in Puri. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://edge.media.datahc.com/HI330222489.jpg"
  },
  {
    "id": "hotel047",
    "name": "Toshali Sands",
    "destination": "Puri",
    "countryCode": "IN",
    "address": "Baliapanda, Puri, Odisha",
    "location": {
      "latitude": 19.78,
      "longitude": 85.82
    },
    "description": "Accommodation option in Puri. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://rukmini-ct.flixcart.com/q_auto%2Cf_auto/ct-hotel-images/places/hotels/cms/2882/2882808/images/image_2882808_e1707fca-7c61-4500-9098-410964bc6507.jpeg"
  },
  {
    "id": "hotel048",
    "name": "Mayfair Lagoon",
    "destination": "Bhubaneswar",
    "countryCode": "IN",
    "address": "Jaydev Vihar, Bhubaneswar, Odisha",
    "location": {
      "latitude": 20.3,
      "longitude": 85.818
    },
    "description": "Accommodation option in Bhubaneswar. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://q-xx.bstatic.com/xdata/images/hotel/840x460/15948266.jpg?k=b6a0fb19a597226cf32b59af61d0b801f0b8247ccc0afdfa07ccd7d9f7dfd1f5&o="
  },
  {
    "id": "hotel049",
    "name": "Trident Bhubaneswar",
    "destination": "Bhubaneswar",
    "countryCode": "IN",
    "address": "CB-1, Nayapalli, Bhubaneswar, Odisha",
    "location": {
      "latitude": 20.296,
      "longitude": 85.824
    },
    "description": "Accommodation option in Bhubaneswar. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://z.cdrst.com/foto/hotel-sf/18a68/granderesp/trident-bhubaneswar-exterior-14459273.jpg"
  },
  {
    "id": "hotel050",
    "name": "Lotus Resort Konark",
    "destination": "Konark",
    "countryCode": "IN",
    "address": "Near Ramchandi Beach, Konark, Odisha",
    "location": {
      "latitude": 19.865,
      "longitude": 86.08
    },
    "description": "Accommodation option in Konark. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://media.easemytrip.com/media/Hotel/SHL-22031056555589/Common/CommonuilZR1.jpg"
  },
  {
    "id": "hotel051",
    "name": "Yatri Nivas Konark",
    "destination": "Konark",
    "countryCode": "IN",
    "address": "Near Konark Sun Temple, Konark, Odisha",
    "location": {
      "latitude": 19.887,
      "longitude": 86.094
    },
    "description": "Accommodation option in Konark. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://r1imghtlak.ibcdn.com/b28190bcd1d311eba5e40242ac110003.jpeg"
  },
  {
    "id": "hotel052",
    "name": "Sundarban Tiger Camp",
    "destination": "Sundarbans",
    "countryCode": "IN",
    "address": "Dayapur, Gosaba, West Bengal",
    "location": {
      "latitude": 22.118,
      "longitude": 88.815
    },
    "description": "Accommodation option in Sundarbans. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://assets.simplotel.com/simplotel/image/upload/w_5000%2Ch_3333/x_279%2Cy_0%2Cw_4445%2Ch_3333%2Cr_0%2Cc_crop%2Cq_80%2Cfl_progressive/w_900%2Cf_auto%2Cc_fit/waxpol-hotels-and-resorts/Entrance"
  },
  {
    "id": "hotel053",
    "name": "Sundarban Gateway Resort",
    "destination": "Sundarbans",
    "countryCode": "IN",
    "address": "Gadkhali, Gosaba, West Bengal",
    "location": {
      "latitude": 22.145,
      "longitude": 88.81
    },
    "description": "Accommodation option in Sundarbans. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true
  },
  {
    "id": "hotel054",
    "name": "Maya Heritage",
    "destination": "Bodh Gaya",
    "countryCode": "IN",
    "address": "Near Mahabodhi Temple, Bodh Gaya, Bihar",
    "location": {
      "latitude": 24.696,
      "longitude": 84.986
    },
    "description": "Accommodation option in Bodh Gaya. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://gos3.ibcdn.com/51c2b6d8-3f98-4c10-845d-6e957a6995c0.jpg"
  },
  {
    "id": "hotel055",
    "name": "The Royal Residency",
    "destination": "Bodh Gaya",
    "countryCode": "IN",
    "address": "Domuhan-Bodhgaya Road, Bodh Gaya, Bihar",
    "location": {
      "latitude": 24.69,
      "longitude": 84.999
    },
    "description": "Accommodation option in Bodh Gaya. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://api.blessingsonthenet.com/uploads/hotels/861b7a33e405a2b31bd243c98c9727a6-1687427251517-The%20Royal%20Residency%2C%20BodhGaya.jpg"
  },
  {
    "id": "hotel056",
    "name": "Radisson Blu Hotel Ranchi",
    "destination": "Ranchi",
    "countryCode": "IN",
    "address": "Main Road, Ranchi, Jharkhand",
    "location": {
      "latitude": 23.35,
      "longitude": 85.325
    },
    "description": "Accommodation option in Ranchi. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.momondo.com/himg/8a/22/32/ice-191473736-66849980_3XL-658794.jpg"
  },
  {
    "id": "hotel057",
    "name": "Chanakya BNR Hotel",
    "destination": "Ranchi",
    "countryCode": "IN",
    "address": "Station Road, Ranchi, Jharkhand",
    "location": {
      "latitude": 23.345,
      "longitude": 85.334
    },
    "description": "Accommodation option in Ranchi. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://juggler.makemytrip.com/juggler/stream/key/platform-ugc-01KB4MXSWKJMYGC0F9ZRRZFFM6/01KB4MXSWKJMYGC0F9ZRRZFFM6.jpg"
  },
  {
    "id": "hotel058",
    "name": "The Taj Mahal Palace",
    "destination": "Mumbai",
    "countryCode": "IN",
    "address": "Apollo Bunder, Mumbai, Maharashtra",
    "location": {
      "latitude": 18.9217,
      "longitude": 72.8332
    },
    "description": "Accommodation option in Mumbai. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://assets.gqindia.com/photos/685a6d6d5cf52b3ad4f2eb92/16%3A9/w_1280%2Cc_limit/Taj%20Mahal%20Palace%20Hotel.jpg"
  },
  {
    "id": "hotel059",
    "name": "The Oberoi Mumbai",
    "destination": "Mumbai",
    "countryCode": "IN",
    "address": "Nariman Point, Mumbai, Maharashtra",
    "location": {
      "latitude": 18.927,
      "longitude": 72.82
    },
    "description": "Accommodation option in Mumbai. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://theluxuryeditor.com/wp-content/uploads/2025/03/622849634.jpg"
  },
  {
    "id": "hotel060",
    "name": "The Leela Palace Udaipur",
    "destination": "Udaipur",
    "countryCode": "IN",
    "address": "Lake Pichola, Udaipur, Rajasthan",
    "location": {
      "latitude": 24.576,
      "longitude": 73.68
    },
    "description": "Accommodation option in Udaipur. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://zimtro.com/pictures/listing-full/9/25.04.11.13.21-1744357908.4833-15939187.jpg"
  },
  {
    "id": "hotel061",
    "name": "Taj Lake Palace",
    "destination": "Udaipur",
    "countryCode": "IN",
    "address": "Lake Pichola, Udaipur, Rajasthan",
    "location": {
      "latitude": 24.576,
      "longitude": 73.679
    },
    "description": "Accommodation option in Udaipur. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://ca-times.brightspotcdn.com/dims4/default/898c0dc/2147483647/strip/true/crop/1200x675%2B0%2B113/resize/1200x675%21/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F01%2Fc3%2F9607d3f74accbaf710700caea225%2Ftaj-lake-palace.jpg"
  },
  {
    "id": "hotel062",
    "name": "Suryagarh",
    "destination": "Jaisalmer",
    "countryCode": "IN",
    "address": "Kahala Phata, Jaisalmer, Rajasthan",
    "location": {
      "latitude": 26.925,
      "longitude": 70.912
    },
    "description": "Accommodation option in Jaisalmer. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.experiencetravelgroup.com/wp-content/uploads/2025/07/suryagarh-jaisalmer-exterior.jpg"
  },
  {
    "id": "hotel063",
    "name": "Fort Rajwada",
    "destination": "Jaisalmer",
    "countryCode": "IN",
    "address": "Jodhpur-Barmer Link Road, Jaisalmer, Rajasthan",
    "location": {
      "latitude": 26.9,
      "longitude": 70.9
    },
    "description": "Accommodation option in Jaisalmer. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.dharajyotstoneart.com/cdn/shop/files/fort_rajwada_made_by_dharajyot_stone_art.jpg?v=1704107658&width=2000"
  },
  {
    "id": "hotel064",
    "name": "Hyatt Regency Ahmedabad",
    "destination": "Ahmedabad",
    "countryCode": "IN",
    "address": "Ashram Road, Ahmedabad, Gujarat",
    "location": {
      "latitude": 23.0395,
      "longitude": 72.561
    },
    "description": "Accommodation option in Ahmedabad. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://weddingbyte.com/uploads/blog/66a3488a8f894.jpeg"
  },
  {
    "id": "hotel065",
    "name": "The House of MG",
    "destination": "Ahmedabad",
    "countryCode": "IN",
    "address": "Lal Darwaja, Ahmedabad, Gujarat",
    "location": {
      "latitude": 23.026,
      "longitude": 72.585
    },
    "description": "Accommodation option in Ahmedabad. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.ampersandtravel.com/media/850103/house-of-mg-ahmedabad-gujarat-india-8.jpg?height=534&mode=crop&quality=95&width=820"
  },
  {
    "id": "hotel066",
    "name": "Rann Riders",
    "destination": "Rann of Kutch",
    "countryCode": "IN",
    "address": "Dasada, Little Rann of Kutch, Gujarat",
    "location": {
      "latitude": 23.195,
      "longitude": 71.75
    },
    "description": "Accommodation option in Rann of Kutch. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://tailormadejourney.com/wp-content/uploads/2021/01/268748681.jpg"
  },
  {
    "id": "hotel067",
    "name": "Shaam-e-Sarhad Village Resort",
    "destination": "Rann of Kutch",
    "countryCode": "IN",
    "address": "Hodka, Kutch, Gujarat",
    "location": {
      "latitude": 23.84,
      "longitude": 69.39
    },
    "description": "Accommodation option in Rann of Kutch. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://mysimplesojourn.com/wp-content/uploads/2017/07/Main-gate.jpg"
  },
  {
    "id": "hotel068",
    "name": "JW Marriott Hotel Pune",
    "destination": "Pune",
    "countryCode": "IN",
    "address": "Senapati Bapat Road, Pune, Maharashtra",
    "location": {
      "latitude": 18.53,
      "longitude": 73.83
    },
    "description": "Accommodation option in Pune. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://images.squarespace-cdn.com/content/v1/5cf4be93e3947a0001fee134/1644045048075-TBEXVP6ABT0C4X1WNB6U/DJI_0839pe1500.jpg"
  },
  {
    "id": "hotel069",
    "name": "Conrad Pune",
    "destination": "Pune",
    "countryCode": "IN",
    "address": "Mangaldas Road, Pune, Maharashtra",
    "location": {
      "latitude": 18.536,
      "longitude": 73.883
    },
    "description": "Accommodation option in Pune. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://hoteldesigns.net/wp-content/uploads/2016/04/ConradPuneMain.jpg"
  },
  {
    "id": "hotel070",
    "name": "Della Resorts",
    "destination": "Lonavala",
    "countryCode": "IN",
    "address": "Kunegaon, Lonavala, Maharashtra",
    "location": {
      "latitude": 18.755,
      "longitude": 73.406
    },
    "description": "Accommodation option in Lonavala. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Restaurant",
      "Swimming Pool",
      "Parking"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.dellaresorts.com/images/eexterior-06.jpg"
  },
  {
    "id": "hotel071",
    "name": "Fariyas Resort Lonavala",
    "destination": "Lonavala",
    "countryCode": "IN",
    "address": "Frichley Hills, Lonavala, Maharashtra",
    "location": {
      "latitude": 18.75,
      "longitude": 73.41
    },
    "description": "Accommodation option in Lonavala. Confirm current facilities, rates and guest services directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Breakfast",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://static.tripzilla.in/media/55977/conversions/18c40607-64f4-4469-8841-d4abd154662f-w768.webp"
  },
  {
    "id": "hotel072",
    "name": "Sobit Sarovar Portico",
    "destination": "Goa",
    "countryCode": "IN",
    "address": "Palolem Beach Road, Palolem, Canacona, Goa 403702",
    "location": {
      "latitude": 15.01065,
      "longitude": 74.02644
    },
    "description": "Hotel in Palolem, South Goa, suitable as a nearby accommodation option for Palolem Beach. Confirm current rates and facilities directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Restaurant",
      "Swimming pool",
      "Fitness centre",
      "Parking",
      "Travel desk"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/43/d2/d2/sobit-sarovar-portico.jpg?h=-1&s=1&w=1400"
  },
  {
    "id": "hotel073",
    "name": "Sam Dunes Resort",
    "destination": "Jaisalmer",
    "countryCode": "IN",
    "address": "Sam Sand Dunes, Kanoi, Jaisalmer, Rajasthan 345001",
    "location": {
      "latitude": 26.873586,
      "longitude": 70.569918
    },
    "description": "Desert accommodation in the Kanoi and Sam Sand Dunes area. Confirm seasonal operation, package inclusions and current rates directly before booking.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Desert tents",
      "Restaurant",
      "Breakfast",
      "Dinner"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true
  },
  {
    "id": "hotel074",
    "name": "Old Harbour Hotel",
    "destination": "Kerala",
    "countryCode": "IN",
    "address": "1/328, Tower Road, Fort Kochi, Ernakulam, Kerala 682001",
    "location": {
      "latitude": 9.96734,
      "longitude": 76.24248
    },
    "description": "Heritage boutique hotel in Fort Kochi. Confirm current rates, room details and facilities directly with the property.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Wi-Fi",
      "Parking",
      "Restaurant",
      "Swimming pool",
      "Travel desk"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://cazloyd.com/wp-content/uploads/2024/10/Untitled-design-2024-10-03T171913.041.jpg"
  },
  {
    "id": "hotel075",
    "name": "Periyar House (KTDC)",
    "destination": "Kerala",
    "countryCode": "IN",
    "address": "Thekkady, Idukki, Kerala 685536",
    "location": {
      "latitude": 9.533,
      "longitude": 77.2
    },
    "description": "KTDC budget jungle lodge located inside the Periyar Wildlife Sanctuary area. Entry timing and access rules apply; confirm current operating conditions and rates with KTDC.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Restaurant",
      "Parking",
      "Room service",
      "Travel desk"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://gos3.ibcdn.com/b6058842118d11ed92300a58a9feac02.jpg"
  },
  {
    "id": "hotel076",
    "name": "White Rann Resort",
    "destination": "Rann of Kutch",
    "countryCode": "IN",
    "address": "Dhordo, Kutch, Gujarat 370510",
    "location": {
      "latitude": 23.8063981,
      "longitude": 69.5125024
    },
    "description": "Resort in the Dhordo area near the White Rann. Seasonal access and rates may vary; confirm current operating dates and booking details directly.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Accommodation",
      "Restaurant"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true,
    "image": "https://www.dizcoverpraveg.com/assets/img/blog/staying-at-white-rann-resort.jpg"
  },
  {
    "id": "hotel077",
    "name": "Matla Tourism Property",
    "destination": "Sundarbans",
    "countryCode": "IN",
    "address": "Sajnekhali, P.O. Pakhiralaya, P.S. Gosaba, South 24 Parganas, West Bengal 743379",
    "location": {
      "latitude": 22.12365,
      "longitude": 88.8304
    },
    "description": "West Bengal Tourism Development Corporation property at Sajnekhali in the Sundarbans. Boat transfers, park access and operating days must be confirmed with the tourism operator.",
    "price": {
      "amount": null,
      "currency": "INR",
      "period": "per night",
      "isEstimate": true
    },
    "rating": null,
    "reviewCount": null,
    "amenities": [
      "Air conditioning",
      "Breakfast",
      "Restaurant",
      "Room service",
      "Wi-Fi"
    ],
    "available": true,
    "availabilityStatus": "not_checked",
    "bookingEnabled": true
  }
];

module.exports = hotels;
