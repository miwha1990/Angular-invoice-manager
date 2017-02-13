
// create the module and name it scotchApp
var app = angular
    .module('inv', [ 'ui.router'])
    .constant('API_URL', 'http://localhost:8000/api').constant('SITE_NAME', 'Invoices')
    .config(function ( $stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $urlRouterProvider.otherwise('/');
    $urlRouterProvider.when('', '/');

    $stateProvider
        .state({
            name: 'invoices',
            url: '/',
            templateUrl: 'views/invoices.html',
            controller: 'invoicesController',
            resolve: {
                invoices: ['ModelCommon',
                    function (ModelCommon) {
                        var data =[];

                        ModelCommon
                            .fetch('/invoices')
                            .then(function(res){
                                res.forEach(function(item){
                                    if(item.customer_id){
                                        ModelCommon
                                            .fetchById('/customers/', item.customer_id)
                                            .then(function(response){
                                                item.customerName = response.name;
                                                data.push(item);
                                            });
                                    } else {
                                        item.customer_name = "Not selected";
                                        data.push(item);
                                    }

                                });
                            });
                        return data;
                    }
                ],
                customers: ['ModelCommon',
                    function (ModelCommon) {
                        return ModelCommon.fetch('/customers');
                    }
                ],
                products: ['ModelCommon',
                    function (ModelCommon) {
                        return ModelCommon.fetch('/products');
                    }
                ]
            }
        })
        .state({
            name: 'customer',
            url: '/customers',
            templateUrl: 'views/customers.html',
            controller: 'customersController',
            resolve: {
                customers: ['ModelCommon',
                    function (ModelCommon) {
                        return ModelCommon.fetch('/customers');
                    }
                ]
            }
        })
        .state({
            name: 'products',
            url: '/products',
            templateUrl: 'views/products.html',
            controller: 'productsController',
            resolve: {
                products: ['ModelCommon',
                    function (ModelCommon) {
                        return ModelCommon.fetch('/products');
                    }
                ]
            }

        })
        .state({
            name: 'invoiceItem',
            url: '/invoice/:id',
            templateUrl: 'views/invoiceItem.html',
            controller: 'invoiceItemController',
            resolve: {
                invoiceItems: ['ModelCommon', '$stateParams',
                    function (ModelCommon, $stateParams) {debugger
                        return ModelCommon.fetch('/invoices/'+$stateParams.id+'/items');
                    }]
            }
        });

    })
    .factory('BasicAuthInterceptor',
        [
            function () {
                return {
                    request: function (config) {
                        config.headers = config.headers || {};
                        config.headers.Authorization = 'Basic Y2d0dWJlOmNndHViZWhtaHVi';
                        return config;
                    }
                }
            }
        ]
    )

    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('BasicAuthInterceptor');
        $httpProvider.defaults.cache = true;
    }]);