angular.module('GiveThatDevACookie.controllers', [])

.controller('AppCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker, AuthFactory) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    $scope.reservation = {};
    $scope.registration = {};
    $scope.loggedIn = false;

    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);
        $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        $scope.closeLogin();
    };

    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };

    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeRegister = function () {
        $scope.registerform.hide();
    };

    // Open the login modal
    $scope.register = function () {
        $scope.registerform.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doRegister = function () {
        console.log('Doing registration', $scope.registration);
        $scope.loginData.username = $scope.registration.username;
        $scope.loginData.password = $scope.registration.password;

        AuthFactory.register($scope.registration);
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeRegister();
        }, 1000);
    };

    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        $localStorage.storeObject('userinfo',$scope.loginData);
    });

    $ionicPlatform.ready(function() {
        var options = {
            quality: 50,
            // destinationType: Camera.DestinationType.DATA_URL,
            // sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            // encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            // popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $scope.takePicture = function() {
            $cordovaCamera.getPicture(options).then(function(imageData) {
                $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
            }, function(err) {
                console.log(err);
            });
            $scope.registerform.show();
        };

          var pickoptions = {
              maximumImagesCount: 1,
              width: 100,
              height: 100,
              quality: 50
          };

        $scope.pickImage = function() {
          $cordovaImagePicker.getPictures(pickoptions)
              .then(function (results) {
                  for (var i = 0; i < results.length; i++) {
                      console.log('Image URI: ' + results[i]);
                      $scope.registration.imgSrc = results[0];
                  }
              }, function (error) {
                  // error getting photos
              });
        };

    });
})

.controller('BrowseAppsController', ['$scope', 'browseAppsFactory', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function ($scope, browseAppsFactory, favoriteFactory, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;

    browseAppsFactory.query(
        function (response) {
          console.log("response SUCCESS",response);
          $scope.apps = response;
          $scope.apps.forEach(function(app, index) {
              if (app.tags) app.tags = app.tags.split(' ');
            });
        },
        function (response) {
          console.log("response FAIL",response);
        });

    $scope.select = function (setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
            $scope.filtText = "app";
        } else if (setTab === 3) {
            $scope.filtText = "script";
        } else if (setTab === 4) {
            $scope.filtText = "web_service";
        } else {
            $scope.filtText = "";
        }
    };

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function () {
        $scope.showDetails = !$scope.showDetails;
    };

    $scope.addFavorite = function (appid) {
        favoriteFactory.save({_id: appid});
        $ionicListDelegate.closeOptionButtons();

        $ionicPlatform.ready(function () {

            /*
              $cordovaLocalNotification.schedule({
                    id: 1,
                    title: "Added Favorite",
                    text: $scope.apps[appid].title
                }).then(function () {
                    console.log('Added Favorite '+$scope.apps[appid].title);
                },
                function () {
                    console.log('Failed to add Favorite ');
                });
            */

              $cordovaToast
                  .show('Added Favorite '+$scope.apps[appid].title, 'long', 'center')
                  .then(function (success) {
                      // success
                  }, function (error) {
                      // error
                  });


        });
    }
}])

.controller('ContactController', ['$scope', '$ionicModal', '$timeout', 'feedbackFactory', function ($scope, $ionicModal, $timeout, feedbackFactory) {

    $scope.feedback = {
        mychannel: "",
        firstName: "",
        lastName: "",
        agree: false,
        email: ""
    };

    var channels = [{
        value: "tel",
        label: "Tel."
    }, {
        value: "Email",
        label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/feedback.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.feedbackform = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeFeedback = function () {
        $scope.feedbackform.hide();
    };

    // Open the login modal
    $scope.feedback = function () {
        $scope.feedbackform.show();
    };

    $scope.sendFeedback = function () {

        console.log($scope.feedback);

        if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
            $scope.invalidChannelSelection = true;
            console.log('incorrect');
        } else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.save($scope.feedback);
            $scope.feedback = {
                mychannel: "",
                firstName: "",
                lastName: "",
                agree: false,
                email: ""
            };
            $scope.feedback.mychannel = "";
            console.log($scope.feedback);
        }
    };
}])

