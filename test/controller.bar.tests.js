// Test the bar controller
describe('Bar controller tests', function() {
	it('Should be constructed', function() {
		var chart = {
			data: {
				datasets: [{

				}, {
					xAxisID: 'myXAxis',
					yAxisID: 'myYAxis',
					data: []
				}]
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);
		expect(controller).not.toBe(undefined);
		expect(controller.index).toBe(1);
		expect(chart.data.datasets[1].metaData).toEqual([]);

		controller.updateIndex(0);
		expect(controller.index).toBe(0);
	});

	it('Should use the first scale IDs if the dataset does not specify them', function() {
		var chart = {
			data: {
				datasets: [{

				}, {
					data: []
				}]
			},
			options: {
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);
		expect(chart.data.datasets[1].xAxisID).toBe('firstXScaleID');
		expect(chart.data.datasets[1].yAxisID).toBe('firstYScaleID');
	});

	it('should correctly count the number of bar datasets', function() {
		var chart = {
			data: {
				datasets: [{
					type: 'line'
				}, {
					type: 'bar'
				}, {
					// no type, defaults to bar
				}]
			},
			config: {
				type: 'bar'
			},
			options: {
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);
		expect(controller.getBarCount()).toBe(2);
	});

	it('Should create rectangle elements for each data item during initialization', function() {
		var chart = {
			data: {
				datasets: [{}, {
					data: [10, 15, 0, -4]
				}]
			},
			config: {
				type: 'bar'
			},
			options: {
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);

		expect(chart.data.datasets[1].metaData.length).toBe(4); // 4 rectangles created
		expect(chart.data.datasets[1].metaData[0] instanceof Chart.elements.Rectangle).toBe(true);
		expect(chart.data.datasets[1].metaData[1] instanceof Chart.elements.Rectangle).toBe(true);
		expect(chart.data.datasets[1].metaData[2] instanceof Chart.elements.Rectangle).toBe(true);
		expect(chart.data.datasets[1].metaData[3] instanceof Chart.elements.Rectangle).toBe(true);
	});

	it('should remove elements', function() {
		var chart = {
			data: {
				datasets: [{}, {
					data: [10, 15, 0, -4]
				}]
			},
			config: {
				type: 'bar'
			},
			options: {
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);
		controller.removeElement(1);
		expect(chart.data.datasets[1].metaData.length).toBe(3);
	});

	it('should update elements', function() {
		var chart = {
			data: {
				datasets: [{
					data: [1, 2],
					label: 'dataset1',
				}, {
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			config: {
				type: 'bar'
			},
			options: {
				elements: {
					rectangle: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
					}
				},
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			},
			scales: {
				firstXScaleID: {
					calculateBarWidth: function(numBars) { return numBars * 5; },
					calculateBarX: function(numBars, datasetIndex, index) {
						return chart.data.datasets[datasetIndex].data[index];
					},
				},
				firstYScaleID: {
					calculateBarBase: function(datasetIndex, index) {
						return this.getPixelForValue(0);
					},
					calculateBarY: function(datasetIndex, index) {
						return this.getPixelForValue(chart.data.datasets[datasetIndex].data[index]);
					},
					getPixelForValue: function(value) {
						return value * 2;
					},
					max: 10,
					min: -10,
				}
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);

		chart.data.datasets[1].data = [1, 2]; // remove 2 items
		controller.buildOrUpdateElements();
		controller.update();

		expect(chart.data.datasets[1].metaData.length).toBe(2);
		
		var bar1 = chart.data.datasets[1].metaData[0];
		var bar2 = chart.data.datasets[1].metaData[1];

		expect(bar1._datasetIndex).toBe(1);
		expect(bar1._index).toBe(0);
		expect(bar1._xScale).toBe(chart.scales.firstXScaleID);
		expect(bar1._yScale).toBe(chart.scales.firstYScaleID);
		expect(bar1._model).toEqual({
			x: 1,
			y: 2,
			label: 'label1',
			datasetLabel: 'dataset2',

			base: 0,
			width: 10,
			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 0, 255)',
			borderWidth: 2,
		});

		expect(bar2._datasetIndex).toBe(1);
		expect(bar2._index).toBe(1);
		expect(bar2._xScale).toBe(chart.scales.firstXScaleID);
		expect(bar2._yScale).toBe(chart.scales.firstYScaleID);
		expect(bar2._model).toEqual({
			x: 2,
			y: 4,
			label: 'label2',
			datasetLabel: 'dataset2',

			base: 0,
			width: 10,
			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 0, 255)',
			borderWidth: 2,
		});

		chart.data.datasets[1].data = [1, 2, 3];
		controller.buildOrUpdateElements();
		controller.update();

		expect(chart.data.datasets[1].metaData.length).toBe(3); // should add a new meta data item
	});

	it ('should draw all bars', function() {
		var chart = {
			data: {
				datasets: [{}, {
					data: [10, 15, 0, -4]
				}]
			},
			config: {
				type: 'bar'
			},
			options: {
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);

		spyOn(chart.data.datasets[1].metaData[0], 'draw');
		spyOn(chart.data.datasets[1].metaData[1], 'draw');
		spyOn(chart.data.datasets[1].metaData[2], 'draw');
		spyOn(chart.data.datasets[1].metaData[3], 'draw');

		controller.draw();

		expect(chart.data.datasets[1].metaData[0].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[1].metaData[1].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[1].metaData[2].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[1].metaData[3].draw.calls.count()).toBe(1);
	});

	it ('should set hover styles on rectangles', function() {
		var chart = {
			data: {
				datasets: [{}, {
					data: [10, 15, 0, -4]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			config: {
				type: 'bar'
			},
			options: {
				elements: {
					rectangle: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
					}
				},
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			},
			scales: {
				firstXScaleID: {
					calculateBarWidth: function(numBars) { return numBars * 5; },
					calculateBarX: function(numBars, datasetIndex, index) {
						return chart.data.datasets[datasetIndex].data[index];
					},
				},
				firstYScaleID: {
					calculateBarBase: function(datasetIndex, index) {
						return this.getPixelForValue(0);
					},
					calculateBarY: function(datasetIndex, index) {
						return this.getPixelForValue(chart.data.datasets[datasetIndex].data[index]);
					},
					getPixelForValue: function(value) {
						return value * 2;
					},
					max: 10,
					min: -10,
				}
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);
		controller.update();
		var bar = chart.data.datasets[1].metaData[0];
		controller.setHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(230, 0, 0)');
		expect(bar._model.borderColor).toBe('rgb(0, 0, 230)');
		expect(bar._model.borderWidth).toBe(2);

		// Set a dataset style
		chart.data.datasets[1].hoverBackgroundColor = 'rgb(128, 128, 128)';
		chart.data.datasets[1].hoverBorderColor = 'rgb(0, 0, 0)';
		chart.data.datasets[1].hoverBorderWidth = 5;

		controller.setHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(128, 128, 128)');
		expect(bar._model.borderColor).toBe('rgb(0, 0, 0)');
		expect(bar._model.borderWidth).toBe(5);

		// Should work with array styles so that we can set per bar
		chart.data.datasets[1].hoverBackgroundColor = ['rgb(255, 255, 255)', 'rgb(128, 128, 128)'];
		chart.data.datasets[1].hoverBorderColor = ['rgb(9, 9, 9)', 'rgb(0, 0, 0)'];
		chart.data.datasets[1].hoverBorderWidth = [2.5, 5];

		controller.setHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(255, 255, 255)');
		expect(bar._model.borderColor).toBe('rgb(9, 9, 9)');
		expect(bar._model.borderWidth).toBe(2.5);

		// Should allow a custom style
		bar.custom = {
			hoverBackgroundColor: 'rgb(255, 0, 0)',
			hoverBorderColor: 'rgb(0, 255, 0)',
			hoverBorderWidth: 1.5
		};

		controller.setHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(255, 0, 0)');
		expect(bar._model.borderColor).toBe('rgb(0, 255, 0)');
		expect(bar._model.borderWidth).toBe(1.5);
	});

	it ('should remove a hover style from a bar', function() {
		var chart = {
			data: {
				datasets: [{}, {
					data: [10, 15, 0, -4]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			config: {
				type: 'bar'
			},
			options: {
				elements: {
					rectangle: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
					}
				},
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			},
			scales: {
				firstXScaleID: {
					calculateBarWidth: function(numBars) { return numBars * 5; },
					calculateBarX: function(numBars, datasetIndex, index) {
						return chart.data.datasets[datasetIndex].data[index];
					},
				},
				firstYScaleID: {
					calculateBarBase: function(datasetIndex, index) {
						return this.getPixelForValue(0);
					},
					calculateBarY: function(datasetIndex, index) {
						return this.getPixelForValue(chart.data.datasets[datasetIndex].data[index]);
					},
					getPixelForValue: function(value) {
						return value * 2;
					},
					max: 10,
					min: -10,
				}
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);
		controller.update();
		var bar = chart.data.datasets[1].metaData[0];

		// Change default
		chart.options.elements.rectangle.backgroundColor = 'rgb(128, 128, 128)';
		chart.options.elements.rectangle.borderColor = 'rgb(15, 15, 15)';
		chart.options.elements.rectangle.borderWidth = 3.14;

		// Remove to defaults
		controller.removeHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(128, 128, 128)');
		expect(bar._model.borderColor).toBe('rgb(15, 15, 15)');
		expect(bar._model.borderWidth).toBe(3.14);

		// Should work with array styles so that we can set per bar
		chart.data.datasets[1].backgroundColor = ['rgb(255, 255, 255)', 'rgb(128, 128, 128)'];
		chart.data.datasets[1].borderColor = ['rgb(9, 9, 9)', 'rgb(0, 0, 0)'];
		chart.data.datasets[1].borderWidth = [2.5, 5];

		controller.removeHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(255, 255, 255)');
		expect(bar._model.borderColor).toBe('rgb(9, 9, 9)');
		expect(bar._model.borderWidth).toBe(2.5);

		// Should allow a custom style
		bar.custom = {
			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 255, 0)',
			borderWidth: 1.5
		};

		controller.removeHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(255, 0, 0)');
		expect(bar._model.borderColor).toBe('rgb(0, 255, 0)');
		expect(bar._model.borderWidth).toBe(1.5);
	});	
});