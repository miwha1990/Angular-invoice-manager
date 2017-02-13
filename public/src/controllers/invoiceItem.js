(function () {
    angular.module('inv').controller('invoiceItemController',
        ['$scope', 'invoiceItems',
            function ($scope, invoiceItems) {
                $scope.invoiceItems =  invoiceItems;
            }]);
})();
