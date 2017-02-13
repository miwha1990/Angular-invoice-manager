(function () {
    angular.module('inv').controller('customersController',['$scope', 'customers',
        function ($scope, customers) {
            $scope.customers =  customers;
        }
    ]);
})();
