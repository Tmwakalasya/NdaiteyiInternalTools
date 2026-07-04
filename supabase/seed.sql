-- ============================================================
-- Mining Consortium — starting data from the Excel sheet
-- Run this AFTER schema.sql, in the Supabase SQL Editor.
--
-- Notes on the import:
--  * Name / country / profession were split into separate fields.
--  * Lukonde's email was corrected from the sheet's "@otlook.com"
--    typo to @outlook.com.
--  * Stanley Mahn's bio had a sentence about sending passport and
--    banking details; that was left out on purpose. Never store
--    passport or bank details in this database.
-- ============================================================

insert into public.members
  (full_name, country, title, email, organisation, role_in_transaction, bio, responsibilities)
values
(
  'Stanley Nuahnbolee Mahn',
  'Liberia',
  'Commodities Broker / Businessman',
  'stanleynmahn@gmail.com',
  'Independent Businessman, Liberia',
  'Commodity Broker for seller/buyer',
  'Born in Zehplay, Gbao Clan, Zoegeh District, Nimba County, Northeast Liberia, on 23 June 1951. Holds an associate degree in Political Science from North Hennepin Community College (Brooklyn Park, Minnesota), a bachelor''s degree in Political Science from the University of Texas at Dallas, and a Certificate in Public Speaking from Emory University, Atlanta, Georgia.',
  'TBD'
),
(
  'Mmeli Mdluli',
  'South Africa',
  'Commodities Broker / Businessman',
  'mmeli@sezafrica.co.za',
  'The African Commodities Hub, South Africa (Managing Director)',
  'Commodity Broker for buyer',
  'A traceable business-person and social justice and human rights practitioner in South Africa. Works with Southern African governments on development matters.',
  'TBD'
),
(
  'Lukonde Hatendi-Hyppolite',
  'Zimbabwe / Zambia',
  'Administrator, Commodities Broker, Digital Business Owner, Linguist (French & Swahili)',
  'lukondehyppolite@outlook.com',
  'HMZ Holdings Zambia Ltd. (Managing Director)',
  'Commodity Broker for seller/buyer',
  'Retired diplomat who worked for the United Nations for 27 years. Managing Director of HMZ Holdings, a company registered in Zambia to manage mineral and business activities including market research and mineral exploration. Also CEO Digital Business Owner LukondeH and an official distributor for ENAGIC International. Background in Business Management from the University of Zimbabwe and International Diplomacy. Bilingual: fluent in French and Swahili.',
  'TBD'
),
(
  'Kuray Zindi Savanhu',
  'Zimbabwe',
  'Real Estate Agent / Commodities Broker / Businessman',
  'davidzindi85@outlook.com',
  'HMZ Holdings Zambia Ltd. (Director)',
  'Commodity Broker for seller/buyer',
  'Computer Engineer, Fuel Trader and Commodity Broker.',
  'TBD'
),
(
  'Lukundo Mwendapole',
  'Zambia',
  'Commodities Broker / Businessman, Computer Engineer',
  'lukubanksss@gmail.com',
  'HMZ Holdings Zambia Ltd. (Director)',
  'Commodity Broker for seller/buyer',
  null,
  'TBD'
),
(
  'Kudzi Tsoka',
  'Zimbabwe',
  'Insurance Broker for Mining Companies in Zambia and Congo; mineral trade specialist',
  'kudzi@complexriskz.com',
  'Independent Advisor',
  'Advisor: insurance, and liaison with potential suppliers based in Congo and Zambia',
  null,
  'TBD'
);
