(function (angular) {
    angular.module('inv').service('ModelCommon',
        ['$http', '$q', 'API_URL',
            function ($http, $q, API_URL) {
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

                srv.post = function (routeName, data) {
                    var defer = $q.defer();
                    $http.post((API_URL + routeName), data )
                        .then(function (res) {
                            defer.resolve(res.data);
                        }, defer.reject);
                    return defer.promise;
                };


            }]);
})(angular);