/**
 * Deterministic subjects for economic and energy series. One entry per
 * measured quantity. The same economy and measure from any publisher maps to
 * the same id, so forecasts compare directly. Different measures of a close
 * quantity get their own id and a `related` link (D13).
 */
import type { Subject } from "../schema.ts";

type Q = Omit<Subject, "aliases" | "kind">;

const GDP_ANNUAL =
  "Real GDP growth, calendar-year annual average over the previous year, percent. Not Q4-over-Q4 growth (the Fed SEP measure), which needs its own subject.";

function gdp(id: string, name: string, extra = ""): Q {
  return { id, name, notes: `${GDP_ANNUAL}${extra}` };
}

export const QUANTITIES: Q[] = [
  { ...gdp("world-real-gdp-growth", "World real GDP growth", " IMF WEO weights the world aggregate at purchasing power parity; a world figure at market exchange rates (World Bank, OECD) is a different measure."), related: ["global-gdp", "world-real-gdp-growth-market-exchange-rates"] },
  { ...gdp("advanced-economies-real-gdp-growth", "Advanced economies real GDP growth", " Group as defined by the IMF at the time of each edition."), related: ["advanced-economies-real-gdp-growth-world-bank"] },
  { ...gdp("emerging-and-developing-economies-real-gdp-growth", "Emerging market and developing economies real GDP growth", " Group as defined by the IMF at the time of each edition."), related: ["emerging-and-developing-economies-real-gdp-growth-world-bank"] },
  { ...gdp("united-states-real-gdp-growth", "United States real GDP growth"), related: ["us-gdp", "united-states-real-gdp-growth-q4-over-q4", "united-states-real-gnp-growth"] },
  gdp("euro-area-real-gdp-growth", "Euro area real GDP growth", " Membership as at the time of each edition."),
  gdp("china-real-gdp-growth", "China real GDP growth"),
  gdp("india-real-gdp-growth", "India real GDP growth", " The IMF reports India on a fiscal-year basis (April to March)."),
  gdp("brazil-real-gdp-growth", "Brazil real GDP growth"),
  gdp("japan-real-gdp-growth", "Japan real GDP growth"),
  gdp("germany-real-gdp-growth", "Germany real GDP growth"),
  gdp("united-kingdom-real-gdp-growth", "United Kingdom real GDP growth"),

  gdp("world-real-gdp-growth-market-exchange-rates", "World real GDP growth at market exchange rates", " World Bank GEP weights the world aggregate at market exchange rates; the IMF's PPP-weighted world figure is a different measure."),
  gdp("oecd-total-real-gdp-growth", "OECD total real GDP growth", " OECD members as at the time of each edition."),
  gdp("advanced-economies-real-gdp-growth-world-bank", "Advanced economies real GDP growth (World Bank grouping)", " World Bank grouping, from June 2016; not the IMF grouping of the same name."),
  gdp("emerging-and-developing-economies-real-gdp-growth-world-bank", "Emerging market and developing economies real GDP growth (World Bank grouping)", " World Bank grouping, from June 2016; not the IMF grouping of the same name."),
  gdp("high-income-countries-real-gdp-growth", "High-income countries real GDP growth (World Bank grouping)", " World Bank grouping used until January 2016."),
  gdp("developing-countries-real-gdp-growth", "Developing countries real GDP growth (World Bank grouping)", " Low- and middle-income countries, World Bank grouping used until January 2016."),
  {
    id: "united-states-real-gdp-growth-q4-over-q4",
    name: "United States real GDP growth, Q4 over Q4",
    notes: "Percent change in real GDP from the fourth quarter of the previous year to the fourth quarter of the year (Fed SEP measure). Not the annual-average measure.",
    related: ["united-states-real-gdp-growth"],
  },
  { id: "united-states-unemployment-rate", name: "United States unemployment rate, annual average", notes: "Civilian unemployment rate, calendar-year average (CBO measure).", related: ["united-states-unemployment-rate-q4"] },
  { id: "united-states-unemployment-rate-q4", name: "United States unemployment rate, Q4 average", notes: "Average civilian unemployment rate in the fourth quarter of the year (Fed SEP measure).", related: ["united-states-unemployment-rate"] },
  { id: "united-states-pce-inflation-q4-over-q4", name: "United States PCE inflation, Q4 over Q4", notes: "Percent change in the PCE price index, fourth quarter over fourth quarter.", related: ["united-states-core-pce-inflation-q4-over-q4", "united-states-cpi-inflation"] },
  { id: "united-states-core-pce-inflation-q4-over-q4", name: "United States core PCE inflation, Q4 over Q4", notes: "PCE price index excluding food and energy, fourth quarter over fourth quarter.", related: ["united-states-pce-inflation-q4-over-q4"] },
  { id: "united-states-federal-funds-rate-year-end", name: "United States federal funds rate at year end", notes: "Target level, or midpoint of the target range, at the end of the year." },
  { id: "united-states-cpi-inflation", name: "United States CPI-U inflation, annual average", notes: "Consumer price index for all urban consumers, calendar-year average over the previous year.", related: ["united-states-pce-inflation-q4-over-q4"] },
  { id: "united-states-10-year-treasury-rate", name: "United States 10-year Treasury note rate", notes: "Calendar-year average of the 10-year Treasury note rate." },
  { id: "united-states-aaa-corporate-bond-rate", name: "United States Aaa corporate bond rate", notes: "Calendar-year average." },
  { id: "united-states-real-gnp-growth", name: "United States real GNP growth", notes: "Real gross national product, the headline output measure before 1992.", related: ["united-states-real-gdp-growth"] },
  { id: "united-states-federal-budget-deficit", name: "United States federal budget deficit", notes: "Federal surplus or deficit, fiscal year (October to September), billion USD; negative is a deficit." },
  { id: "euro-area-hicp-inflation", name: "Euro area HICP inflation", notes: "Annual average percentage change of the euro area Harmonised Index of Consumer Prices." },
  { id: "united-kingdom-cpi-inflation", name: "United Kingdom CPI inflation", notes: "Consumer prices index, calendar-year percentage change on a year earlier." },
  { id: "united-kingdom-public-sector-net-borrowing", name: "United Kingdom public sector net borrowing", notes: "Fiscal year April to March. Stated in GBP billion or percent of GDP; each claim carries its unit." },

  { id: "brazil-ipca-inflation", name: "Brazil IPCA inflation", notes: "IPCA consumer price inflation, December over December, percent (IBGE)." },
  { id: "brazil-selic-rate-year-end", name: "Brazil Selic target rate at year end", notes: "Copom Selic target in force at the end of the year, percent per year." },
  {
    id: "brazil-usd-brl-exchange-rate-last-business-day",
    name: "USD/BRL exchange rate on the last business day of the year",
    notes: "PTAX sell rate on the last business day of the year, BRL per USD. The Focus survey used this definition until 2021-01-24.",
    related: ["brazil-usd-brl-exchange-rate-december-average"],
  },
  {
    id: "brazil-usd-brl-exchange-rate-december-average",
    name: "USD/BRL exchange rate, December average",
    notes: "Average PTAX sell rate in December, BRL per USD. The Focus survey uses this definition from 2021-01-25.",
    related: ["brazil-usd-brl-exchange-rate-last-business-day"],
  },

  { id: "global-solar-pv-installed-capacity", name: "Global solar PV installed capacity", notes: "Cumulative installed solar photovoltaic capacity, world, GW. IEA figures and Ember figures can differ in basis (DC or AC).", related: ["global-solar-installed-capacity"] },
  { id: "global-solar-pv-generation", name: "Global solar PV electricity generation", notes: "Electricity generated by solar photovoltaics, world, TWh.", related: ["global-solar-generation"] },
  { id: "global-solar-installed-capacity", name: "Global solar installed capacity (all solar)", notes: "IEA WEO 2002 to 2009 annex row 'Solar'. Includes solar thermal (CSP) at least in 2004; unknown for the other editions.", related: ["global-solar-pv-installed-capacity"] },
  { id: "global-solar-generation", name: "Global solar electricity generation (all solar)", notes: "IEA WEO 2002 to 2009 annex row 'Solar'. Includes solar thermal (CSP) at least in 2004; unknown for the other editions.", related: ["global-solar-pv-generation"] },
  { id: "global-wind-installed-capacity", name: "Global wind installed capacity", notes: "Cumulative installed wind capacity, onshore and offshore, world, GW." },
  { id: "global-wind-generation", name: "Global wind electricity generation", notes: "Electricity generated by wind, onshore and offshore, world, TWh." },

  { id: "us-solar-generation", name: "US solar electricity generation", notes: "EIA solar net generation, all sectors, billion kWh." },
  { id: "us-wind-generation", name: "US wind electricity generation", notes: "EIA wind net generation, all sectors, billion kWh." },
  { id: "us-electricity-sales", name: "US electricity sales", notes: "EIA total electricity sales (from AEO Retrospective 2022: excluding direct use), billion kWh." },
  { id: "us-total-energy-consumption", name: "US total energy consumption", notes: "EIA total energy consumption, all sectors, quadrillion Btu." },
  { id: "us-transportation-energy-consumption", name: "US transportation energy consumption", notes: "EIA total (delivered) transportation energy consumption, quadrillion Btu." },
  { id: "us-energy-co2-emissions", name: "US energy-related CO2 emissions", notes: "EIA total energy-related carbon dioxide emissions, million metric tons." },
  { id: "us-petroleum-liquids-consumption", name: "US petroleum and other liquids consumption", notes: "EIA total petroleum (and other liquids) consumption. The unit changes between retrospectives (million barrels per day or per year); each claim carries its unit." },
  { id: "us-imported-crude-oil-price-nominal", name: "US imported crude oil price, nominal", notes: "EIA imported refiner acquisition cost of crude oil (earlier 'world oil price'), nominal USD per barrel.", related: ["us-imported-crude-oil-price-real"] },
  { id: "us-imported-crude-oil-price-real", name: "US imported crude oil price, real", notes: "EIA imported refiner acquisition cost of crude oil in constant dollars. The dollar year differs by edition; each claim carries its unit.", related: ["us-imported-crude-oil-price-nominal"] },
  { id: "us-natural-gas-wellhead-price-nominal", name: "US natural gas wellhead price, nominal", notes: "EIA natural gas wellhead price, nominal USD per thousand cubic feet. No longer reported after 2012.", related: ["us-natural-gas-price-electric-power-nominal"] },
  { id: "us-natural-gas-price-electric-power-nominal", name: "US natural gas price to the electric power sector, nominal", notes: "EIA natural gas price, electric power sector, nominal. Unit differs by retrospective (per million Btu or per thousand cubic feet).", related: ["us-natural-gas-price-electric-power-real", "us-natural-gas-wellhead-price-nominal"] },
  { id: "us-natural-gas-price-electric-power-real", name: "US natural gas price to the electric power sector, real", notes: "EIA natural gas price, electric power sector, constant dollars. Dollar year and unit differ by retrospective.", related: ["us-natural-gas-price-electric-power-nominal"] },

  { id: "global-passenger-ev-sales", name: "Global passenger EV sales", notes: "Annual sales of plug-in electric passenger vehicles (BEV and PHEV), world.", related: ["global-ev-sales", "electric-vehicles"] },
  { id: "global-ev-sales", name: "Global EV sales (scope as stated)", notes: "Annual EV sales where the publisher does not restrict the scope to passenger vehicles (for example light-duty vehicles), or restricts it to battery EVs; each claim states its scope in `metric`.", related: ["global-passenger-ev-sales", "electric-vehicles"] },
  { id: "global-ev-share-of-new-passenger-car-sales", name: "EV share of new passenger car sales, world", notes: "Plug-in EV share of new passenger car (or passenger vehicle) sales, percent.", related: ["global-ev-share-of-new-light-duty-vehicle-sales", "global-zev-share-of-new-passenger-car-sales", "global-ev-share-of-new-vehicle-sales"] },
  { id: "global-ev-share-of-new-light-duty-vehicle-sales", name: "EV share of new light-duty vehicle sales, world", notes: "Includes light commercial vehicles.", related: ["global-ev-share-of-new-passenger-car-sales"] },
  { id: "global-zev-share-of-new-passenger-car-sales", name: "Zero-emission share of new passenger car sales, world", notes: "Zero-emission vehicles only; may exclude plug-in hybrids.", related: ["global-ev-share-of-new-passenger-car-sales"] },
  { id: "global-ev-share-of-new-vehicle-sales", name: "EV share of new vehicle sales (cars, vans and trucks), world", notes: "All road vehicle segments combined.", related: ["global-ev-share-of-new-passenger-car-sales"] },
  { id: "global-ev-share-of-car-fleet", name: "EV share of the passenger car fleet, world", notes: "Share of cars on the road, not of sales.", related: ["global-ev-share-of-light-duty-fleet"] },
  { id: "global-ev-share-of-light-duty-fleet", name: "EV share of the light-duty vehicle fleet, world", notes: "Includes light commercial vehicles.", related: ["global-ev-share-of-car-fleet"] },
  { id: "ev-price-parity-with-ice", name: "Year electric cars reach price parity with combustion cars", notes: "Publishers define parity differently (upfront price, lifetime cost, segment). Each claim states its definition in `metric`.", related: ["electric-vehicles"] },
  { id: "global-ev-stock", name: "Electric vehicles on the road, world", notes: "Stock of electric vehicles. Scope varies (cars; cars and trucks; all EVs); each claim states it in `metric`.", related: ["global-ev-share-of-car-fleet", "electric-vehicles"] },
  { id: "global-oil-demand", name: "Global oil demand", notes: "World oil demand, million barrels per day. BP's tables differ on whether biofuels are included; each claim states it in `metric`.", related: ["global-liquids-demand"] },
  { id: "global-liquids-demand", name: "Global liquids demand", notes: "Oil, biofuels and other liquids, world, million barrels per day.", related: ["global-oil-demand"] },
  { id: "global-renewables-share-of-primary-energy", name: "Renewables share of world primary energy (excluding hydro)", notes: "Non-hydro renewables as a share of primary energy. BP's definition of which bioenergy counts changes between editions; each claim states it in `metric`." },
  { id: "global-renewables-share-of-electricity", name: "Renewables share of world electricity generation", notes: "Share of world power generation. Whether hydro is included depends on the publisher; each claim states it in `metric`." },
  { id: "ev-fleet-majority-year", name: "Year EVs outnumber combustion vehicles on the road", notes: "Passenger vehicle fleet, world." },
];

export const QUANTITY_BY_ID = new Map(QUANTITIES.map((q) => [q.id, q]));

export function quantity(id: string): string {
  if (!QUANTITY_BY_ID.has(id)) throw new Error(`unknown quantity subject ${id}`);
  return id;
}
