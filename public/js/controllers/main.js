$(function () {
   'use strict';
    angular.module('myApp',[])
        .config(function ($interpolateProvider) {
            $interpolateProvider.startSymbol('[:');
            $interpolateProvider.endSymbol(':]');
        });

});