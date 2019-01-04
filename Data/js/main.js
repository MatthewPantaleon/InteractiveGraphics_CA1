$(function() {
	"use strict";
	
	console.log("Script Started");
	
	
	//console.log(d3);
	
	
	//
	// functions that make the JSON data into usable arrays and objects for d3
	//
	
	//converts objects into arrays of their keys or values
	/*
		raw -> object to be converted in to an array of its keys or values. Object
		type -> String to determine if keys or values to be used. "keys" or "values"

	*/
	function getData(raw, type){

		var rawArray = [];

		if(type === "values"){
		   for(var i = 0; i < Object.values(raw).length; i++){
				rawArray.push(Object.values(raw)[i]);
			}
		}else if(type === "keys"){
			for(var k = 0; k < Object.keys(raw).length; k++){
				rawArray.push(Object.keys(raw)[k]);
			}	 
		}

		return rawArray;
	}
	
	//generate heatmap coordinates with their coresponsding value of the users choice
	/*
		attribute1 -> first array to dertermine rows. Array
		attribute2 -> second array to determine columns. Array
		attrubute3 -> third array to dertermine which value to select. Array
		valueArray -> array of all values to extract from. Array
		index -> number to determine which index in attribute3 to select the value. Integer
	*/
	function heatMap(attribute1, attribute2, attribute3, valueArray, index){
		
		var coords = [];
		var increment = 0;
		
		for(var d = 0; d < attribute1.length; d++){
			
			for(var dd = 0; dd < attribute2.length; dd++){
				coords.push({
					row: d, 
					col: dd, 
					value: valueArray[index + (attribute3.length * increment)],
					valueName: attribute3[index]
				});
				//console.log(coords[d * dd].value);
				increment++;
			}
		}
		return coords;
	}
	
	
	//merge everything into a useable dataset
	/*
		object1 -> first object values/keys to be looped into each array element. Object
		object2 -> second object values/keys to be looped into each object in each array element. Object
		object3 -> determines length of master array. Object

		these arguments use getData() to convert into arrays
		type1 -> determine either keys or values to be extracted from object1. "keys" or "values"
		type2 -> determine either keys or values to be extracted from object2. "keys" or "values"


		valueArray -> array of all total values to be mapped into the master array. Array
		
		This ensures that all values can be referenced by all three of its attributes
		
	*/
	function masterArray(object1, object2, object3, type1, type2, valueArray){
		var Values = [];
		var index = 0;

		var array1 = getData(object1, type1);
		var array2 = getData(object2, type2);

		for(var b1 = 0; b1 < Object.values(object3).length; b1++){
			Values[b1] = {};

			for(var b2 = 0; b2 < array1.length; b2++){
				Values[b1][array1[b2]] = {};

				for(var b3 = 0; b3 < array2.length; b3++){
					Values[b1][array1[b2]][array2[b3]] = valueArray[index];
					index++;
				}
			}
		}
		return Values;
	}
	
	
	//truncate data to fit another dataset. Used to add yearly quarters into full years
	/*
		Master -> Master Array created with ALL values mapped. Array
		attr1 -> first attribute in mapped array to define value to be selected. String
		arrt2 -> second attribute in mapped array to define value to be selected. String
		Band -> group size to be summed. Int
	*/
	function truncate(Master, attr1, attr2, Band){
		var truncatedArray = [];
		
		var Counter = 0;
		var temp = 0;

		for(var t = 0; t < Master.mapped.length; t++){

			for(var tt = 0; tt < Master[attr1].length; tt++){
				//console.log(testMaster.mapped[t][testMaster.badThings[tt]]);
				Counter = 0;

				for(var q = 0; q < Math.ceil(Master[attr2].length / Band) * Band; q++){
					for(var tv = 0; tv < Band; tv++){

						if((Counter * Band) + tv < Master[attr2].length){
							//temp += testValues[(testCounter * testBand) + tv];
							temp += Master.mapped[t][Master[attr1][tt]][Master[attr2][Counter * Band + tv]];
							//console.log(temp);
						}else{
							break;
						}

					}

					if(q < Math.ceil(Master[attr2].length / Band)){
						//console.log(truncatedArray);
						truncatedArray.push(temp);	
						temp = 0;
					}
					
					Counter++;
				}
			}
		}
		
		
		return truncatedArray;
	}
	
	//average values if two value sets belong to one entity/county
	function merge(){
		
	}
	
	
	//trim off unwated data in the master array
	function trim(Master, ){
		var newMapped = [];
		
		for(var cdr = 0; cdr < crimeDivisionYear.regions.length; cdr++){
			for(var cdy = 0; cdy < crimeDivision.crimeType.length; cdy++){
				if(!selectIndex.includes(cdy)){
					delete crimeDivisionYear.mapped[cdr][crimeDivisionYear.crimeType[cdy]];

				}
			}
		}
		
	}
	
	var initialise = true;
	var thresholds = [];
	
	function getColour(coords, c, base, slice, gap){
		var max = d3.max(coords, function(d){return parseInt(d.value);});
		//var max = 0;

		if(initialise){
			slice++;
			for(var t = 0; t < slice * 2 - 1; t++){
				thresholds[t] = Math.ceil(base * (1 - (gap * (slice - (t + 1)) / 100)));
			}
			initialise = false;
			console.log(thresholds);
		}

//										for(var tt = 0; tt < thresholds.length; tt++){
//											if(thresholds[tt + 1] > c && thresholds[tt] < c){
//												max = thresholds[tt];
//											}
//										}

		var percentage = c * 100 / max;
		var p = percentage * 2.55;
		return "rgb(0, " + Math.ceil(p) + ", 0)";
	}
	
	d3.json("data/education_town_2016.json", function(error, education_town_2016){
		if(error !== null){console.log("Unable to laod education_town_2016 JSON file");}
		
		d3.json("data/crime_by_region_Q.json", function(error, crime_by_region_Q){
			if(error !== null){console.log("Unable to laod crime_by_region_Q JSON file");}
			
			d3.json("data/population_county.json", function(error, population_county){
				if(error !== null){console.log("Unable to laod population_county JSON file");}
				
				d3.json("data/income_region.json", function(error, income_region){
					if(error !== null){console.log("Unable to laod income_region JSON file");}
					
					d3.json("data/income_by_education.json", function(error, income_by_education){
						if(error !== null){console.log("Unable to laod income_by_education JSON file");}
						
						d3.json("data/education_town_2011.json", function(error, education_town_2011){
							if(error !== null){console.log("Unable to laod income_by_education JSON file");}
							
							d3.json("data/education_county_city_2016_2011.json", function(error, education_county_city_2016_2011){
							if(error !== null){console.log("Unable to laod income_by_education JSON file");}
								
								d3.json("data/income_county_2015.json", function(error, income_county_2015){
									if(error !== null){console.log("Unable to laod income_by_education JSON file");}
								
									
									//assign shorthand variable names
									var ET_2016 = education_town_2016;
									var CR_Q = crime_by_region_Q;
									var PC = population_county;
									var IR = income_region;
									var IE = income_by_education;
									var ET_2011 = education_town_2011;
									var EC_2016_2011 = education_county_city_2016_2011;
									var IC_2015 = income_county_2015;

									console.log(ET_2016);
									console.log(CR_Q);
									console.log(PC);
									console.log(IR);
									console.log(IE);
									console.log(ET_2011);
									console.log(EC_2016_2011);
									console.log(IC_2015);

									
									//object of counties
									var baseCounties = {
										1: "Carlow",
										2: "Cavan",
										3: "Clare",
										4: "Cork",
										5: "Donegal",
										6: "Dublin",
										7: "Galway",
										8: "Kerry",
										9: "Kildare",
										10: "KilKenny",
										11: "Laois",
										12: "Leitrim",
										13: "Limerick",
										14: "Longford",
										15: "Louth",
										16: "Mayo",
										17: "Meath",
										18: "Monaghan",
										19: "Offaly",
										20: "Roscommon",
										21: "Sligo",
										22: "Tipperary",
										23: "Waterford",
										24: "Westmeath",
										25: "Wexford",
										26: "Wicklow"
									};
									
									
									//
									// Estimates of Household Income by County and Region, Year and Statistic 
									//
									
									//get object of counties
									var county_raw = IC_2015.dataset.dimension['County and Region'].category.label;
									
									//get object of income types
									var income_types_raw = IC_2015.dataset.dimension.Statistic.category.label;
									
									//get all values
									var income_values_raw = IC_2015.dataset.value;
									
									//get object of years
									var years_raw = IC_2015.dataset.dimension.Year.category.label;
									
									//bundle attribute arrays in a master object
									var incomeByCounty = {};
									incomeByCounty.counties = getData(county_raw, "values");
									incomeByCounty.incomeTypes = getData(income_types_raw, "values");
									incomeByCounty.years = getData(years_raw, "values");
									incomeByCounty.mapped = masterArray(years_raw, income_types_raw, county_raw, "keys", "values", income_values_raw);
									incomeByCounty.values = income_values_raw;
									
									//
									// Income and Poverty Rates by Region, Year and Statistic
									//
									
									//get object of regions
									
//									//get object of median values
//									var income_region_medians = IR.dataset.dimension.Region.category.label;
//									
//									//get object of years
//									var income_year_medians = IR.dataset.dimension.Year.category.label;
//									
//									//get object of income value types
//									var income_type_medians = IR.dataset.dimension.Statistic.category.label;
//									
//									//get value array for mean income
//									var income_median_values = IR.dataset.value;
//									
//									var incomeMedianByRegion = {};
//									incomeMedianByRegion.regions = getData(income_region_medians, "values");
//									incomeMedianByRegion.medians = getData(income_type_medians, "values");
//									incomeMedianByRegion.years = getData(income_year_medians, "values");
//									incomeMedianByRegion.mapped = masterArray(income_year_medians, income_type_medians, income_region_medians, "keys", "values", income_median_values);
//									incomeMedianByRegion.values = income_values_raw;
									
									
									//
									// Population at Each Census 1841 to 2016 by County, Sex and CensusYear
									//
									
//									//get object of counties
//									var population_by_county = PC.dataset.dimension.County.category.label;
//									
//									//get object of years
//									var population_by_year = PC.dataset.dimension["Census Year"].category.label;
//									
//									//get population_by_sex
//									var population_by_sex = PC.dataset.dimension.Sex.category.label;
//									
//									//get populsation values
//									var population_total = PC.dataset.value;
//									
//									var populationCounties = {};
//									populationCounties.counties = getData(population_by_county, "values");
//									populationCounties.sex = getData(population_by_sex, "values");
//									populationCounties.years = getData(population_by_year, "values");
//									populationCounties.mapped = masterArray(population_by_sex, population_by_year, population_by_county, "values", "values", population_total);
//									populationCounties.values = population_total;
									
									
									
									//
									// Get crime rates by division and quarter
									//
									
									//get object of divisions
									var garda_division = CR_Q.dataset.dimension["Garda Division"].category.label;
									
									//get object of quarters
									var yearly_quarters = CR_Q.dataset.dimension.Quarter.category.label;
									
									//get object of crime type
									var crime_type = CR_Q.dataset.dimension["Type of Offence"].category.label;
									
									//get all values
									var crime_total = CR_Q.dataset.value;
									
									console.log(yearly_quarters);
									
									var crimeDivision = {};
									
									crimeDivision.regions = getData(garda_division, "values");
									crimeDivision.crimeType = getData(crime_type, "values");
									crimeDivision.crimeIndex = getData(crime_type, "keys");
									crimeDivision.yearQuarter = getData(yearly_quarters, "values");
									crimeDivision.mapped = masterArray(crime_type, yearly_quarters, garda_division, "values", "values", crime_total);
									crimeDivision.values = crime_total;
									
									
									//trancate quarterly to anually, garda division to county
									var truncateCrime = {};
									
									//console.log(testArray);
									
//									var allCrimeArray = [];
//									for(var qq = 0 ; qq < crimeDivision.crimeIndex.length; qq++){
//
//										if(qq < 16){
//
//											if(crime_type[qq * 100] !== undefined){
//												allCrimeArray.push(crime_type[qq * 100]);
//											}
//
//										}
//									}
//									console.log(allCrimeArray);
									
									
									
									//console.log(populationCounties);
									console.log(incomeByCounty);
									console.log(crimeDivision);
									
									
									//graphing of the data
									var svgHeight = 1000;
									var svgWidth = 1300;
									
									var thing = d3.select("body").append("svg").attr("width", svgWidth).attr("height", svgHeight);
									
									var itemSize = 25;
									var cellSize = itemSize - 1;
									var margin = {left: 100, right: 50, top: 50, bottom: 50};
									
									var width = 750 - margin.right - margin.left;
									var height = 300 - margin.top - margin.bottom;
									
									
									
									var xScale = d3.scaleBand().range([margin.left, incomeByCounty.counties.length * itemSize]);
									var yScale = d3.scaleBand().range([0, incomeByCounty.counties.length * itemSize]);
									
									xScale.domain(incomeByCounty.years);
									yScale.domain(incomeByCounty.counties);
									
									//graph incometypes axis
									thing.append("g")
										.attr("class", "axis")
										.attr("transform", "translate("+ 0 + ", " + margin.top +")")
										.call(d3.axisTop(xScale));
									
									//graph incometypes
									thing.append("g")
										.attr("class", "axis")
										.attr("transform", "translate("+ margin.left + ", " + margin.top +")")
										.call(d3.axisLeft(yScale));
									
									
									
									
									//make a new value array without other regions
									var countiesArray = getData(baseCounties, "values");
									console.log(countiesArray);
									console.log(incomeByCounty.counties);
									incomeByCounty.newCounties = [];
									var excludeArray = ["State", "Border, Midland and Western", "Border", "Midland", "West", "Southern and Eastern", "Mid-East", "Mid-West", "South-East", "South-West"];
									
									for(var ibc = 0; ibc < incomeByCounty.mapped.length; ibc++){
										if(!excludeArray.includes(incomeByCounty.counties[ibc])){
											console.log(incomeByCounty.counties[ibc]);
											incomeByCounty.newCounties.push(incomeByCounty.counties[ibc]);
										}
									}
									console.log(incomeByCounty.newCounties);
									
									//attribute1, attribute2, valueArray, index
									var incomeByCounty_coords = heatMap(incomeByCounty.counties, incomeByCounty.years, incomeByCounty.incomeTypes, incomeByCounty.values, 11);
									
									//var incomeMedianRegion_coords = heatMap(incomeMedianByRegion.regions, incomeMedianByRegion.years, incomeMedianByRegion.medians, incomeMedianByRegion.values, 0);
									
									var averageDisposableIncome = 0;
									var totalDisposableIncome = 0;
									
									for(var p = 0; p < incomeByCounty_coords.length - 1; p++){
										totalDisposableIncome += incomeByCounty_coords[p].value;
									}
									
									console.log(totalDisposableIncome);
									console.log(Math.ceil(totalDisposableIncome / incomeByCounty_coords.length));
									
									averageDisposableIncome = Math.ceil(totalDisposableIncome / incomeByCounty_coords.length);
									
									
									
									
									
									console.log(incomeByCounty_coords);
									
									
									//disposable income by county heatmap
									thing.append("g")
											.attr("class", "test")
											.selectAll()
											.data(incomeByCounty_coords)
											.enter()
											.append("rect")
											.attr("x", function(d){
												return 3 + margin.left + xScale.step() * d.col;
											})
											.attr("y", function(d){
												return 3 + margin.top + yScale.step() * d.row;
											})
											.attr("width", xScale.step() - 2)
											.attr("height", yScale.step() - 2)
											.attr("fill", function(d){
												return getColour(incomeByCounty_coords, d.value, averageDisposableIncome, 2, 10);
											})
									
											.on("mouseover", function(d, i, e){
												thing.append("text").text(d.value)
												.attr("x", xScale.step()/2  + margin.left + xScale.step()  * d.col)
												.attr("y", yScale.step()/2 + margin.top + yScale.step() * d.row)
												.attr("id", d.value + "r" + i);
												
											})
											.on("mouseout", function(d, i){
												d3.select('[id="' + d.value + 'r' + i + '"]').remove();
											});
									
									
									$("#selection").on("change", function(e){
										
										switch(parseInt($("#selection").val())){
											case 1:
												console.log("Income by county");
												break;
											case 2:
												console.log("Something else");
												break;
											case 3:
												console.log("Third thingy");
												break;
											case 4:
												console.log("The final thingy");
												break;
											default:
												console.log("You shouldn't be here");
												break;
										}
										
									});
									
									//masterArray(crime_type, yearly_quarters, garda_division, "values", "values", crime_total);
									var areas = {10: "location_1", 20: "location_2", 30: "location_3"};
									var badThings = {10: "Kill", 20: "Steal", 30: "Destroy"};
									var quarters = {
										"2001Q1": "2001Q1",
										"2001Q2": "2001Q2",
										"2001Q3": "2001Q3",
										"2001Q4": "2001Q4",
										"2002Q1": "2002Q1",
										"2002Q2": "2002Q2",
										"2002Q3": "2002Q3",
										"2002Q4": "2002Q4",
										"2003Q1": "2003Q1",
										"2003Q2": "2003Q2",
										"2003Q3": "2003Q3",
										"2003Q4": "2003Q4",
										"2004Q1": "2004Q1",
										"2004Q2": "2004Q2",
										"2004Q3": "2004Q3",
										"2004Q4": "2004Q4",
										"2005Q1": "2005Q1",
										"2005Q2": "2005Q2"
									};
									
									//areas -> badtThings -> quarter
									var testValues = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 4, 4, //10 -> Kill. 10, 10, 10, 10, 8
													  2, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 3, 3, //10 -> Steal. 9, 9, 9, 9, 6
													  1, 1, 0, 3, 1, 1, 0, 3, 1, 1, 0, 3, 1, 1, 0, 3, 2, 2, //10 -> Destroy. 5, 5, 5, 5, 4
													  1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 4, 4, //20 -> Kill. 10, 10, 10, 10, 8
													  2, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 3, 3, //20 -> Steal. 9, 9, 9, 9, 6
													  1, 1, 0, 3, 1, 1, 0, 3, 1, 1, 0, 3, 1, 1, 0, 3, 2, 2, //20 -> Destroy. 5, 5, 5, 5, 4
													  1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 4, 4, //30 -> Kill. 10, 10, 10, 10, 8
													  2, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 3, 3, //30 -> Steal. 9, 9, 9, 9, 6
													  1, 1, 0, 3, 1, 1, 0, 3, 1, 1, 0, 3, 1, 1, 0, 3, 2, 2, //30 -> Destroy. 5, 5, 5, 5, 4
													 ];
									
									var testBand = 4;
									
									var testMaster = {};
									testMaster.areas = getData(areas, "values");
									testMaster.badThings = getData(badThings, "values");
									testMaster.quarters = getData(quarters, "values");
									testMaster.mapped = masterArray(badThings, quarters, areas, "values", "values", testValues);
									console.log(testMaster);
									
									var truncatedTest = [];
									
//									var testCounter = 0;
//									var temp = 0;
//									
//									for(var t = 0; t < testMaster.mapped.length; t++){
//										
//										for(var tt = 0; tt < testMaster.badThings.length; tt++){
//											//console.log(testMaster.mapped[t][testMaster.badThings[tt]]);
//											testCounter = 0;
//											
//											for(var q = 0; q < Math.ceil(testMaster.quarters.length / testBand) * testBand; q++){
//												for(var tv = 0; tv < testBand; tv++){
//													
//													if((testCounter * testBand) + tv < testMaster.quarters.length){
//														//temp += testValues[(testCounter * testBand) + tv];
//														temp += testMaster.mapped[t][testMaster.badThings[tt]][testMaster.quarters[testCounter * testBand + tv]];
//														console.log(temp);
//													}else{
//														break;
//													}
//													
//												}
//												
//												if(q < Math.ceil(testMaster.quarters.length / testBand)){
//													console.log(truncatedTest);
//													truncatedTest.push(temp);	
//													temp = 0;
//												}
//												testCounter++;
//											}
//											
//											
//											
//										}
//										//testCounter = 0;
//										
//										
//										
//									}
									
									//truncatedTest = truncate(testMaster, "badThings", "quarters", 4);
									
									var baseYears ={"2003": "2003",
													"2004": "2004",
													"2005": "2005",
													"2006": "2006",
													"2007": "2007",
													"2008": "2008",
													"2009": "2009",
													"2010": "2010",
													"2011": "2011",
													"2012": "2012",
													"2013": "2013",
													"2014": "2014",
													"2015": "2015",
													"2016": "2016",
													"2017": "2017",
													"2018": "2018",
													
													};
									
									var truncatedCrimeValues = [];
									truncatedCrimeValues = truncate(crimeDivision, "crimeType", "yearQuarter", 4);
									console.log(truncatedCrimeValues);
									
									var crimeDivisionYear = {};
									crimeDivisionYear.regions = getData(garda_division, "values");
									crimeDivisionYear.years = getData(baseYears, "values");
									crimeDivisionYear.crimeType = getData(crime_type, "values");
									crimeDivisionYear.values = truncatedCrimeValues;
									crimeDivisionYear.mapped = masterArray(crime_type, baseYears, garda_division, "values", "values", truncatedCrimeValues);
									
									
									console.log(crimeDivisionYear);
									var selectIndex = [33, 37, 42, 43];
									
									var crimeDivisionTruncateCrime = {};
									crimeDivisionTruncateCrime.mapped = [];
									for(var cdr = 0; cdr < crimeDivisionYear.regions.length; cdr++){
										for(var cdy = 0; cdy < crimeDivision.crimeType.length; cdy++){
											if(!selectIndex.includes(cdy)){
//												console.log(crimeDivisionYear.mapped[cdr][crimeDivisionYear.crimeType[cdy]]);
												delete crimeDivisionYear.mapped[cdr][crimeDivisionYear.crimeType[cdy]];
												
											}
										}
									}
									console.log(crimeDivisionYear.mapped);
									
									var regionExclude = [0, 5, 10, 16, 22 ];
									
									for(var cdr2 = 0; cdr2 <  crimeDivisionYear.regions.length; cdr2++){
//										if(){}
									}
									
									
								});
							});
						});
					});
				});
			});
		});
	});
	
	
});