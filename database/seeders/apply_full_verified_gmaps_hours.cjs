const fs = require('fs');

const jsonPath = 'c:/Users/alvin/Documents/WORKSPACE - IT/sac/database/seeders/shoes_and_care_69_branches.json';
const branches = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Special branch overrides verified against direct Google Maps listings & official profiles
const exactGmapsOverrides = {
  // SAC Sunter (ID 109 / Sunter)
  'sunter': {
    days: {
      'Senin': 'Tutup',
      'Selasa': '11:00 - 19:00',
      'Rabu': '11:00 - 19:00',
      'Kamis': '11:00 - 19:00',
      'Jumat': '11:00 - 19:00',
      'Sabtu': '11:00 - 19:00',
      'Minggu': '11:00 - 19:00'
    },
    open_hour: '11:00',
    close_hour: '19:00',
    weekend_open_hour: '11:00',
    weekend_close_hour: '19:00',
    is_open_weekend: true
  },
  // SAC Gading Serpong (ID 116 / Pasar Modern Sinpasa)
  'gading serpong': {
    days: {
      'Senin': 'Tutup',
      'Selasa': '08:00 - 16:00',
      'Rabu': '08:00 - 16:00',
      'Kamis': '08:00 - 16:00',
      'Jumat': '08:00 - 16:00',
      'Sabtu': '08:00 - 16:00',
      'Minggu': '08:00 - 16:00'
    },
    open_hour: '08:00',
    close_hour: '16:00',
    weekend_open_hour: '08:00',
    weekend_close_hour: '16:00',
    is_open_weekend: true
  },
  // SAC Gatsu (ID 118 / Gatot Subroto)
  'gatsu': {
    days: {
      'Senin': '11:00 - 19:00',
      'Selasa': '11:00 - 19:00',
      'Rabu': '11:00 - 19:00',
      'Kamis': '11:00 - 19:00',
      'Jumat': '11:00 - 19:00',
      'Sabtu': '10:00 - 17:00',
      'Minggu': '10:00 - 17:00'
    },
    open_hour: '11:00',
    close_hour: '19:00',
    weekend_open_hour: '10:00',
    weekend_close_hour: '17:00',
    is_open_weekend: true
  },
  // SAC Gandaria (ID 114)
  'gandaria': {
    days: {
      'Senin': '10:00 - 20:00',
      'Selasa': '10:00 - 20:00',
      'Rabu': '10:00 - 20:00',
      'Kamis': '10:00 - 20:00',
      'Jumat': '10:00 - 20:00',
      'Sabtu': '10:00 - 20:00',
      'Minggu': '10:00 - 19:00'
    },
    open_hour: '10:00',
    close_hour: '20:00',
    weekend_open_hour: '10:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Jatiwaringin (ID 95)
  'jatiwaringin': {
    days: {
      'Senin': '09:00 - 18:00',
      'Selasa': '09:00 - 18:00',
      'Rabu': '09:00 - 18:00',
      'Kamis': '09:00 - 18:00',
      'Jumat': '09:00 - 18:00',
      'Sabtu': '09:00 - 18:00',
      'Minggu': '10:00 - 15:00'
    },
    open_hour: '09:00',
    close_hour: '18:00',
    weekend_open_hour: '09:00',
    weekend_close_hour: '18:00',
    is_open_weekend: true
  },
  // SAC Makassar 1 (ID 61 / Boulevard)
  'makassar 1': {
    days: {
      'Senin': '12:00 - 20:00',
      'Selasa': '12:00 - 20:00',
      'Rabu': '12:00 - 20:00',
      'Kamis': 'Tutup',
      'Jumat': '12:00 - 20:00',
      'Sabtu': '12:00 - 20:00',
      'Minggu': '12:00 - 20:00'
    },
    open_hour: '12:00',
    close_hour: '20:00',
    weekend_open_hour: '12:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Makassar 2 (ID 62 / BTP)
  'makassar 2': {
    days: {
      'Senin': '12:00 - 20:00',
      'Selasa': '12:00 - 20:00',
      'Rabu': '12:00 - 20:00',
      'Kamis': 'Tutup',
      'Jumat': '12:00 - 20:00',
      'Sabtu': '12:00 - 20:00',
      'Minggu': '12:00 - 20:00'
    },
    open_hour: '12:00',
    close_hour: '20:00',
    weekend_open_hour: '12:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Pakuwon Mall Jogja (ID 123)
  'pakuwon mall jogja': {
    days: {
      'Senin': '10:00 - 21:00',
      'Selasa': '10:00 - 21:00',
      'Rabu': '10:00 - 21:00',
      'Kamis': '10:00 - 21:00',
      'Jumat': '10:00 - 21:00',
      'Sabtu': '10:00 - 21:00',
      'Minggu': '10:00 - 21:00'
    },
    open_hour: '10:00',
    close_hour: '21:00',
    weekend_open_hour: '10:00',
    weekend_close_hour: '21:00',
    is_open_weekend: true
  },
  // SAC Amplaz (ID 105)
  'amplaz': {
    days: {
      'Senin': '10:00 - 21:00',
      'Selasa': '10:00 - 21:00',
      'Rabu': '10:00 - 21:00',
      'Kamis': '10:00 - 21:00',
      'Jumat': '10:00 - 21:00',
      'Sabtu': '10:00 - 21:00',
      'Minggu': '10:00 - 21:00'
    },
    open_hour: '10:00',
    close_hour: '21:00',
    weekend_open_hour: '10:00',
    weekend_close_hour: '21:00',
    is_open_weekend: true
  },
  // SAC Pasar Rebo (ID 80)
  'pasar rebo': {
    days: {
      'Senin': '13:00 - 22:00',
      'Selasa': '13:00 - 22:00',
      'Rabu': '13:00 - 22:00',
      'Kamis': '13:00 - 22:00',
      'Jumat': '13:00 - 22:00',
      'Sabtu': '13:30 - 22:00',
      'Minggu': '13:30 - 22:00'
    },
    open_hour: '13:00',
    close_hour: '22:00',
    weekend_open_hour: '13:30',
    weekend_close_hour: '22:00',
    is_open_weekend: true
  },
  // SAC Tanjung Duren (ID 96)
  'tanjung duren': {
    days: {
      'Senin': '10:00 - 20:00',
      'Selasa': '10:00 - 20:00',
      'Rabu': '10:00 - 20:00',
      'Kamis': '10:00 - 20:00',
      'Jumat': '10:00 - 20:00',
      'Sabtu': '10:00 - 20:00',
      'Minggu': '11:00 - 18:00'
    },
    open_hour: '10:00',
    close_hour: '20:00',
    weekend_open_hour: '10:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Dewata (ID 51)
  'dewata': {
    days: {
      'Senin': '08:00 - 20:00',
      'Selasa': '08:00 - 20:00',
      'Rabu': '08:00 - 20:00',
      'Kamis': '08:00 - 20:00',
      'Jumat': '08:00 - 20:00',
      'Sabtu': '08:00 - 20:00',
      'Minggu': '08:00 - 17:00'
    },
    open_hour: '08:00',
    close_hour: '20:00',
    weekend_open_hour: '08:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Bali Kreneng (ID 50)
  'bali kreneng': {
    days: {
      'Senin': '08:00 - 20:00',
      'Selasa': '08:00 - 20:00',
      'Rabu': '08:00 - 20:00',
      'Kamis': '08:00 - 20:00',
      'Jumat': '08:00 - 20:00',
      'Sabtu': '08:00 - 20:00',
      'Minggu': '08:00 - 19:00'
    },
    open_hour: '08:00',
    close_hour: '20:00',
    weekend_open_hour: '08:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Bali Ubung (ID 49)
  'bali ubung': {
    days: {
      'Senin': '13:30 - 20:30',
      'Selasa': '13:30 - 20:30',
      'Rabu': '13:30 - 20:30',
      'Kamis': '13:30 - 20:30',
      'Jumat': '13:30 - 20:30',
      'Sabtu': '13:30 - 20:30',
      'Minggu': '13:30 - 20:30'
    },
    open_hour: '13:30',
    close_hour: '20:30',
    weekend_open_hour: '13:30',
    weekend_close_hour: '20:30',
    is_open_weekend: true
  },
  // SAC Alun-alun Kidul (ID 26)
  'alun-alun kidul': {
    days: {
      'Senin': '12:00 - 19:00',
      'Selasa': '12:00 - 19:00',
      'Rabu': '12:00 - 19:00',
      'Kamis': '12:00 - 19:00',
      'Jumat': '13:00 - 19:00',
      'Sabtu': '12:00 - 19:00',
      'Minggu': 'Tutup'
    },
    open_hour: '12:00',
    close_hour: '19:00',
    weekend_open_hour: '12:00',
    weekend_close_hour: '19:00',
    is_open_weekend: true
  },
  // SAC Tebet (ID 77)
  'tebet': {
    days: {
      'Senin': '11:00 - 20:00',
      'Selasa': '11:00 - 20:00',
      'Rabu': '11:00 - 20:00',
      'Kamis': '11:00 - 20:00',
      'Jumat': '13:00 - 20:00',
      'Sabtu': '11:00 - 20:00',
      'Minggu': '11:00 - 20:00'
    },
    open_hour: '11:00',
    close_hour: '20:00',
    weekend_open_hour: '11:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Rawamangun (ID 104)
  'rawamangun': {
    days: {
      'Senin': '13:00 - 21:00',
      'Selasa': '13:00 - 21:00',
      'Rabu': '13:00 - 21:00',
      'Kamis': '13:00 - 21:00',
      'Jumat': '13:30 - 21:30',
      'Sabtu': '13:00 - 21:00',
      'Minggu': 'Tutup'
    },
    open_hour: '13:00',
    close_hour: '21:00',
    weekend_open_hour: '13:00',
    weekend_close_hour: '21:00',
    is_open_weekend: true
  },
  // SAC Depok Margonda (ID 60)
  'depok': {
    days: {
      'Senin': '11:00 - 20:00',
      'Selasa': '11:00 - 20:00',
      'Rabu': '11:00 - 20:00',
      'Kamis': '11:00 - 20:00',
      'Jumat': '13:00 - 21:00',
      'Sabtu': '11:00 - 20:00',
      'Minggu': '11:00 - 20:00'
    },
    open_hour: '11:00',
    close_hour: '20:00',
    weekend_open_hour: '11:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Lebak Bulus (ID 127)
  'lebak bulus': {
    days: {
      'Senin': '10:00 - 20:00',
      'Selasa': '10:00 - 20:00',
      'Rabu': '10:00 - 20:00',
      'Kamis': '10:00 - 20:00',
      'Jumat': '10:00 - 20:00',
      'Sabtu': '10:00 - 20:00',
      'Minggu': 'Tutup'
    },
    open_hour: '10:00',
    close_hour: '20:00',
    weekend_open_hour: '10:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Malang (ID 67)
  'malang': {
    days: {
      'Senin': '09:00 - 19:00',
      'Selasa': '09:00 - 19:00',
      'Rabu': '09:00 - 19:00',
      'Kamis': '09:00 - 19:00',
      'Jumat': '09:00 - 19:00',
      'Sabtu': '09:00 - 19:00',
      'Minggu': 'Tutup'
    },
    open_hour: '09:00',
    close_hour: '19:00',
    weekend_open_hour: '09:00',
    weekend_close_hour: '19:00',
    is_open_weekend: true
  },
  // SAC Solo Fajar Indah (ID 90)
  'solo fajar indah': {
    days: {
      'Senin': '11:00 - 19:00',
      'Selasa': '11:00 - 19:00',
      'Rabu': '11:00 - 19:00',
      'Kamis': '11:00 - 19:00',
      'Jumat': '11:00 - 19:00',
      'Sabtu': '11:00 - 19:00',
      'Minggu': 'Tutup'
    },
    open_hour: '11:00',
    close_hour: '19:00',
    weekend_open_hour: '11:00',
    weekend_close_hour: '19:00',
    is_open_weekend: true
  },
  // SAC Solo Jebres (ID 31)
  'solo jebres': {
    days: {
      'Senin': '11:00 - 20:00',
      'Selasa': '11:00 - 20:00',
      'Rabu': '11:00 - 20:00',
      'Kamis': '11:00 - 20:00',
      'Jumat': '11:00 - 20:00',
      'Sabtu': '11:00 - 20:00',
      'Minggu': 'Tutup'
    },
    open_hour: '11:00',
    close_hour: '20:00',
    weekend_open_hour: '11:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Surabaya 2 (ID 88)
  'surabaya 2': {
    days: {
      'Senin': '12:00 - 20:00',
      'Selasa': '12:00 - 20:00',
      'Rabu': '12:00 - 20:00',
      'Kamis': '12:00 - 20:00',
      'Jumat': '12:00 - 20:00',
      'Sabtu': '12:00 - 20:00',
      'Minggu': 'Tutup'
    },
    open_hour: '12:00',
    close_hour: '20:00',
    weekend_open_hour: '12:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Manado (ID 72)
  'manado': {
    days: {
      'Senin': '10:00 - 19:00',
      'Selasa': '10:00 - 19:00',
      'Rabu': '10:00 - 19:00',
      'Kamis': '10:00 - 19:00',
      'Jumat': '10:00 - 19:00',
      'Sabtu': '10:00 - 19:00',
      'Minggu': 'Tutup'
    },
    open_hour: '10:00',
    close_hour: '19:00',
    weekend_open_hour: '10:00',
    weekend_close_hour: '19:00',
    is_open_weekend: true
  },
  // SAC Communion (ID 29)
  'communion': {
    days: {
      'Senin': '10:00 - 20:00',
      'Selasa': '10:00 - 20:00',
      'Rabu': '10:00 - 20:00',
      'Kamis': '10:00 - 20:00',
      'Jumat': '10:00 - 20:00',
      'Sabtu': '10:00 - 20:00',
      'Minggu': '10:00 - 16:00'
    },
    open_hour: '10:00',
    close_hour: '20:00',
    weekend_open_hour: '10:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  },
  // SAC Bintaro Hero Emerald (ID 129)
  'emerald': {
    days: {
      'Senin': '09:00 - 21:00',
      'Selasa': '09:00 - 21:00',
      'Rabu': '09:00 - 21:00',
      'Kamis': '09:00 - 21:00',
      'Jumat': '09:00 - 20:00',
      'Sabtu': '09:00 - 21:00',
      'Minggu': '09:00 - 21:00'
    },
    open_hour: '09:00',
    close_hour: '21:00',
    weekend_open_hour: '09:00',
    weekend_close_hour: '21:00',
    is_open_weekend: true
  },
  // SAC Naripan Bandung (ID 69)
  'naripan': {
    days: {
      'Senin': '09:00 - 21:00',
      'Selasa': '09:00 - 19:00',
      'Rabu': '09:00 - 19:00',
      'Kamis': '09:00 - 19:00',
      'Jumat': '09:00 - 21:00',
      'Sabtu': '09:00 - 21:00',
      'Minggu': '09:00 - 21:00'
    },
    open_hour: '09:00',
    close_hour: '21:00',
    weekend_open_hour: '09:00',
    weekend_close_hour: '21:00',
    is_open_weekend: true
  },
  // SAC Sagan Flagship HQ (ID 999)
  'sagan': {
    days: {
      'Senin': '09:00 - 21:00',
      'Selasa': '09:00 - 21:00',
      'Rabu': '09:00 - 21:00',
      'Kamis': '09:00 - 21:00',
      'Jumat': '09:00 - 21:00',
      'Sabtu': '10:00 - 20:00',
      'Minggu': '10:00 - 20:00'
    },
    open_hour: '09:00',
    close_hour: '21:00',
    weekend_open_hour: '10:00',
    weekend_close_hour: '20:00',
    is_open_weekend: true
  }
};

let overrideCount = 0;

for (const b of branches) {
  const nameLower = b.branch_name.toLowerCase();

  // Check if matches any exact override key
  let matchedKey = null;
  for (const k of Object.keys(exactGmapsOverrides)) {
    if (nameLower.includes(k)) {
      matchedKey = k;
      break;
    }
  }

  if (matchedKey) {
    const override = exactGmapsOverrides[matchedKey];
    b.operating_hours_daily = override.days;
    b.open_hour = override.open_hour;
    b.close_hour = override.close_hour;
    b.weekend_open_hour = override.weekend_open_hour;
    b.weekend_close_hour = override.weekend_close_hour;
    b.is_open_weekend = override.is_open_weekend;
    overrideCount++;
  }

  // Ensure all 7 days exist with clean format
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  b.operating_hours_daily = b.operating_hours_daily || {};
  for (const d of days) {
    if (!b.operating_hours_daily[d]) {
      if (d === 'Sabtu' || d === 'Minggu') {
        b.operating_hours_daily[d] = b.is_open_weekend ? `${b.weekend_open_hour} - ${b.weekend_close_hour}` : 'Tutup';
      } else {
        b.operating_hours_daily[d] = `${b.open_hour} - ${b.close_hour}`;
      }
    }
  }

  // Generate clean human text
  const mon = b.operating_hours_daily['Senin'];
  const fri = b.operating_hours_daily['Jumat'];
  const sat = b.operating_hours_daily['Sabtu'];
  const sun = b.operating_hours_daily['Minggu'];
  b.gmaps_opening_hours_text = `Sen: ${mon} | Jum: ${fri} | Sab: ${sat} | Min: ${sun}`;
}

fs.writeFileSync(jsonPath, JSON.stringify(branches, null, 2));

console.log(`Applied verified Google Maps hours:`);
console.log(`- Overridden with exact place listings: ${overrideCount}`);
console.log(`- Total branches processed: ${branches.length}`);
