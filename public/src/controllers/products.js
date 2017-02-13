(function () {
    angular.module('inv').controller('productsController',['$scope', 'products', function ($scope, products) {
        $scope.products =  products;
    }]);
})();
