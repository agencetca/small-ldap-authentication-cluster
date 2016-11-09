angular.module('innov24').
controller('env', ['$scope', 'AuthService', 'taOptions', function($scope, AuthService, taOptions) {
	
	var scope = $scope;

	scope.name = 'Environment test';

	$scope.eventSources = [];

	$scope.alertEventOnClick = function() {
		alert('clicked');
	}

	$scope.alertOnDrop = function() {
		alert('dropped');
	}

	$scope.alertOnResize = function() {
		alert('resized');
	}

	$scope.user = 'wait...';
	AuthService.profile(function(r) {
		$scope.user = r;
	});

	$scope.tools = [{publish:''}];

  taOptions.toolbar = [
      //['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      //['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
  ];

    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'month basicWeek basicDay agendaWeek agendaDay',
          center: 'title',
          right: 'today prev,next'
        },
        eventClick: $scope.alertEventOnClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    };


	$scope.new = {};

	$scope.publish = function(e) {

		e.preventDefault();

		if(!localStorage.getItem('published')) 
			localStorage.setItem('published', JSON.stringify([]));

		var published = JSON.parse(localStorage.getItem('published'));

		//published.push($scope.new);
		localStorage.setItem('published', JSON.stringify(published));

		alert('published locally');

	}



}]);
