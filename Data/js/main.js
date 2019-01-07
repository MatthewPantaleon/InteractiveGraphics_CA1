$(function() {//ready function
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
		alternative -> if the data is structured differently use alternative coordinates. Boolean
	*/
	function heatMap(attribute1, attribute2, attribute3, valueArray, index, alternative){
		
		var coords = [];
		var increment = 0;
		if(alternative){
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
		}else if(!alternative){
			for(var d = 0; d < attribute1.length; d++){

				for(var dd = 0; dd < attribute2.length; dd++){
//					console.log(valueArray[d][attribute3]);
					
					coords.push({
						row: d, 
						col: dd, 
						value: valueArray[d][attribute3][attribute2[dd]],
//						valueName: attribute3[index]
					});
					//console.log(coords[d * dd].value);
					increment++;
				}
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
	
	
	
	//trim off unwated data in the master array
	/*
		Master -> master object containing mapped array. Object
		excluder -> array to select or deselect from the mapped array. Array
		attr1 -> name of first attribute that each data point is defined with. String
		arrt2 -> name of second attribute that each data point is defined with. String (optional)
	*/
	function trim(Master, excluder, attr1, attr2){
		var newMapped = [];
		
		
		if(attr2 != undefined || attr2 != null){
			for(var cdr = 0; cdr < Master[attr1].length; cdr++){
			
				for(var cdy = 0; cdy < Master[attr2].length; cdy++){
					if(!excluder.includes(cdy)){
						delete Master.mapped[cdr][Master[attr2][cdy]];

					}
				}
			}
		}else{
			for(var ex = 0; ex < excluder.length; ex++){
				newMapped.push(Master.mapped[excluder[ex]]);
			}
		}
		
		
		return newMapped;
		
	}
	
	//reevaluate values array for use in heatmap. Uses new Trimmed mapped array
	/*
		Master -> master OBJECT to re-extract values. Object
		attrArray1 -> first array of values used to define values. Array
		attrArray2 -> second array of values used to define values. Array
	
	*/
	function evaluate(Master, attrArray1, attrArray2){
		var newValues = [];
		for(var m = 0; m < Master.mapped.length; m++){
//			console.log(m);
			for(var m2 = 0; m2 < attrArray1.length; m2++){
//				console.log(m2);
				for(var m3 = 0; m3 < attrArray2.length; m3++){
//					console.log(m3);
//					console.log(Master.mapped[m][attrArray1[m2]][attrArray2[m3]]);
					//console.log(attrArray2[m3]);
					if(Master.mapped[m][attrArray1[m2]][attrArray2[m3]] !== undefined){
						newValues.push(Master.mapped[m][attrArray1[m2]][attrArray2[m3]]);
					}else{
						//newValues.push(undefined);
					}
					
				}
			}
			
		}
		return newValues;
	}
	
	
	//Colour function to colour rects
	var initialise = true;//originally used to evaluate breakpoints once
	var thresholds = [];//array to store breakpoints. Deprecated
	
	/*
		coords -> heatmap array containing row, column and values. Array
		c -> current value in d3 loop. d.value
		base -> average value to be tested against. Int
		slice -> how many break points before and after the average value. Int. Not Used
		gap -> percentage gap between each breakpoint. Int. Not Used
		boost -> boost colour contrast. Int, nullable
	*/
	function getColour(coords, c, base, slice, gap, boost){
		var max = d3.max(coords, function(d){return parseInt(d.value);});
		//var max = 0;

		if(boost == undefined){
		   boost = 1;
		}
		if(initialise){
			slice++;
			for(var t = 0; t < slice * 2 - 1; t++){
				thresholds[t] = Math.ceil(base * (1 - (gap * (slice - (t + 1)) / 100)));
			}
			initialise = false;
			console.log(thresholds);
		}

//		for(var tt = 0; tt < thresholds.length; tt++){
//			if(thresholds[tt + 1] > c && thresholds[tt] < c){
//				max = thresholds[tt];
//			}
//		}
		
		var percentage = c * 100 / max;
		var p = percentage * 2.55 * boost;
		
		if(c > base){
			return "rgb(0, " + Math.ceil(p) + ", 0)";
		}else if(c < base){
			return "rgb(0, 0, "+ Math.ceil(p) + ")";
		}
		
		
	}
	
	//load in JSON files
	
	//"Population Aged 15 Years and Over 2016   by  Sex, Highest Level of Education Completed, Towns by Size and CensusYear". Not Used
	d3.json("data/education_town_2016.json", function(error, education_town_2016){
		if(error !== null){console.log("Unable to laod education_town_2016 JSON file");}
		
		//"Recorded Crime Offences Under Reservation by  Garda Division, Type of Offence and Quarter"
		d3.json("data/crime_by_region_Q.json", function(error, crime_by_region_Q){
			if(error !== null){console.log("Unable to laod crime_by_region_Q JSON file");}
			
			//"Population at Each Census 1841 to 2016 by  County, Sex and CensusYear". Not Used
			d3.json("data/population_county.json", function(error, population_county){
				if(error !== null){console.log("Unable to laod population_county JSON file");}
				
				//"Income and Poverty Rates by Region, Year and Statistic". Not Used
				d3.json("data/income_region.json", function(error, income_region){
					if(error !== null){console.log("Unable to laod income_region JSON file");}
					
					//"Income and Poverty Rates by Highest Level of Education Completed, Year and Statistic". Not Used
					d3.json("data/income_by_education.json", function(error, income_by_education){
						if(error !== null){console.log("Unable to laod income_by_education JSON file");}
						
						//"Population Aged 15 Years and Over by  Sex, Highest Level of Education Completed, Towns by Size and CensusYear". Not Used
						d3.json("data/education_town_2011.json", function(error, education_town_2011){
							if(error !== null){console.log("Unable to laod income_by_education JSON file");}
							
							//"Population Aged 15 Years and Over 2011 to 2016 by  Age at which Full, Sex, Highest Level of Education Completed, County and City and CensusYear". Not Used
							d3.json("data/education_county_city_2016_2011.json", function(error, education_county_city_2016_2011){
							if(error !== null){console.log("Unable to laod income_by_education JSON file");}
								
								//"Estimates of Household Income by County and Region, Year and Statistic"
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

									
									//object of counties. Alphabetically Arranged. Needed because each dataset has it's own set of regions
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
									// Income and Poverty Rates by Region, Year and Statistic. Not used
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
									// Population at Each Census 1841 to 2016 by County, Sex and CensusYear. Not Used
									//
									
									//get object of counties
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
//									console.log(populationCounties.mapped);
//									console.log(populationCounties.counties);
									
									
									
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
									
									//bundle attribute arrays in a master object
									crimeDivision.regions = getData(garda_division, "values");
									crimeDivision.crimeType = getData(crime_type, "values");
									crimeDivision.crimeIndex = getData(crime_type, "keys");
									crimeDivision.yearQuarter = getData(yearly_quarters, "values");
									crimeDivision.mapped = masterArray(crime_type, yearly_quarters, garda_division, "values", "values", crime_total);
									crimeDivision.values = crime_total;
									
									//Check Masters
									console.log(incomeByCounty);
									console.log(crimeDivision);
									
//-------------------------------------------------------------------------------------------------------------------------------------
									
									
									//graphing of the data
									
									//create SVG element
									var svgHeight = 1000;
									var svgWidth = 1000;
									
									var thing = d3.select(".svgHere").append("svg").attr("width", svgWidth).attr("height", svgHeight).attr("class", "mainSVG");
									
									var itemSize = 25;
									var cellSize = itemSize - 1;
									var margin = {left: 80, right: 50, top: 50, bottom: 50};
									
									var width = 750 - margin.right - margin.left;
									var height = 300 - margin.top - margin.bottom;
									
									//rearrange counties of Income Dataset to be alphabetical
//									31: "Carlow", 
//									7: "Cavan", 
//									28: "Clare",
//									1: "Cork",
//									8: "Donegal",
//									22: "Dublin",
//									2: "Galway",
//									36: "Kerry",
//									24: "Kildare",
//									32: "KilKenny",
//									14: "Laois",
//									9: "Leitrim",
//									3: "Limerick",
//									15: "Longford",
//									10: "Louth",
//									19: "Mayo",
//									25: "Meath",
//									11: "Monaghan",
//									16: "Offaly",
//									20: "Roscommon",
//									12: "Sligo",
//									29/33: "Tipperary",
//									4: "Waterford",
//									17: "Westmeath",
//									34: "Wexford",
//									26: "Wicklow"
									
									var completeIncomeByCounty = {};
									var selectCounties = [31, 7, 28, 1, 8, 22, 2, 36, 24, 32, 14, 9, 3, 15, 10, 19, 25, 11, 16, 20, 12, 33, 4, 17, 34, 26];
									
									//map new master array
									completeIncomeByCounty.mapped = trim(incomeByCounty, selectCounties, "counties");
									
									console.log(completeIncomeByCounty);
									
									//re-evaluate values array
									completeIncomeByCounty.values = evaluate(completeIncomeByCounty, incomeByCounty.years, incomeByCounty.incomeTypes);
									
									console.log(completeIncomeByCounty.values);
									
									//set axis ranges
									var xScale = d3.scaleBand().range([margin.left, incomeByCounty.counties.length * itemSize]);
									var yScale = d3.scaleBand().range([0, incomeByCounty.counties.length * itemSize]);
									
									//set domains of axis
									xScale.domain(incomeByCounty.years);
									yScale.domain(getData(baseCounties, "values"));
									
									//graph years axis
									thing.append("g")
										.attr("class", "axis")
										.attr("transform", "translate("+ 0 + ", " + margin.top +")")
										.call(d3.axisTop(xScale));
									
									//graph counties axis
									thing.append("g")
										.attr("class", "axis")
										.attr("transform", "translate("+ margin.left + ", " + margin.top +")")
										.call(d3.axisLeft(yScale));
									
									
									
									
									//make a new value array without other regions
									var countiesArray = getData(baseCounties, "values");
									console.log(countiesArray);
									console.log(incomeByCounty.counties);
									incomeByCounty.newCounties = [];
									
									//testing code
//									var excludeArray = ["State", "Border, Midland and Western", "Border", "Midland", "West", "Southern and Eastern", "Mid-East", "Mid-West", "South-East", "South-West"];
									
//									for(var ibc = 0; ibc < incomeByCounty.mapped.length; ibc++){
//										if(!excludeArray.includes(incomeByCounty.counties[ibc])){
//											//console.log(incomeByCounty.counties[ibc]);
//											incomeByCounty.newCounties.push(incomeByCounty.counties[ibc]);
//										}
//									}
//									console.log(incomeByCounty.newCounties);
									
									//attribute1, attribute2, valueArray, index
//									var incomeByCounty_coords = heatMap(incomeByCounty.counties, incomeByCounty.years, incomeByCounty.incomeTypes, incomeByCounty.values, 11);
									
									//get coordinates for heatmap mapping
									var incomeByCounty_coords = heatMap(countiesArray, incomeByCounty.years, incomeByCounty.incomeTypes, completeIncomeByCounty.values, 11, true);
									
									//var incomeMedianRegion_coords = heatMap(incomeMedianByRegion.regions, incomeMedianByRegion.years, incomeMedianByRegion.medians, incomeMedianByRegion.values, 0);
									
									
									//get average income
									var averageDisposableIncome = 0;
									var totalDisposableIncome = 0;
									
									for(var p = 0; p < incomeByCounty_coords.length - 1; p++){
										totalDisposableIncome += incomeByCounty_coords[p].value;
									}
									
									console.log(totalDisposableIncome);
									console.log(Math.ceil(totalDisposableIncome / incomeByCounty_coords.length));
									
									averageDisposableIncome = Math.ceil(totalDisposableIncome / incomeByCounty_coords.length);

									//check coordinates
									console.log(incomeByCounty_coords);
									
									
									//disposable income by county heatmap
									thing.append("g")
											.attr("class", "income")
											.selectAll()
											.data(incomeByCounty_coords)
											.enter()
											.append("rect")
											.style("opacity", 0)
											.attr("x", margin.left)
											.attr("y", margin.top)
											.transition()
											.delay(function(d, i){return 3 * i;})
											.style("opacity", 1)
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
											.attr("id", function(d, i){return  d.value + "r" + d.col + "c" + d.row;})
									
											//transition effect breaks d3 on(). So a seperate mouseover is made
									
//											.on("mouseover", function(d, i, e){
//												thing.append("text").text(d.value)
//												.attr("x", xScale.step()/3  + margin.left + xScale.step()  * d.col)
//												.attr("y", yScale.step()/2 + margin.top + yScale.step() * d.row)
//												.attr("id", d.value + "r" + i)
//												.attr("class", "text");
//												
//											})
//											.on("mouseout", function(d, i){
//												d3.select('[id="' + d.value + 'r' + i + '"]').remove();
//											});
									
											//mouseover for first heatmap
											$(".income rect").on("mouseover", function(e){
												var id = this.id.split("r")[0];
												var row = this.id.substring(this.id.lastIndexOf("r") + 1, this.id.lastIndexOf("c"));
												var col = this.id.substring(this.id.lastIndexOf("c") + 1);

												thing.append("text").text(id)
													.attr("x", xScale.step()/3  + margin.left + xScale.step()  * row)
													.attr("y", yScale.step()/2 + margin.top + yScale.step() * col)
													.attr("id", id + "r" + row)
													.attr("class", "text");
											});
									
											$(".income rect").on("mouseout", function(e){
												var id = this.id.split("r")[0];
												var row = this.id.substring(this.id.lastIndexOf("r") + 1, this.id.lastIndexOf("c"));
												var col = this.id.substring(this.id.lastIndexOf("c") + 1);
												d3.select('[id="' + id + 'r' + row + '"]').remove();
											});
									
									
									//put average value of income on page
									$(".income-average").html("€" + averageDisposableIncome);
									
//-------------------------------------------------------------------------------------------------------------------------------------
									
									//page UI
									
									
									//initially hide all crime heatmaps
									$(".theft-text").hide();
									$(".fraud-text").hide();
									$(".burglary-text").hide();
									
									//dropdown to switch out heatmaps
									$("#selection").on("change", function(e){
										
										switch(parseInt($("#selection").val())){
											case 1:
//												console.log("Income by county");
												$(".theft").fadeOut();
												$(".fraud").fadeOut();
												$(".burglary").fadeOut();
												$(".income").fadeIn();
												
												$(".theft-text").hide();
												$(".fraud-text").hide();
												$(".burglary-text").hide();
												$(".income-text").show();
												break;
											case 2:
//												console.log("Burglaries by county");
												$(".theft").fadeOut();
												$(".fraud").fadeOut();
												$(".income").fadeOut();
												$(".burglary").fadeIn();
												
												$(".theft-text").hide();
												$(".fraud-text").hide();
												$(".income-text").hide();
												$(".burglary-text").show();
												break;
											case 3:
//												console.log("Fraud by county");
												$(".theft").fadeOut();
												$(".burglary").fadeOut();
												$(".income").fadeOut();
												$(".fraud").fadeIn();
											
												$(".theft-text").hide();
												$(".burglary-text").hide();
												$(".income-text").hide();
												$(".fraud-text").show();
												
												break;
											case 4:
//												console.log("Theft by county");
												$(".burglary").fadeOut();
												$(".income").fadeOut();
												$(".fraud").fadeOut();
												$(".theft").fadeIn();
												
												$(".burglary-text").hide();
												$(".income-text").hide();
												$(".fraud-text").hide();
												$(".theft-text").show();
												break;
											default:
												console.log("You shouldn't be here");
												break;
										}
										
									});
									
									
//-------------------------------------------------------------------------------------------------------------------------------------
									
									
									//
									//testing values to test truncate function, to add up quarters to form years
									//
									
									//test regions
									var areas = {10: "location_1", 20: "location_2", 30: "location_3"};
									
									//test crime types
									var badThings = {10: "Kill", 20: "Steal", 30: "Destroy"};
									
									//test quarters
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
									//final results of the truncate function as commented beside each of the values
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
									
									//test grouping
									var testBand = 4;
									
									//test Master Object
									var testMaster = {};
									testMaster.areas = getData(areas, "values");
									testMaster.badThings = getData(badThings, "values");
									testMaster.quarters = getData(quarters, "values");
									testMaster.mapped = masterArray(badThings, quarters, areas, "values", "values", testValues);
									console.log(testMaster);
									
//-------------------------------------------------------------------------------------------------------------------------------------
									
									
									//years to be used in maping the crime heatmaps
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
									
									//get truncated values of all crimes
									var truncatedCrimeValues = [];
									truncatedCrimeValues = truncate(crimeDivision, "crimeType", "yearQuarter", 4);
									console.log(truncatedCrimeValues);
									
									
									console.log(crimeDivision.regions);
									
									//create new master with truncated values and years
									var crimeDivisionYear = {};
									crimeDivisionYear.regions = getData(garda_division, "values");
									crimeDivisionYear.years = getData(baseYears, "values");
									crimeDivisionYear.crimeType = getData(crime_type, "values");
									crimeDivisionYear.values = truncatedCrimeValues;
									crimeDivisionYear.mapped = masterArray(crime_type, baseYears, garda_division, "values", "values", truncatedCrimeValues);
									
									
									console.log(crimeDivisionYear);
									
									//particularly select these crime types from the original crimeType array
									var selectIndex = [33, 37, 42, 43];
									
									var crimeDivisionTruncateCrime = {};
									crimeDivisionTruncateCrime.mapped = [];

									
									var testComplete = [];
									crimeDivisionTruncateCrime.mapped = trim(crimeDivisionYear, selectIndex, "regions", "crimeType");
									console.log(crimeDivisionYear.mapped);
									
									var crimeNames = ["Burglary and related offences", "Theft and related offences", "Fraud, deception and related offences", "Controlled drug offences"];
									
									
//									25: "Carlow", 
//									1: "Cavan", 
//									6: "Clare",
//									11: "Cork",
//									2: "Donegal",
//									27: "Dublin",
//									8: "Galway",
//									14: "Kerry",
//									21: "Kildare",
//									25: "KilKenny",
//									17: "Laois",
//									3: "Leitrim",
//									15: "Limerick",
//									9: "Longford",
//									4: "Louth",
//									7: "Mayo",
//									18: "Meath",
//									1: "Monaghan",
//									17: "Offaly",
//									9: "Roscommon",
//									3: "Sligo",
//									23: "Tipperary",
//									26: "Waterford",
//									20: "Westmeath",
//									24: "Wexford",
//									26: "Wicklow"
									
									var crimeRegionSelect = [25, 1, 6, 11, 2, 27, 8, 14, 21, 25, 9, 3, 15, 9, 4, 7, 18, 1, 17, 9, 3, 23, 26, 20, 24, 26];
									var completeCrimeByDivision = {};
									
									
									completeCrimeByDivision.mapped = trim(crimeDivisionYear, crimeRegionSelect, "regions");
									console.log(completeCrimeByDivision.mapped);
									
									
									//heatMap(attribute1, attribute2, attribute3, valueArray, index)
									//countiesArray, incomeByCounty.years
									
									
									var averageBurglaries = 0;
									var totalBurglaries = 0;
									
									
									
									//remove excess years
									var removeYears = ["2016", "2017", "2018"];
									for(var y = 0; y < completeCrimeByDivision.mapped.length; y++){
										for(var re = 0; re < crimeNames.length; re++){
											for(var ye = 0; ye < removeYears.length; ye++){
												delete completeCrimeByDivision.mapped[y][crimeNames[re]][removeYears[ye]];
											}
										}
									}
									
									//add in dummy data to align crime data to income data
									var addYears = ["2000", "2001", "2002"];
									for(var y = 0; y < completeCrimeByDivision.mapped.length; y++){
										for(var re = 0; re < crimeNames.length; re++){
											for(var ye = 0; ye < addYears.length; ye++){
												completeCrimeByDivision.mapped[y][crimeNames[re]][addYears[ye]] = 0;
											}
										}
									}
									
									console.log(completeCrimeByDivision);
									var burglaryValues = evaluate(completeCrimeByDivision, crimeNames, incomeByCounty.years);
									console.log(burglaryValues);
									
									for(var bq = 0; bq < completeCrimeByDivision.mapped.length; bq++){
										
										for(var bqq = 0; bqq < incomeByCounty.years.length; bqq++){
											totalBurglaries += completeCrimeByDivision.mapped[bq][crimeNames[0]][incomeByCounty.years[bqq]];
										}
									
									}
									
									
									console.log(totalBurglaries);
									averageBurglaries = Math.floor(totalBurglaries / ((incomeByCounty.years.length - 6) * countiesArray.length));
									console.log(averageBurglaries);
									
									//put average burglaries to page
									$(".burglary-average").html(averageBurglaries + " Instances");
									
									var burglary_coords = heatMap(countiesArray, incomeByCounty.years, crimeNames[0], completeCrimeByDivision.mapped, 0, false);
									console.log(burglary_coords);
									
									
									thing.append("g")
											.attr("class", "burglary")
											.selectAll()
											.data(burglary_coords)
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
												return getColour(burglary_coords, d.value, averageBurglaries, 2, 10, 5);
											})
									
											.on("mouseover", function(d, i, e){
												thing.append("text").text(d.value)
												.attr("x", xScale.step()/3  + margin.left + xScale.step()  * d.col)
												.attr("y", yScale.step()/2 + margin.top + yScale.step() * d.row)
												.attr("id", d.value + "r" + i)
												.attr("class", "text");
												
											})
											.on("mouseout", function(d, i){
												d3.select('[id="' + d.value + 'r' + i + '"]').remove();
											});
									$(".burglary").hide();
									
									var fraud_coords = heatMap(countiesArray, incomeByCounty.years, crimeNames[1], completeCrimeByDivision.mapped, 0, false);
									
									var averageFraud = 0;
									var totalFraud = 0;
									
									console.log(fraud_coords);
									
									for(var bq = 0; bq < completeCrimeByDivision.mapped.length; bq++){
										
										for(var bqq = 0; bqq < incomeByCounty.years.length; bqq++){
											totalFraud += completeCrimeByDivision.mapped[bq][crimeNames[1]][incomeByCounty.years[bqq]];
										}
									
									}
									console.log(totalFraud);
									averageFraud = Math.floor(totalFraud / ((incomeByCounty.years.length - 6) * countiesArray.length));
									console.log(averageFraud);
									
									//put average fraud to page
									$(".fraud-average").html(averageFraud + " Instances");
									
									thing.append("g")
											.attr("class", "fraud")
											.selectAll()
											.data(fraud_coords)
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
												return getColour(fraud_coords, d.value, averageFraud, 2, 10, 5);
											})
									
											.on("mouseover", function(d, i, e){
												thing.append("text").text(d.value)
												.attr("x", xScale.step()/3  + margin.left + xScale.step()  * d.col)
												.attr("y", yScale.step()/2 + margin.top + yScale.step() * d.row)
												.attr("id", d.value + "r" + i)
												.attr("class", "text");
												
											})
											.on("mouseout", function(d, i){
												d3.select('[id="' + d.value + 'r' + i + '"]').remove();
											});
									$(".fraud").hide();
//									incomeByCounty.counties = getData(county_raw, "values");
//									incomeByCounty.incomeTypes = getData(income_types_raw, "values");
//									incomeByCounty.years = getData(years_raw, "values");
//									incomeByCounty.mapped = masterArray(years_raw, income_types_raw, county_raw, "keys", "values", income_values_raw);
//									incomeByCounty.values = income_values_raw;
									var testingArray = [0, 1, 2];
									testComplete = trim(incomeByCounty, testingArray, "counties");
									
									var theft_coords = heatMap(countiesArray, incomeByCounty.years, crimeNames[2], completeCrimeByDivision.mapped, 0, false);
									console.log(theft_coords);
									
									var averageTheft = 0;
									var totalTheft = 0;
									
									for(var bq = 0; bq < completeCrimeByDivision.mapped.length; bq++){
										
										for(var bqq = 0; bqq < incomeByCounty.years.length; bqq++){
											totalTheft += completeCrimeByDivision.mapped[bq][crimeNames[2]][incomeByCounty.years[bqq]];
										}
									
									}
									console.log(totalTheft);
									averageTheft = Math.floor(totalTheft / ((incomeByCounty.years.length - 6) * countiesArray.length));
									console.log(averageTheft);
									
									
									//put average theft to page
									$(".theft-average").html(averageTheft + " Instances");
									
									thing.append("g")
											.attr("class", "theft")
											.selectAll()
											.data(theft_coords)
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
												return getColour(theft_coords, d.value, averageTheft, 2, 10, 5);
											})
									
											.on("mouseover", function(d, i, e){
												thing.append("text").text(d.value)
												.attr("x", xScale.step()/3  + margin.left + xScale.step()  * d.col)
												.attr("y", yScale.step()/2 + margin.top + yScale.step() * d.row)
												.attr("id", d.value + "r" + i)
												.attr("class", "text");
												
											})
											.on("mouseout", function(d, i){
												d3.select('[id="' + d.value + 'r' + i + '"]').remove();
											});
									$(".theft").hide();
									
									
									
								});
							});
						});
					});
				});
			});
		});
	});
	
	
});