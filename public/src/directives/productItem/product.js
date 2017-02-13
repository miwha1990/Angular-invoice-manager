(function () {
    angular.module('inv').directive('product',
        ['$timeout','ModelCommon',
            function ($timeout, ModelCommon) {
            return {
                restrict: 'E',
                templateUrl: '../../views/product.html',

                link: function (scope, element, attrs, $rootScope) {

                    function initPrice(){
                        $('.product_item').each(function(){
                            var price = $(this).find('.productList').find(":selected").attr('data-price')*1;
                            $(this).find('.spinner input').val(1);
                            $(this).find('.totalPriceProduct').html(price);

                        });
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

                    $('.spinner .btn:first-of-type').on('click', function(e) {debugger
                        var input = $(this).parent().prev();
                        input.val( input.val()*1 + 1);
                        countTotal($(this), input.val());
                        countTotalInvoice();
                    });
                    $('.spinner .btn:last-of-type').on('click', function(e) {debugger
                        var input = $(this).parent().prev();
                        if(input.val() > 0){
                            input.val( input.val()*1 - 1);
                        }
                        countTotal($(this), input.val());
                        countTotalInvoice();
                    });
                    $('#saveInvoice').on('click', function(e){
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
                    $('.productList').on('change', function() {
                        setTimeout(function(){
                            initPrice();
                            countTotalInvoice();
                        },10);
                    });
                    $('#showMyModal').on('click', function () {
                        initPrice();
                        countTotalInvoice();
                    });

                    $('#addInvoice').on('click', function(e){
                        setTimeout(function(){
                            initPrice();
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
})();
