import json

# Data to be written into JSON file
data = [
    {"dateRep": "14/12/2020", "day": "14", "month": "12", "year": "2020", "cases": 788, "deaths": 14,
     "countriesAndTerritories": "Albania", "geoId": "AL", "countryterritoryCode": "ALB", "popData2019": 2862427.0,
     "continentExp": "Europe", "Cumulative_number_for_14_days_of_COVID-19_cases_per_100000": "380.97041427"},
    {"dateRep": "13/12/2020", "day": "13", "month": "12", "year": "2020", "cases": 879, "deaths": 12,
     "countriesAndTerritories": "Albania", "geoId": "AL", "countryterritoryCode": "ALB", "popData2019": 2862427.0,
     "continentExp": "Europe", "Cumulative_number_for_14_days_of_COVID-19_cases_per_100000": "382.61237754"},
    {"dateRep": "12/12/2020", "day": "12", "month": "12", "year": "2020", "cases": 802, "deaths": 12,
     "countriesAndTerritories": "Albania", "geoId": "AL", "countryterritoryCode": "ALB", "popData2019": 2862427.0,
     "continentExp": "Europe", "Cumulative_number_for_14_days_of_COVID-19_cases_per_100000": "370.9439577"}
]

# Save data to a JSON file
file_path = 'style/sample.json'
with open(file_path, 'w') as json_file:
    json.dump(data, json_file, indent=4)