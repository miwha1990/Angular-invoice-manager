(function () {
    angular.module('inv').directive('navbar', function () {
        return {
            restrict: 'E',
            //template: "<h1>Hello!!S</h1>"
            templateUrl: '../../views/navbar.html',
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
})();
