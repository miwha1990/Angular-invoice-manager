    // create the module and name it scotchApp
    var scotchApp = angular.module('inv', [ 'ui.router']);
    //constants
    scotchApp.constant('API_URL', 'http://localhost:8000/api').constant('SITE_NAME', 'Invoices');
    // configure our routes
    scotchApp.config(function ( $stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode({
            enabled: true
        });

        $urlRouterProvider.otherwise('/');
        $urlRouterProvider.when('', '/');

        $stateProvider
            .state({
                name: 'invoices',
                url: '/',
                templateUrl: 'src/views/invoices.html',
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
                templateUrl: 'src/views/customers.html',
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
                templateUrl: 'src/views/products.html',
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
                name: 'invoice',
                url: '/invoice/:id',
                templateUrl: 'src/views/invoiceItem.html',
                controller: 'invoiceItemController',
                resolve: {
                    invoiceItems: ['ModelCommon', '$stateParams',
                        function (ModelCommon, $stateParams) {
                            return ModelCommon
                                .fetch('/invoices/'+$stateParams.id+'/items')
                                .then(function(res){

                                    ModelCommon.fetch('/invoices/'+$stateParams.id).then(function(result){
                                        res.total = result.total;
                                        res.discount = result.discount;
                                        ModelCommon
                                            .fetchById('/customers/', result.customer_id)
                                            .then(function(re){
                                                res.customer =  re.name;
                                            });
                                    });
                                    for(var i = 0;i < res.length; i++){
                                        (function(e){
                                            ModelCommon.fetch('/products/'+res[i].product_id)
                                                .then(function(response){
                                                    res[e].name=response.name;
                                                    res[e].price=response.price;

                                                })
                                        })(i)
                                    }

                                    return res;

                                });
                        }]
                }
            });

    });

    scotchApp.controller('invoicesController',
        ['$scope', 'customers','products', 'invoices', '$compile', '$rootScope',
            function ($scope, customers, products, invoices, $compile, $rootScope) {
                $scope.totalInvoice = 0;
                $scope.customers =  customers;
                $scope.invoices =  invoices;
                $scope.products =  products;
                $('#addInvoice').unbind('click').bind('click', function(e){
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

    scotchApp.controller('customersController',['$scope', 'customers',
        function ($scope, customers) {
            $scope.customers =  customers;
        }
    ]);
    scotchApp.controller('productsController',['$scope', 'products', function ($scope, products) {
        $scope.products =  products;
    }]);
    scotchApp.controller('invoiceItemController',
        ['$scope', 'invoiceItems', '$stateParams','ModelCommon',
            function ($scope, invoiceItems, $stateParams, ModelCommon) {
                $scope.invoiceItems =  invoiceItems;
                $scope.invoiceId =  $stateParams.id;
                function countTotalInvoice(items){
                    var discount  = items.discount;
                    var total = 0;var invoice_id
                    for(var i = 0; i < items.length; i++){
                        total = total + (items[i].price*items[i].quantity);
                        invoice_id = items[i].invoice_id;
                    }
                    items.total = (total - (total*discount/100)).toFixed(2);
                    ModelCommon.update('/invoices/'+ invoice_id, {total : items.total});
                }
                $scope.increase =  function (e) {
                    this.item.quantity++;
                    ModelCommon.update('/invoices/'+ this.item.invoice_id + '/items/'+ this.item.id, {quantity: this.item.quantity});
                    countTotalInvoice(this.$parent.invoiceItems);
                 };
                $scope.decrease = function (e) {
                    if(this.item.quantity>0){
                        this.item.quantity--;
                        ModelCommon.update('/invoices/'+ this.item.invoice_id + '/items/'+ this.item.id, {quantity: this.item.quantity});
                        countTotalInvoice(this.$parent.invoiceItems);
                    }
                };
            }]);
    scotchApp
        .directive('navbar', function () {
            return {
                restrict: 'E',
                templateUrl: 'src/directives/navbar/navbar.html',
                link: function(scope, elem, attrs) {
                    $(elem).find('nav.navbar a.navbar-brand').click(function(e){
                        $(elem).find('nav.navbar ul li').removeClass('active');
                    });
                    $(elem).find('nav.navbar ul li a').click(function(e){
                        $(elem).find('nav.navbar ul li').removeClass('active');
                        this.parentElement.classList.add('active');
                    });
                }
            }
        });
    scotchApp
        .directive('product', ['$timeout','ModelCommon', function ($timeout, ModelCommon) {
            return {
                restrict: 'EA',
                templateUrl: 'src/directives/productItem/product.html',

                link: function (scope, element, attrs) {

                    function initCurrentProduct(element){
                        var price = element.find('.productList').find(":selected").attr('data-price')*1;
                        element.find('.spinner input').val(1);
                        element.find('.totalPriceProduct').html(price);
                    }

                    function countTotalInvoice(){
                        var total = 0;
                        $('.product_item').each(function(){
                            var price = $(this).find('.totalPriceProduct').html()*1;
                            total = total + price;
                        });
                        var discount = $('#sel2').find(':selected').val()/100;
                        total = total - (total*discount);
                        scope.totalInvoice = total.toFixed(2);
                        $timeout(function(){
                            scope.$emit('change-total', scope.totalInvoice);
                        });
                    }
                    function countTotal(el, val){
                        var parentRow = el.closest('.row');
                        var price = parentRow.find('select').find(":selected").attr('data-price')*1;
                        parentRow.find('.totalPriceProduct').html((price*val).toFixed(2));
                    }

                    $('.spinner .btn:first-of-type').unbind('click').bind('click', function(e) {
                        var input = $(this).parent().prev();
                        input.val( input.val()*1 + 1);
                        countTotal($(this), input.val());
                        countTotalInvoice();
                    });
                    $('.spinner .btn:last-of-type').unbind('click').bind('click', function(e) {
                        var input = $(this).parent().prev();
                        if(input.val() > 0){
                            input.val( input.val()*1 - 1);
                        }
                        countTotal($(this), input.val());
                        countTotalInvoice();
                    });
                    $('#saveInvoice').unbind('click').bind('click', function(e){
                        var customer_id = $('#sel1').find(':selected').attr('data-id');
                        var customer_name = $('#sel1').find(':selected').val();
                        var discount = $('#sel2').find(':selected').val();

                        var data = {
                            customer_id : customer_id,
                            discount : discount,
                            total : scope.totalInvoice
                        };
                        ModelCommon.post('/invoices',data).then(function(res){
                            res.customerName = customer_name;
                            scope.$emit('added-item', res);
                            var productArray = [];
                            $('product').map(function(e,i){
                                var id = $(this).find('.productList').find(':selected').attr('data-id');
                                var count = $(this).find('.spinner input').val();
                                var productData = {
                                    product_id : id,
                                    quantity : count
                                };
                                ModelCommon.post('/invoices/'+res.id+'/items',productData).then(function(reponse){
                                    debugger});
                            });

                        });
                    });
                    $('.productList').unbind('change').bind('change', function(e) {debugger
                        var element = $(this).parent().parent();
                        initCurrentProduct(element);
                        countTotalInvoice();
                    });
                    $('#showMyModal').on('click', function () {
                        setTimeout(function(){
                            var element = $('product');
                            initCurrentProduct(element);
                            countTotalInvoice();
                        },10);
                    });

                    $('#addInvoice').on('click', function(e){
                        setTimeout(function(){
                            var element = $('product:last-child');debugger
                            initCurrentProduct(element);
                            countTotalInvoice();
                        },100);

                    });

                    $('#sel2').change(function () {
                        countTotalInvoice();
                    });
                }
            }
        }]
        );
    scotchApp.run(function(){
        $('#myModal').on('shown.bs.modal', function () {
            $('#myInput').focus()
        });
    });

      scotchApp.service('ModelCommon', ['$http', '$q', 'API_URL',  function ($http, $q, API_URL) {
       var srv = this;

        srv.fetch = function (routeName) {
            var defer = $q.defer();
            $http.get(API_URL + routeName)
                .then(function (res) {
                   defer.resolve(res.data);
                }, defer.reject);
            return defer.promise;
        };

        srv.fetchById = function (routeName, id) {
            var route = API_URL + routeName + id;
            var defer = $q.defer();
            $http.get(route)
                .then(function (res) {
                    defer.resolve(res.data);
                }, defer.reject);
            return defer.promise;
        };

        srv.update = function (routeName, data) {
            var defer = $q.defer();
            $http.put((API_URL + routeName), data )
                .then(function (res) {
                    defer.resolve(res.data);
                }, defer.reject);
            return defer.promise;
        };

        srv.post = function (routeName, data) {
            var defer = $q.defer();
            $http.post((API_URL + routeName), data )
                .then(function (res) {
                    defer.resolve(res.data);
                }, defer.reject);
            return defer.promise;
        };


    }]);