.controller('AppDetailController', ['$scope', '$state', '$stateParams', 'browseAppsFactory', 'favoriteFactory', 'commentFactory', 'baseURL', '$ionicPopover', '$ionicModal', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', '$cordovaSocialSharing', function ($scope, $state, $stateParams, browseAppsFactory, favoriteFactory, commentFactory, baseURL, $ionicPopover, $ionicModal, $ionicPlatform, $cordovaLocalNotification, $cordovaToast, $cordovaSocialSharing) {
 $scope.baseURL = baseURL;
 $scope.app = browseAppsFactory.get({ id: $stateParams.id },
    function (response) {
      console.log("APP:",response);
      $scope.app = response;
    },
    function (response) {
    }
);

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });


    $scope.openPopover = function ($event) {
        $scope.popover.show($event);
    };
    $scope.closePopover = function () {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function () {
        // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function () {
        // Execute action
    });

    $scope.addFavorite = function () {
        console.log("index is " + $stateParams.id);

        favoriteFactory.save({_id: $stateParams.id});;
        $scope.popover.hide();


        $ionicPlatform.ready(function () {

                $cordovaLocalNotification.schedule({
                    id: 1,
                    title: "Added Favorite",
                    text: $scope.app.title
                }).then(function () {
                    console.log('Added Favorite '+$scope.app.title);
                },
                function () {
                    console.log('Failed to add Favorite ');
                });

              $cordovaToast
                  .show('Added Favorite '+$scope.app.title, 'long', 'bottom')
                  .then(function (success) {
                      // success
                  }, function (error) {
                      // error
                  });


        });

    };

    $scope.mycomment = {
        rating: 5,
        comment: ""
    };

    $scope.submitComment = function () {

        commentFactory.save({id: $stateParams.id}, $scope.mycomment);

        $scope.closeCommentForm();


        $scope.mycomment = {
            rating: 5,
            comment: ""
        };

        $state.go($state.current, null, {reload: true});
    }

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.commentForm = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeCommentForm = function () {
        $scope.commentForm.hide();
    };

    // Open the login modal
    $scope.showCommentForm = function () {
        $scope.commentForm.show();
        $scope.popover.hide();
    };

    $ionicPlatform.ready(function() {

        var message = $scope.app.description;
        var subject = $scope.app.title;
        var link = $scope.baseURL+$scope.app.image_url;
        var image = $scope.baseURL+$scope.app.image_url;

        $scope.nativeShare = function() {
            $cordovaSocialSharing
                .share(message, subject, link); // Share via native share sheet
        };

        //checkout http://ngcordova.com/docs/plugins/socialSharing/
        // for other sharing options
    });

}])


// implement the IndexController and About Controller here
.controller('IndexController', ['$scope', 'browseAppsFactory', 'baseURL', function ($scope, browseAppsFactory, baseURL) {

    $scope.baseURL = baseURL;
    $scope.showApp = false;

    browseAppsFactory.query({
            featured: "true"
        },
            function (response) {
              $scope.apps = response;
              $scope.apps.length = 3;
              $scope.showApp = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );



}])

.controller('ShareAppController', ['$scope', 'shareAppFactory', 'baseURL', '$ionicModal', function ($scope, shareAppFactory, baseURL, $ionicModal) {

    $scope.baseURL = baseURL;

    $scope.newApp = {
      "appTitle":"Best app ever",
      "appDescription":"App can interact with the other objects in way nobody done before",
      "appImageUrl":"https://www.google.de/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
      "appDownloadUrl":"https://github.com/",
      "appCategory":"app",
      "appTags":"best_app innovation next_uber"
    };
    $scope.appCategories = [{
      "value":"app",
      "label":"App"
    },{
      "value":"script",
      "label":"Script"
    },{
      "value":"web_service",
      "label":"Web Service"
    }];

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/shareapp.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.shareAppForm = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeShareApp = function () {
        $scope.shareAppForm.hide();
    };

    // Open the login modal
    $scope.showShareAppModal = function () {
        $scope.shareAppForm.show();
    };

    $scope.shareApp = function(){
      shareAppFactory.create({
          "title": $scope.newApp.appTitle,
          "description": $scope.newApp.appDescription,
          "image_url": $scope.newApp.appImageUrl,
          "download_url": $scope.newApp.appDownloadUrl,
          "category": $scope.newApp.appCategory,
          "tags": $scope.newApp.appTags
      }).$promise.then(
          function (response) {
            $scope.newApp = {
              "appTitle":"",
              "appDescription":"",
              "appImageUrl":"",
              "appDownloadUrl":"",
              "appCategory":"",
              "appTags":""
            };
            $scope.shareAppForm.$setPristine();
            $scope.showSuccess = true;
          },
          function (response) {
            $scope.showError = true;
            $scope.errorMessage = response.status + " " + response.statusText;
          }
      );

    };

}])

.controller('FavoritesController', ['$scope', '$state', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout', '$ionicPlatform', '$cordovaVibration', function ($scope, $state, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout, $ionicPlatform, $cordovaVibration) {

    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;

    favoriteFactory.query(
        function (response) {
            $scope.dishes = response.dishes;
            $scope.showMenu = true;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });
    console.log($scope.dishes);


    $scope.toggleDelete = function () {
        $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
    }

    $scope.deleteFavorite = function (dishid) {

        var confirmPopup = $ionicPopup.confirm({
            title: '<h3>Confirm Delete</h3>',
            template: '<p>Are you sure you want to delete this item?</p>'
        });

        confirmPopup.then(function (res) {
            if (res) {
                console.log('Ok to delete');
                favoriteFactory.delete({id: dishid});

               $state.go($state.current, {}, {reload: true});
               // $window.location.reload();
            } else {
                console.log('Canceled delete');
            }
        });
        $scope.shouldShowDelete = false;


    }

}])

;
