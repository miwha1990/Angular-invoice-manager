(function () {
    angular.module('inv').controller('invoicesController',
        ['$scope', 'customers','products', 'invoices', '$compile', '$rootScope',
            function ($scope, customers, products, invoices, $compile, $rootScope) {
                $scope.totalInvoice = 0;
                $scope.customers =  customers;
                $scope.invoices =  invoices;
                $scope.products =  products;
                $('#addInvoice').on('click', function(e){
                    var el = $compile( "<product></product>" )( $scope.$new() );
                    $('.products').append( el );
                });


                $scope.$on('change-total', function (evt, value) {
                    $scope.totalInvoice = value;
                });
                $scope.$on('added-item', function (evt, value) {
                    $scope.invoices.push(value);
                });
            }
        ]);
})();
