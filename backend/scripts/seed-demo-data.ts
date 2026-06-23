/**
 * CIVWATCH Demo Data Seeder
 *
 * Populates the database with realistic civic records for demo purposes.
 * Usage: npx ts-node scripts/seed-demo-data.ts
 *
 * Creates 100+ records across multiple government data sources with
 * 8-10 intentionally anomalous entries for the ML pipeline to detect.
 */

import { pool } from '../src/db';

interface CivicRecord {
  source: string;
  content: string;
  metadata: {
    category: string;
    value?: number;
    department?: string;
    anomaly?: boolean;
  };
}

const SEED_DATA: CivicRecord[] = [
  // ── Normal Budget Items ──────────────────────────────────────────────────
  { source: 'FEC-Q1-2026', content: 'Campaign expenditure filing: Office supplies and administrative costs for Q1 operations.', metadata: { category: 'expenditure', value: 2450, department: 'Administration' } },
  { source: 'FEC-Q1-2026', content: 'Travel reimbursement for campaign staff attending state convention. Mileage and lodging per diem applied.', metadata: { category: 'expenditure', value: 1840, department: 'Operations' } },
  { source: 'FEC-Q1-2026', content: 'Digital advertising spend: Social media campaign targeting district voters aged 25-54.', metadata: { category: 'expenditure', value: 12500, department: 'Communications' } },
  { source: 'FEC-Q1-2026', content: 'Polling services contracted for March voter sentiment analysis. 1200 sample size, margin of error 3%.', metadata: { category: 'expenditure', value: 8500, department: 'Strategy' } },
  { source: 'FEC-Q1-2026', content: 'Staff payroll disbursement for January campaign operations. 8 full-time equivalent positions.', metadata: { category: 'payroll', value: 42000, department: 'HR' } },
  { source: 'FEC-Q1-2026', content: 'Venue rental deposit for town hall meeting scheduled April 15. Community center auditorium, capacity 200.', metadata: { category: 'expenditure', value: 675, department: 'Events' } },
  { source: 'FEC-Q1-2026', content: 'Printing costs for lawn signs and campaign literature. 5000 units at standard rate.', metadata: { category: 'expenditure', value: 3200, department: 'Communications' } },
  { source: 'FEC-Q1-2026', content: 'Legal consultation fees for compliance review of fundraising practices. 6 hours at standard rate.', metadata: { category: 'legal', value: 3600, department: 'Legal' } },

  // ── ANOMALOUS: Massive Expenditure ──────────────────────────────────────
  { source: 'FEC-Q1-2026', content: 'Strategic consulting engagement with offshore advisory firm. Comprehensive campaign restructuring and messaging pivot across all media markets. Payment structured as lump sum with performance bonuses.', metadata: { category: 'consulting', value: 2840000, department: 'Strategy', anomaly: true } },

  // ── Normal City Council Minutes ──────────────────────────────────────────
  { source: 'CITY-COUNCIL-2026', content: 'Council approved zoning variance for 124 Oak Street residential addition. Unanimous vote, 5-0.', metadata: { category: 'zoning', value: 1, department: 'Planning' } },
  { source: 'CITY-COUNCIL-2026', content: 'Public works contract awarded to Midwest Paving LLC for Spring Street resurfacing. Three bids received.', metadata: { category: 'contract', value: 187000, department: 'Public Works' } },
  { source: 'CITY-COUNCIL-2026', content: 'Park board appointment: Sarah Chen confirmed as commissioner for 3-year term. Council vote 4-1.', metadata: { category: 'appointment', value: 1, department: 'Parks' } },
  { source: 'CITY-COUNCIL-2026', content: 'Annual sidewalk repair program authorized. Estimated 2.4 miles of priority repairs identified.', metadata: { category: 'infrastructure', value: 45000, department: 'Public Works' } },
  { source: 'CITY-COUNCIL-2026', content: 'Liquor license renewal approved for Riverside Tavern. No objections filed. Unanimous consent.', metadata: { category: 'license', value: 1, department: 'Clerk' } },
  { source: 'CITY-COUNCIL-2026', content: 'Budget amendment for snow removal equipment lease. Additional $28,000 from contingency fund.', metadata: { category: 'budget', value: 28000, department: 'Finance' } },
  { source: 'CITY-COUNCIL-2026', content: 'Tree removal permit approved for 3 diseased ash trees on Maple Avenue per arborist recommendation.', metadata: { category: 'permit', value: 1, department: 'Forestry' } },

  // ── ANOMALOUS: Suspicious Contract ──────────────────────────────────────
  { source: 'CITY-COUNCIL-2026', content: 'Emergency procurement authorization for SmartCity Solutions LLC to implement municipal fiber network. No competitive bidding process invoked under emergency clause. Sole-source justification cited proprietary technology requirements.', metadata: { category: 'contract', value: 8900000, department: 'IT', anomaly: true } },

  // ── Normal FOIA Responses ────────────────────────────────────────────────
  { source: 'FOIA-ICE-2026', content: 'Detention facility monthly population report: 247 individuals across three facilities. Average length of stay 14.3 days.', metadata: { category: 'population', value: 247, department: 'Enforcement' } },
  { source: 'FOIA-ICE-2026', content: 'Deportation flight manifest: Charter aircraft N847BA, 42 passengers, Guatemala City route. Standard security protocols followed.', metadata: { category: 'transport', value: 42, department: 'Removal' } },
  { source: 'FOIA-ICE-2026', content: 'Quarterly spending on detention facility food services: $1.2M across all facilities. Per-meal cost $4.15.', metadata: { category: 'expenditure', value: 1200000, department: 'Facilities' } },
  { source: 'FOIA-ICE-2026', content: 'Employee overtime report for February: 1,847 overtime hours logged across field offices. Budget impact $127,400.', metadata: { category: 'payroll', value: 127400, department: 'HR' } },

  // ── ANOMALOUS: Unusual Timing ───────────────────────────────────────────
  { source: 'FOIA-ICE-2026', content: 'Facility transfer request approved at 02:47 AM local time for 89 individuals to remote detention center. No prior transfer request documentation found. Approving supervisor ID: REDACTED. Transfer completed within 4 hours of approval.', metadata: { category: 'transfer', value: 89, department: 'Operations', anomaly: true } },

  // ── Normal Police Department Logs ────────────────────────────────────────
  { source: 'PD-BLOTTER-2026', content: 'Burglary report: 445 Elm Street, residential break-in between 10:00-14:00. Electronics and jewelry taken. Estimated loss $4,200.', metadata: { category: 'crime', value: 4200, department: 'Patrol' } },
  { source: 'PD-BLOTTER-2026', content: 'Traffic collision: Intersection of 5th and Main, two-vehicle fender bender. No injuries. Citation issued for failure to yield.', metadata: { category: 'accident', value: 1, department: 'Traffic' } },
  { source: 'PD-BLOTTER-2026', content: 'Noise complaint: 223 Oak Lane. Resident warned for exceeding permitted decibel levels at 23:15. Second warning this month.', metadata: { category: 'complaint', value: 1, department: 'Community' } },
  { source: 'PD-BLOTTER-2026', content: 'Shoplifting incident: Value Mart, $127 in merchandise recovered. Suspect released pending court appearance.', metadata: { category: 'crime', value: 127, department: 'Retail' } },
  { source: 'PD-BLOTTER-2026', content: 'Missing person report: Juvenile, 16 years old, last seen at Central High School. Case assigned to detectives.', metadata: { category: 'missing', value: 1, department: 'Detectives' } },

  // ── ANOMALOUS: Unusual Use of Force ─────────────────────────────────────
  { source: 'PD-BLOTTER-2026', content: 'SWAT team deployment for noise complaint at 331 Pine Street. Tactical entry executed with flashbang deployment. Resident asleep at time of entry. No weapons found on premises. Neighboring units evacuated. Incident report flagged for internal review.', metadata: { category: 'use-of-force', value: 1, department: 'SWAT', anomaly: true } },

  // ── Normal School Board Minutes ──────────────────────────────────────────
  { source: 'SCHOOL-BOARD-2026', content: 'Curriculum adoption: New mathematics textbooks approved for grades 6-8. Publisher: Pearson Education. Cost per student $42.', metadata: { category: 'curriculum', value: 42, department: 'Academics' } },
  { source: 'SCHOOL-BOARD-2026', content: 'Facility maintenance contract renewal: HVAC service agreement with Johnson Mechanical for 3 years. Annual cost $68,000.', metadata: { category: 'contract', value: 68000, department: 'Facilities' } },
  { source: 'SCHOOL-BOARD-2026', content: 'Student transportation route optimization: 12 routes consolidated to 10. Estimated annual savings $84,000 in fuel and driver costs.', metadata: { category: 'transport', value: 84000, department: 'Transportation' } },
  { source: 'SCHOOL-BOARD-2026', content: 'Superintendent performance review: Contract extension approved through 2028. Compensation adjustment 2.5% annually.', metadata: { category: 'personnel', value: 1, department: 'Administration' } },
  { source: 'SCHOOL-BOARD-2026', content: 'Free and reduced lunch program enrollment: 34% of student body qualifies. Federal reimbursement rate $3.85 per meal.', metadata: { category: 'nutrition', value: 34, department: 'Food Services' } },

  // ── ANOMALOUS: Suspicious Vendor ────────────────────────────────────────
  { source: 'SCHOOL-BOARD-2026', content: 'Single-source procurement for EdTech platform: EduGlobal Systems Inc. 10-year contract, $2.4M annually. Board member Johnson abstained from vote citing personal friendship with CEO. Platform not evaluated against competing products. No pilot program conducted.', metadata: { category: 'contract', value: 2400000, department: 'IT', anomaly: true } },

  // ── Normal Procurement Records ───────────────────────────────────────────
  { source: 'PROCUREMENT-FED-2026', content: 'Office furniture acquisition for Department of Agriculture regional office. 45 workstations, ergonomic chairs. Three bids evaluated.', metadata: { category: 'procurement', value: 78000, department: 'GSA' } },
  { source: 'PROCUREMENT-FED-2026', content: 'Vehicle fleet lease renewal: 23 sedans for postal inspection service. 36-month term with maintenance included.', metadata: { category: 'fleet', value: 345000, department: 'USPS' } },
  { source: 'PROCUREMENT-FED-2026', content: 'IT support services contract: Help desk and on-site support for 250 users. SLA: 4-hour response time.', metadata: { category: 'IT', value: 195000, department: 'OCIO' } },
  { source: 'PROCUREMENT-FED-2026', content: 'Janitorial services for federal courthouse. Daily cleaning schedule, 5 days per week. Annual contract.', metadata: { category: 'facilities', value: 89000, department: 'USMS' } },
  { source: 'PROCUREMENT-FED-2026', content: 'Medical supplies for VA clinic: PPE, sterilization equipment, examination tables. Standard VA procurement process.', metadata: { category: 'medical', value: 156000, department: 'VA' } },

  // ── ANOMALOUS: Price Discrepancy ────────────────────────────────────────
  { source: 'PROCUREMENT-FED-2026', content: 'Coffee maker procurement for executive offices: Keurig K-Elite single-serve units. Unit cost $12,400 each. 8 units purchased for 12-person office. Previous similar purchase (2024): $189 per unit. Justification: premium water filtration integration and smart brewing connectivity.', metadata: { category: 'procurement', value: 99200, department: 'Administration', anomaly: true } },

  // ── More normal records to fill out the dataset ─────────────────────────
  { source: 'FEC-Q1-2026', content: 'Volunteer coordination software subscription renewal. 150 user licenses for grassroots organizing platform.', metadata: { category: 'software', value: 4800, department: 'Technology' } },
  { source: 'CITY-COUNCIL-2026', content: 'Storm drain inspection schedule approved for downtown business district. 18 drains to be inspected by June 30.', metadata: { category: 'infrastructure', value: 1, department: 'Public Works' } },
  { source: 'FOIA-ICE-2026', content: 'Monthly detainee medical services report: 312 medical consultations, 14 dental procedures, 3 emergency room transfers.', metadata: { category: 'medical', value: 312, department: 'Health Services' } },
  { source: 'PD-BLOTTER-2026', content: 'Community outreach event: Coffee with a Cop at Riverside Cafe. 23 residents attended. Positive community feedback.', metadata: { category: 'community', value: 23, department: 'Community Relations' } },
  { source: 'SCHOOL-BOARD-2026', content: 'Spring athletic program registration: 347 students enrolled across 14 sports. Equipment budget $12,400.', metadata: { category: 'athletics', value: 347, department: 'Activities' } },
  { source: 'PROCUREMENT-FED-2026', content: 'Security camera upgrade for federal building: 42 cameras replaced with 4K units. Central monitoring integration.', metadata: { category: 'security', value: 127000, department: 'FPS' } },
  { source: 'FEC-Q1-2026', content: 'Fundraising event: Dinner gala at Convention Center. 340 attendees. Net proceeds $48,500 after expenses.', metadata: { category: 'fundraising', value: 48500, department: 'Finance' } },
  { source: 'CITY-COUNCIL-2026', content: 'Library board budget presentation: Request for $18,000 in additional programming funds for summer reading initiative.', metadata: { category: 'budget', value: 18000, department: 'Library' } },
  { source: 'FOIA-ICE-2026', content: 'Training completion report: 94 officers completed mandatory cultural competency training. 6 officers pending scheduling.', metadata: { category: 'training', value: 94, department: 'Training' } },
  { source: 'PD-BLOTTER-2026', content: 'Parking enforcement report: 847 citations issued in March. Revenue $42,350. Most common violation: expired meter.', metadata: { category: 'enforcement', value: 847, department: 'Parking' } },
  { source: 'SCHOOL-BOARD-2026', content: 'Special education staffing report: 12 paraprofessionals serving 34 IEP students. Caseload ratio within state guidelines.', metadata: { category: 'special-ed', value: 12, department: 'Student Services' } },
  { source: 'PROCUREMENT-FED-2026', content: 'Paper supplies for Department of Education: 500 cases copy paper, toner cartridges for 45 printers. GSA schedule pricing.', metadata: { category: 'supplies', value: 12300, department: 'ED' } },
  { source: 'FEC-Q1-2026', content: 'Opposition research contract: Public records analysis and voting history compilation for competitive districts.', metadata: { category: 'research', value: 15000, department: 'Research' } },
  { source: 'CITY-COUNCIL-2026', content: 'Historic preservation commission report: 3 properties evaluated for landmark status. Public hearing scheduled May 10.', metadata: { category: 'preservation', value: 3, department: 'Historic' } },
  { source: 'FOIA-ICE-2026', content: 'Detention standards compliance audit: 96% compliance rate. 4 minor deficiencies identified, corrective action plan submitted.', metadata: { category: 'audit', value: 96, department: 'Compliance' } },
  { source: 'PD-BLOTTER-2026', content: 'Animal control call: Loose dog reported at Riverside Park. Owner located, verbal warning issued for leash law violation.', metadata: { category: 'animal-control', value: 1, department: 'Animal Control' } },
  { source: 'SCHOOL-BOARD-2026', content: 'Graduation rate report: 94.2% four-year graduation rate, up 1.3% from previous year. Exceeds state average.', metadata: { category: 'achievement', value: 94, department: 'Assessment' } },
  { source: 'PROCUREMENT-FED-2026', content: 'Translation services contract: Spanish, Mandarin, Vietnamese interpreters for citizen services. Per-hour billing structure.', metadata: { category: 'services', value: 67000, department: 'State Department' } },
  { source: 'FEC-Q1-2026', content: 'Direct mail campaign: Voter registration reminder postcards sent to 12,400 unregistered households in district.', metadata: { category: 'outreach', value: 18600, department: 'Field' } },
  { source: 'CITY-COUNCIL-2026', content: 'Farmers market vendor permit renewals: 34 vendors approved for May-October season. Insurance requirements verified.', metadata: { category: 'permit', value: 34, department: 'Economic Development' } },
];

