import { CountryData, UserProfile } from '../types';

export const GLOBAL_REPOSITORY: CountryData[] = [
  // --- EUROPE ---
  {
    name: 'Albania', code: 'AL', flag: '🇦🇱', continent: 'Europe', summary: 'A Balkan nation with a growing digital nomad scene and affordable living.',
    resources: [{ id: 'al-govt', title: 'Ministry of Interior', type: 'Portal', url: 'https://mb.gov.al/', category: 'Immigration', description: 'Official government resources for residence permits.' }]
  },
  {
    name: 'Andorra', code: 'AD', flag: '🇦🇩', continent: 'Europe', summary: 'A tiny, independent principality situated between France and Spain in the Pyrenees mountains.',
    resources: [{ id: 'ad-govt', title: 'Servei d\'Immigració', type: 'Portal', url: 'https://www.immigracio.ad/', category: 'Immigration', description: 'Official immigration services for Andorra.' }]
  },
  {
    name: 'Austria', code: 'AT', flag: '🇦🇹', continent: 'Europe', summary: 'Offers a high quality of life and various residence permits for professionals and students.',
    resources: [{ id: 'at-govt', title: 'Migration.gv.at', type: 'Portal', url: 'https://www.migration.gv.at/en/', category: 'Immigration', description: 'Official Austrian government guide to migration.' }]
  },
  {
    name: 'Belarus', code: 'BY', flag: '🇧🇾', continent: 'Europe', summary: 'Landlocked country in Eastern Europe known for its Stalinist architecture.',
    resources: [{ id: 'by-govt', title: 'Ministry of Foreign Affairs', type: 'Portal', url: 'https://mfa.gov.by/en/', category: 'Immigration', description: 'Visa and entry regulations for Belarus.' }]
  },
  {
    name: 'Belgium', code: 'BE', flag: '🇧🇪', continent: 'Europe', summary: 'A multicultural hub at the heart of the EU with diverse visa options.',
    resources: [{ id: 'be-govt', title: 'Foreigners Office', type: 'Portal', url: 'https://dofi.ibz.be/en', category: 'Immigration', description: 'Official portal for residency and visa applications.' }]
  },
  {
    name: 'Bosnia and Herzegovina', code: 'BA', flag: '🇧🇦', continent: 'Europe', summary: 'A country on the Balkan Peninsula with diverse culture and history.',
    resources: [{ id: 'ba-govt', title: 'Service for Foreigners\' Affairs', type: 'Portal', url: 'http://sps.gov.ba/?lang=en', category: 'Immigration', description: 'Official foreigners registration and residency portal.' }]
  },
  {
    name: 'Bulgaria', code: 'BG', flag: '🇧🇬', continent: 'Europe', summary: 'Popular for its low tax rates and affordable cost of living in the EU.',
    resources: [{ id: 'bg-govt', title: 'Ministry of Foreign Affairs', type: 'Portal', url: 'https://www.mfa.bg/en/services-travel/consular-services/visa-for-bulgaria', category: 'Visa', description: 'Visa information for Bulgaria.' }]
  },
  {
    name: 'Croatia', code: 'HR', flag: '🇭🇷', continent: 'Europe', summary: 'Famous for its stunning coastline and a dedicated Digital Nomad Residence permit.',
    resources: [{ id: 'hr-nomad', title: 'Digital Nomad Residence', type: 'Portal', url: 'https://mup.gov.hr/aliens-281621/stay-and-work/digital-nomads-286562/286562', category: 'Visa', description: 'Official application portal for the Croatian nomad permit.' }]
  },
  {
    name: 'Cyprus', code: 'CY', flag: '🇨🇾', continent: 'Europe', summary: 'An island nation in the Mediterranean with attractive tax incentives for expats.',
    resources: [{ id: 'cy-govt', title: 'Civil Registry and Migration', type: 'Portal', url: 'http://www.moi.gov.cy/crmd', category: 'Immigration', description: 'Department of migration official resources.' }]
  },
  {
    name: 'Czech Republic', code: 'CZ', flag: '🇨🇿', continent: 'Europe', summary: 'The "Zivno" trade license is a popular route for freelancers and nomads.',
    resources: [{ id: 'cz-govt', title: 'Ministry of Interior', type: 'Portal', url: 'https://www.mvcr.cz/mvcren/article/immigration.aspx', category: 'Immigration', description: 'Entry and residence information for the Czech Republic.' }]
  },
  {
    name: 'Denmark', code: 'DK', flag: '🇩🇰', continent: 'Europe', summary: 'Offers a very high standard of living and specific tracks for researchers and highly paid workers.',
    resources: [{ id: 'dk-govt', title: 'New to Denmark', type: 'Portal', url: 'https://www.nyidanmark.dk/en-GB', category: 'Immigration', description: 'Official portal for foreign nationals in Denmark.' }]
  },
  {
    name: 'Estonia', code: 'EE', flag: '🇪🇪', continent: 'Europe', summary: 'Digital pioneer with e-Residency and Digital Nomad Visa programs.',
    resources: [{ id: 'ee-eresidency', title: 'e-Residency Portal', type: 'Portal', url: 'https://www.e-resident.gov.ee/', category: 'Business', description: 'Official e-Residency program.' }]
  },
  {
    name: 'Finland', code: 'FI', flag: '🇫🇮', continent: 'Europe', summary: 'World leader in education and happiness with a focus on tech and innovation.',
    resources: [{ id: 'fi-govt', title: 'Finnish Immigration Service', type: 'Portal', url: 'https://migri.fi/en/home', category: 'Immigration', description: 'Official site for residence permits (Migri).' }]
  },
  {
    name: 'France', code: 'FR', flag: '🇫🇷', continent: 'Europe', summary: 'Global cultural hub with specialized "Talent Passports" for tech and art.',
    resources: [{ id: 'fr-talent', title: 'France-Visas', type: 'Portal', url: 'https://france-visas.gouv.fr/en/', category: 'Visa', description: 'Official French visa application portal.' }]
  },
  {
    name: 'Germany', code: 'DE', flag: '🇩🇪', continent: 'Europe', summary: 'EU economic powerhouse with diverse paths for skilled workers and freelancers.',
    resources: [{ id: 'de-make-it', title: 'Make it in Germany', type: 'Portal', url: 'https://www.make-it-in-germany.com/en/', category: 'Immigration', description: 'The official portal for qualified professionals.' }]
  },
  {
    name: 'Greece', code: 'GR', flag: '🇬🇷', continent: 'Europe', summary: 'Offers a Digital Nomad Visa and the popular Golden Visa program.',
    resources: [{ id: 'gr-nomad', title: 'Enterprise Greece', type: 'Portal', url: 'https://www.enterprisegreece.gov.gr/en/greece-residence-visa-programs', category: 'Visa', description: 'Residency programs overview.' }]
  },
  {
    name: 'Hungary', code: 'HU', flag: '🇭🇺', continent: 'Europe', summary: 'The White Card is a residency permit specifically for digital nomads.',
    resources: [{ id: 'hu-whitecard', title: 'Enter Hungary', type: 'Portal', url: 'https://enterhungary.gov.hu/', category: 'Visa', description: 'Online portal for residence permit applications.' }]
  },
  {
    name: 'Iceland', code: 'IS', flag: '🇮🇸', continent: 'Europe', summary: 'Offers a remote work visa for high earners outside the EEA.',
    resources: [{ id: 'is-remote', title: 'Work in Iceland', type: 'Portal', url: 'https://work.iceland.is/working/remote-work-visa', category: 'Visa', description: 'Guidelines for long-term visas for remote workers.' }]
  },
  {
    name: 'Ireland', code: 'IE', flag: '🇮🇪', continent: 'Europe', summary: 'English-speaking tech hub within the EU with various work permit schemes.',
    resources: [{ id: 'ie-isd', title: 'Immigration Service Delivery', type: 'Portal', url: 'https://www.irishimmigration.ie/', category: 'Immigration', description: 'Official Irish immigration portal.' }]
  },
  {
    name: 'Italy', code: 'IT', flag: '🇮🇹', continent: 'Europe', summary: 'Rich in history with new digital nomad visa legislation.',
    resources: [{ id: 'it-visa', title: 'Visto per l\'Italia', type: 'Portal', url: 'https://vistoperitalia.esteri.it/home/en', category: 'Visa', description: 'Official visa eligibility and application tool.' }]
  },
  {
    name: 'Latvia', code: 'LV', flag: '🇱🇻', continent: 'Europe', summary: 'A Baltic state offering a digital nomad visa for OECD employees.',
    resources: [{ id: 'lv-govt', title: 'OCMA', type: 'Portal', url: 'https://www.pmlp.gov.lv/en', category: 'Immigration', description: 'Office of Citizenship and Migration Affairs.' }]
  },
  {
    name: 'Lithuania', code: 'LT', flag: '🇱🇹', continent: 'Europe', summary: 'A fast-growing fintech and startup hub in the Baltics.',
    resources: [{ id: 'lt-migris', title: 'MIGRIS', type: 'Portal', url: 'https://www.migracija.lt/', category: 'Immigration', description: 'The Lithuanian migration information system.' }]
  },
  {
    name: 'Luxembourg', code: 'LU', flag: '🇱🇺', continent: 'Europe', summary: 'A wealthy, small nation with many opportunities in finance and international organizations.',
    resources: [{ id: 'lu-guichet', title: 'Guichet.lu', type: 'Portal', url: 'https://guichet.public.lu/en/citoyens/immigration.html', category: 'Immigration', description: 'Official administrative portal for Luxembourg.' }]
  },
  {
    name: 'Malta', code: 'MT', flag: '🇲🇹', continent: 'Europe', summary: 'The Nomad Residence Permit is a leading option for remote workers in the Mediterranean.',
    resources: [{ id: 'mt-residency', title: 'Residency Malta Agency', type: 'Portal', url: 'https://residencymalta.gov.mt/', category: 'Immigration', description: 'Official nomad and residency programs portal.' }]
  },
  {
    name: 'Netherlands', code: 'NL', flag: '🇳🇱', continent: 'Europe', summary: 'Highly skilled migrant program and the 30% tax ruling for expats.',
    resources: [{ id: 'nl-ind', title: 'IND Portal', type: 'Portal', url: 'https://ind.nl/en', category: 'Immigration', description: 'Immigration and Naturalisation Service.' }]
  },
  {
    name: 'Norway', code: 'NO', flag: '🇳🇴', continent: 'Europe', summary: 'Independent means and skilled worker permits in a country of immense natural beauty.',
    resources: [{ id: 'no-udi', title: 'UDI', type: 'Portal', url: 'https://www.udi.no/en/', category: 'Immigration', description: 'Norwegian Directorate of Immigration.' }]
  },
  {
    name: 'Poland', code: 'PL', flag: '🇵🇱', continent: 'Europe', summary: 'Thriving economy with a large tech sector and Poland.Business Harbour program.',
    resources: [{ id: 'pl-govt', title: 'UdSC', type: 'Portal', url: 'https://udsc.gov.pl/en/', category: 'Immigration', description: 'Office for Foreigners in Poland.' }]
  },
  {
    name: 'Portugal', code: 'PT', flag: '🇵🇹', continent: 'Europe', summary: 'D8 Digital Nomad Visa and NHR tax regime make it a nomad favorite.',
    resources: [{ id: 'pt-vistos', title: 'Vistos MNE', type: 'Portal', url: 'https://vistos.mne.gov.pt/en/', category: 'Visa', description: 'Ministry of Foreign Affairs official visa portal.' }]
  },
  {
    name: 'Romania', code: 'RO', flag: '🇷🇴', continent: 'Europe', summary: 'Affordable, fast internet, and a dedicated digital nomad visa.',
    resources: [{ id: 'ro-eviza', title: 'E-Visa Romania', type: 'Portal', url: 'https://eviza.mae.ro/', category: 'Visa', description: 'Official online visa application portal.' }]
  },
  {
    name: 'Slovakia', code: 'SK', flag: '🇸🇰', continent: 'Europe', summary: 'Central European nation with growing industrial and tech hubs.',
    resources: [{ id: 'sk-minv', title: 'Ministry of Interior', type: 'Portal', url: 'https://www.minv.sk/?residence-of-an-foreigner', category: 'Immigration', description: 'Residency information for Slovakia.' }]
  },
  {
    name: 'Slovenia', code: 'SI', flag: '🇸🇮', continent: 'Europe', summary: 'Alpine scenery and high quality of life within the EU.',
    resources: [{ id: 'si-infotujci', title: 'Info Foreigners', type: 'Portal', url: 'https://infotujci.si/en/', category: 'Immigration', description: 'Official portal for foreign nationals in Slovenia.' }]
  },
  {
    name: 'Spain', code: 'ES', flag: '🇪🇸', continent: 'Europe', summary: 'Popular Digital Nomad Visa and Mediterranean lifestyle.',
    resources: [{ id: 'es-uige', title: 'UGE-CE', type: 'Portal', url: 'https://www.inclusion.gob.es/en/web/unidadgrandesempresas', category: 'Immigration', description: 'Large Business and Strategic Groups Unit for visas.' }]
  },
  {
    name: 'Sweden', code: 'SE', flag: '🇸🇪', continent: 'Europe', summary: 'Innovation-driven society with diverse work permit options.',
    resources: [{ id: 'se-migration', title: 'Migrationsverket', type: 'Portal', url: 'https://www.migrationsverket.se/English/Private-individuals.html', category: 'Immigration', description: 'Swedish Migration Agency.' }]
  },
  {
    name: 'Switzerland', code: 'CH', flag: '🇨🇭', continent: 'Europe', summary: 'High salaries and exceptional infrastructure, though residency is strictly regulated.',
    resources: [{ id: 'ch-sem', title: 'SEM', type: 'Portal', url: 'https://www.sem.admin.ch/sem/en/home.html', category: 'Immigration', description: 'State Secretariat for Migration.' }]
  },
  {
    name: 'United Kingdom', code: 'GB', flag: '🇬🇧', continent: 'Europe', summary: 'Post-Brexit points-based system with specialized Global Talent visas.',
    resources: [{ id: 'gb-homeoffice', title: 'GOV.UK Visas', type: 'Portal', url: 'https://www.gov.uk/browse/visas-immigration', category: 'Immigration', description: 'Official UK government portal.' }]
  },

  // --- AMERICAS ---
  {
    name: 'Argentina', code: 'AR', flag: '🇦🇷', continent: 'Americas', summary: 'Simple nomad visa and culturally rich cities like Buenos Aires.',
    resources: [{ id: 'ar-migraciones', title: 'Migraciones', type: 'Portal', url: 'https://www.migraciones.gov.ar/nomades_digitales/', category: 'Visa', description: 'Official nomad portal for Argentina.' }]
  },
  {
    name: 'Belize', code: 'BZ', flag: '🇧🇿', continent: 'Americas', summary: 'English-speaking Caribbean nation with a "Work Where You Vacation" program.',
    resources: [{ id: 'bz-govt', title: 'Belize Immigration', type: 'Portal', url: 'https://immigration.gov.bz/', category: 'Immigration', description: 'Official Belizean immigration portal.' }]
  },
  {
    name: 'Bolivia', code: 'BO', flag: '🇧🇴', continent: 'Americas', summary: 'Stunning landscapes and affordable living in the heart of South America.',
    resources: [{ id: 'bo-migracion', title: 'Migración Bolivia', type: 'Portal', url: 'https://www.migracion.gob.bo/', category: 'Immigration', description: 'National migration authority.' }]
  },
  {
    name: 'Brazil', code: 'BR', flag: '🇧🇷', continent: 'Americas', summary: 'Dedicated Digital Nomad Visa for remote workers wanting a vibrant lifestyle.',
    resources: [{ id: 'br-govt', title: 'Gov.br Nomad Visa', type: 'Portal', url: 'https://www.gov.br/mre/pt-br/assuntos/portal-consular/vistos/visto-para-noma-des-digitais', category: 'Visa', description: 'Guidelines for Brazilian nomad visas.' }]
  },
  {
    name: 'Canada', code: 'CA', flag: '🇨🇦', continent: 'Americas', summary: 'Express Entry and provincial programs for skilled workers and entrepreneurs.',
    resources: [{ id: 'ca-ircc', title: 'IRCC Portal', type: 'Portal', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html', category: 'Immigration', description: 'Official Canadian immigration resources.' }]
  },
  {
    name: 'Chile', code: 'CL', flag: '🇨🇱', continent: 'Americas', summary: 'A stable South American economy with the "Start-Up Chile" program.',
    resources: [{ id: 'cl-serviciomigraciones', title: 'Sermig', type: 'Portal', url: 'https://serviciomigraciones.cl/', category: 'Immigration', description: 'National migration service of Chile.' }]
  },
  {
    name: 'Colombia', code: 'CO', flag: '🇨🇴', continent: 'Americas', summary: 'New V visa for digital nomads and a favorite for entrepreneurs.',
    resources: [{ id: 'co-cancilleria', title: 'Cancillería', type: 'Portal', url: 'https://www.cancilleria.gov.co/v-nomadas-digitales', category: 'Visa', description: 'Official digital nomad visa portal.' }]
  },
  {
    name: 'Costa Rica', code: 'CR', flag: '🇨🇷', continent: 'Americas', summary: 'Renowned for eco-tourism and a very accessible digital nomad visa.',
    resources: [{ id: 'cr-migracion', title: 'Migración CR', type: 'Portal', url: 'https://www.migracion.go.cr/', category: 'Immigration', description: 'General directorate of migration.' }]
  },
  {
    name: 'Dominica', code: 'DM', flag: '🇩🇲', continent: 'Americas', summary: 'Offers the "Work in Nature" (WIN) certificate for long-term remote work.',
    resources: [{ id: 'dm-win', title: 'Work in Nature Dominica', type: 'Portal', url: 'https://windominica.gov.dm/', category: 'Visa', description: 'Official Dominica WIN portal.' }]
  },
  {
    name: 'Ecuador', code: 'EC', flag: '🇪🇨', continent: 'Americas', summary: 'Affordable residency and a digital nomad visa program.',
    resources: [{ id: 'ec-cancilleria', title: 'Cancillería Ecuador', type: 'Portal', url: 'https://www.cancilleria.gob.ec/', category: 'Immigration', description: 'Ministerio de Relaciones Exteriores portal.' }]
  },
  {
    name: 'El Salvador', code: 'SV', flag: '🇸🇻', continent: 'Americas', summary: 'Bitcoin-friendly nation with new programs for tech investors and residents.',
    resources: [{ id: 'sv-migracion', title: 'Migración SV', type: 'Portal', url: 'https://www.migracion.gob.sv/', category: 'Immigration', description: 'Official Salvadoran migration site.' }]
  },
  {
    name: 'Guatemala', code: 'GT', flag: '🇬🇹', continent: 'Americas', summary: 'Rich Mayan heritage and low cost of living.',
    resources: [{ id: 'gt-migracion', title: 'IGM', type: 'Portal', url: 'https://igm.gob.gt/', category: 'Immigration', description: 'Guatemalan Institute of Migration.' }]
  },
  {
    name: 'Honduras', code: 'HN', flag: '🇭🇳', continent: 'Americas', summary: 'Beautiful Caribbean islands like Roatán with diverse residency paths.',
    resources: [{ id: 'hn-inm', title: 'INM Honduras', type: 'Portal', url: 'https://inm.gob.hn/', category: 'Immigration', description: 'National Institute of Migration.' }]
  },
  {
    name: 'Mexico', code: 'MX', flag: '🇲🇽', continent: 'Americas', summary: 'Extremely popular for its temporary resident visa based on economic solvency.',
    resources: [{ id: 'mx-inm', title: 'INM Mexico', type: 'Portal', url: 'https://www.gob.mx/inm', category: 'Immigration', description: 'National Institute of Migration (INM).' }]
  },
  {
    name: 'Panama', code: 'PA', flag: '🇵🇦', continent: 'Americas', summary: 'Friendly Nations Visa and retirement incentives make it a top expat destination.',
    resources: [{ id: 'pa-migracion', title: 'Migración Panamá', type: 'Portal', url: 'https://www.migracion.gob.pa/', category: 'Immigration', description: 'National immigration service.' }]
  },
  {
    name: 'Paraguay', code: 'PY', flag: '🇵🇾', continent: 'Americas', summary: 'Known for its low taxes and easy residency process for foreigners.',
    resources: [{ id: 'py-migraciones', title: 'Migraciones Paraguay', type: 'Portal', url: 'https://www.migraciones.gov.py/', category: 'Immigration', description: 'Official Paraguayan migration portal.' }]
  },
  {
    name: 'Peru', code: 'PE', flag: '🇵🇪', continent: 'Americas', summary: 'Cultural riches and a growing nomad scene in Lima and Cusco.',
    resources: [{ id: 'pe-migraciones', title: 'Migraciones Perú', type: 'Portal', url: 'https://www.gob.pe/migraciones', category: 'Immigration', description: 'Official Peruvian migration authority.' }]
  },
  {
    name: 'Uruguay', code: 'UY', flag: '🇺🇾', continent: 'Americas', summary: 'Stable, democratic, and offering a straightforward digital nomad permit.',
    resources: [{ id: 'uy-nomad', title: 'Digital Nomad Uruguay', type: 'Portal', url: 'https://www.gub.uy/tramites/hoja-identidad-provisoria-para-nomadas-digitales', category: 'Visa', description: 'Identity sheet for digital nomads.' }]
  },
  {
    name: 'USA', code: 'US', flag: '🇺🇸', continent: 'Americas', summary: 'World economic leader with complex but diverse visa categories (H1B, O1, E2).',
    resources: [{ id: 'us-uscis', title: 'USCIS', type: 'Portal', url: 'https://www.uscis.gov/', category: 'Immigration', description: 'U.S. Citizenship and Immigration Services.' }]
  },

  // --- OCEANIA ---
  {
    name: 'Australia', code: 'AU', flag: '🇦🇺', continent: 'Oceania', summary: 'Points-based migration and a high-demand for skilled professionals.',
    resources: [{ id: 'au-immi', title: 'ImmiAccount', type: 'Portal', url: 'https://immi.homeaffairs.gov.au/', category: 'Immigration', description: 'Australian Department of Home Affairs.' }]
  },
  {
    name: 'Fiji', code: 'FJ', flag: '🇫🇯', continent: 'Oceania', summary: 'Stunning island nation with specialized work and investment permits.',
    resources: [{ id: 'fj-immigration', title: 'Fiji Immigration', type: 'Portal', url: 'http://www.immigration.gov.fj/', category: 'Immigration', description: 'Department of Immigration official site.' }]
  },
  {
    name: 'New Zealand', code: 'NZ', flag: '🇳🇿', continent: 'Oceania', summary: 'Green List pathways for skilled workers in a country with high social trust.',
    resources: [{ id: 'nz-immigration', title: 'Immigration NZ', type: 'Portal', url: 'https://www.immigration.govt.nz/new-zealand-visas', category: 'Immigration', description: 'Official New Zealand visa portal.' }]
  },
  {
    name: 'Papua New Guinea', code: 'PG', flag: '🇵🇬', continent: 'Oceania', summary: 'Rich in natural resources and traditional cultures.',
    resources: [{ id: 'pg-ica', title: 'PNG ICA', type: 'Portal', url: 'https://ica.gov.pg/', category: 'Immigration', description: 'Immigration and Citizenship Authority.' }]
  },
  {
    name: 'Samoa', code: 'WS', flag: '🇼🇸', continent: 'Oceania', summary: 'Heart of Polynesia with unique travel and residency paths.',
    resources: [{ id: 'ws-mpmc', title: 'Samoa Immigration', type: 'Portal', url: 'https://www.mpmc.gov.ws/services/immigration/', category: 'Immigration', description: 'Ministry of the Prime Minister and Cabinet immigration services.' }]
  },
  {
    name: 'Solomon Islands', code: 'SB', flag: '🇸🇧', continent: 'Oceania', summary: 'Archipelago of hundreds of islands with diverse ecosystems.',
    resources: [{ id: 'sb-commerce', title: 'Solomon Islands Govt', type: 'Portal', url: 'https://solomons.gov.sb/', category: 'Immigration', description: 'Official government services portal.' }]
  },
  {
    name: 'Vanuatu', code: 'VU', flag: '🇻🇺', continent: 'Oceania', summary: 'Known for its citizenship by investment program and tax-free status.',
    resources: [{ id: 'vu-immigration', title: 'Vanuatu Immigration', type: 'Portal', url: 'https://immigration.gov.vu/', category: 'Immigration', description: 'Official immigration department site.' }]
  }
];

export const getCountryByCode = (code: string) => GLOBAL_REPOSITORY.find(c => c.code === code);

export const getRelevantResources = (profile: UserProfile, countryName: string) => {
  const country = GLOBAL_REPOSITORY.find(c => c.name.toLowerCase() === countryName.toLowerCase());
  if (!country) return [];

  return country.resources.map(resource => {
    let isRecommended = false;
    
    // Check Occupation Match
    if (profile.occupation && resource.matchCriteria?.occupations) {
      if (resource.matchCriteria.occupations.some(occ => 
        profile.occupation?.toLowerCase().includes(occ.toLowerCase()) || 
        occ.toLowerCase().includes(profile.occupation?.toLowerCase() || '')
      )) {
        isRecommended = true;
      }
    }

    return { ...resource, isRecommended };
  });
};
