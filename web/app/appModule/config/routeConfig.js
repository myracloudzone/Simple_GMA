GMApp.config(['$routeProvider', '$stateProvider', '$locationProvider','notificationServiceProvider', '$urlRouterProvider', '$httpProvider',
  function($routeProvider, $stateProvider, $locationProvider, notificationServiceProvider, $urlRouterProvider, $httpProvider) {
    notificationServiceProvider.setDefaults({
        history: false,
        delay: 4000,
        closer: true,
        closer_hover: true  
    });
    var prefix = '/secure';

        $stateProvider
        .state('home', {
            url: prefix+'/home/:id',
            templateUrl: '/app/assets/angular/views/home.html',
            controller: 'HomeCtrl'
        })
        .state('login', {
            url: prefix+'/login',
            templateUrl: '/app/assets/angular/views/login.html',
            controller: 'LoginCtrl'
        })
        .state('logout', {
            url: '/logout',
            templateUrl: '/app/assets/angular/views/logout.html',
            controller: 'LogoutCtrl'
        })
        .state('plan', {
            url: prefix+'/plan/:id',
            templateUrl: '/app/assets/angular/views/plan.html',
            controller: 'PlanCtrl'
        })
        .state('group', {
            url: prefix+'/group/:id',
            templateUrl: '/app/assets/angular/views/group.html',
            controller: 'GroupCtrl'
        })
        .state('error', {
            url: prefix+'/error',
            templateUrl: '/app/assets/angular/views/error.html',
            controller: 'MessageCtrl'
        })
        .state('advanced', {
            url: prefix+'/advanced',
            templateUrl: '/app/assets/angular/views/advancedSetting.html',
            controller: 'AdvancedCtrl'
        })
        .state('member', {
            url: prefix+'/member/:id',
            templateUrl: '/app/assets/angular/views/member.html',
            controller: 'MemberCtrl'
        })
        .state('product', {
            url: prefix+'/product/:id',
            templateUrl: '/app/assets/angular/views/product.html',
            controller: 'ProductCtrl'
        })
        $urlRouterProvider.otherwise(function($injector, $location){
            var state = $injector.get('$state');
            var path = $location.path();
            if(path == '/')
                state.go('login');
            else
                state.go('error');
        });
        // $urlRouterProvider.otherwise(prefix+ '/error');
        // $routeProvider
        // .when(prefix+'/home', {
        //     templateUrl: '/app/assets/angular/views/home.html',
        //     controller: 'HomeCtrl'
        // })
        // .when(prefix+'/member', {
        //     templateUrl: '/app/assets/angular/views/member.html',
        //     controller: 'MemberCtrl'
        // })
        // .when(prefix+'/plan', {
        //     templateUrl: '/app/assets/angular/views/plan.html',
        //     controller: 'PlanCtrl'
        // })
        // .when(prefix+'/users', {
        //     templateUrl: '/app/assets/angular/views/users.html',
        //     controller: 'UsersCtrl'
        // })
        // .when(prefix+'/enquiry', {
        //     templateUrl: '/app/assets/angular/views/enquiry.html',
        //     controller: 'EnquiryCtrl'
        // })
        // .when(prefix+'/group', {
        //     templateUrl: '/app/assets/angular/views/group.html',
        //     controller: 'GroupCtrl'
        // })
        // .when(prefix+'/setting', {
        //     templateUrl: '/app/assets/angular/views/setting.html',
        //     controller: 'SettingCtrl'
        // })
        // .when(prefix+'/login', {
        //     templateUrl: '/app/assets/angular/views/login.html',
        //     controller: 'LoginCtrl'
        // })
        // .when(prefix+'/message', {
        //     templateUrl: '/app/assets/angular/views/message.html',
        //     controller: 'MessageCtrl'
        // })
        // .when(prefix+'/error', {
        //     templateUrl: '/app/assets/angular/views/error.html',
        //     controller: 'MessageCtrl'
        // })
        // .otherwise({
        //     redirectTo: prefix+'/error'
        // });
        $httpProvider.interceptors.push('requestInterceptor');
        $locationProvider.html5Mode(true);
}]);