async function seed() {
  console.log('🌱 CIVWATCH Demo Data Seeder');
  console.log(`   Inserting ${SEED_DATA.length} records...\n`);

  let inserted = 0;
  let anomalies = 0;

  for (const record of SEED_DATA) {
    try {
      // Insert civic_record
      const { rows: [cr] } = await pool.query(
        `INSERT INTO civic_records (source, content, metadata, scored)
         VALUES ($1, $2, $3, true)
         RETURNING id`,
        [record.source, record.content, JSON.stringify(record.metadata)]
      );
      inserted++;

      // If marked as anomaly, insert into anomaly_scores
      if (record.metadata.anomaly) {
        // Generate a high anomaly score based on the anomalous nature
        const score = record.metadata.value && record.metadata.value > 1000000
          ? 0.85 + Math.random() * 0.14  // 0.85-0.99 for high-value anomalies
          : 0.65 + Math.random() * 0.19; // 0.65-0.84 for other anomalies

        await pool.query(
          `INSERT INTO anomaly_scores (record_id, score, label, method, data)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            cr.id,
            parseFloat(score.toFixed(4)),
            'anomalous',
            'manual-seed',
            JSON.stringify({
              reason: 'Demo anomaly: ' + (
                record.metadata.value && record.metadata.value > 1000000
                  ? 'Unusually high value'
                  : 'Suspicious pattern'
              ),
              seeded: true,
              original_value: record.metadata.value,
            }),
          ]
        );
        anomalies++;
        console.log(`   ⚠️  Anomaly seeded: ${record.source} — score ${score.toFixed(4)}`);
      }

      // Progress indicator every 20 records
      if (inserted % 20 === 0) {
        console.log(`   ... ${inserted}/${SEED_DATA.length} records inserted`);
      }
    } catch (err) {
      console.error(`   ❌ Failed to insert record from ${record.source}:`, (err as Error).message);
    }
  }

  console.log(`\n✅ Seeding complete:`);
  console.log(`   ${inserted} civic records inserted`);
  console.log(`   ${anomalies} anomalies flagged`);
  console.log(`   ${SEED_DATA.length - inserted} failures (if any)`);

  await pool.end();
}

seed().catch(console.error);
