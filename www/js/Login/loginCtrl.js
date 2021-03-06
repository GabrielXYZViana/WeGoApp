angular.module('starter')

.controller('loginCtrl', function($ionicPopup ,$scope, $state, $stateParams,
  $rootScope, $ionicLoading, factoryRegister, factoryLogin, serviceLogin,
  ionicMaterialInk, $timeout, $ionicPickerI18n, $ionicModal, factoryTwitter,
  serviceLoginSocial, serviceRegisterSocial) {

  $scope.$parent.clearFabs();
  $timeout(function() {
    $scope.$parent.hideHeader();
  }, 0);
  ionicMaterialInk.displayEffect();

  var toDataURL = function(src, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');
      var dataURL;
      canvas.height = this.height;
      canvas.width = this.width;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      callback(dataURL);
      return dataURL
    };
    img.src = src;
  }

  var ref = new Firebase("https://appwego.firebaseio.com");
  $scope.loginFacebook = function() {

    ref.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        toDataURL("https://graph.facebook.com/"+ authData.facebook.id +"/picture?width=700&height=700", function(base64Img) {
          $scope.fbimage = (base64Img.slice(22, base64Img.length));
          $rootScope.$apply();
        });
        $timeout(function () {
          console.log("Data from Firebase:", authData);
          serviceLogin.setUser(
            authData.facebook.displayName,
            authData.facebook.email,
            authData.facebook.id,
            authData.facebook.cachedUserProfile.birthday,
            authData.facebook.cachedUserProfile.gender
          );
          serviceRegisterSocial.setUser(
            authData.facebook.displayName,
            authData.facebook.email,
            authData.facebook.id,
            authData.facebook.cachedUserProfile.gender,
            new Date(authData.facebook.cachedUserProfile.birthday),
            $scope.fbimage
          );
          console.log("Usr:", serviceRegisterSocial.getUser());
          factoryRegister.save(serviceRegisterSocial.getUser(), function(user) {
            $ionicLoading.hide();
            var user ={};
            user.email = serviceRegisterSocial.getUser().email;
            user.password = serviceRegisterSocial.getUser().password;
            $scope.loginEmail(user);
          }, function(error) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              title: 'Ops!',
              template: 'Erro ao se comunicar com o servidor!'
            });
            $state.go('app.home');
          });
        }, 2500);
        $rootScope.user = serviceLogin.getUser();
        console.log("User:", $rootScope.user);
      }
    }, {
      remember: "sessionOnly",
      scope: "email, user_friends, user_birthday, user_photos"
    });
  }
  $scope.loginTwitter = function() {

    ref.authWithOAuthPopup("twitter", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Data from Firebase:", authData);
        toDataURL(authData.twitter.profileImageURL, function(base64Img) {
          $scope.fbimage = (base64Img.slice(22, base64Img.length));
          $rootScope.$apply();
        });
        $timeout(function () {
          serviceLoginSocial.setUser(
            authData.twitter.displayName,
            authData.twitter.email,
            authData.twitter.id
          );

          console.log("try",serviceLoginSocial.getUser());
          factoryTwitter.get(serviceLoginSocial.getUser(), function(user) {
            serviceLogin.setUser(
              user.name,
              user.email,
              user.auth_token
            );
            $ionicLoading.hide();
            $ionicPopup.alert({
              title: 'Logado!',
              template: '{{user}}'
            });
            $rootScope.user = serviceLogin.getUser();
            console.log(user);
            $state.go('app.profile');
            $ionicLoading.hide();
            $rootScope.logged = true;
          }, function(error) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              title: 'Ops!',
              template: 'Você ainda não está registrado!'
            });
            $state.go('app.twitterregister');
          })
        }, 2500);
      }
    }, {
      remember: "sessionOnly",
      scope: "email, user_likes"
    });
  }

  $scope.minDate = new Date(2105, 6, 1);
  $scope.maxDate = new Date(2015, 6, 31);

  $scope.datePickerCallback = function (val) {
  	if (!val) {
  		console.log('Date not selected');
  	} else {
  		console.log('Selected date is : ', val);
  	}
  };

  $scope.loginEmail = function(user) {
    $ionicLoading.show({
      template: 'Loading...'
    });
    factoryLogin.get(user, function(user) {
      serviceLogin.setUser(
        user.name,
        user.email,
        user.auth_token,
        user.birthday,
        user.gender,
        user.id
      );
      $ionicLoading.hide();
      $rootScope.user = user;
      console.log(user);
      $state.go('app.profile');
      $ionicLoading.hide();
      $rootScope.logged = true;
    }, function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Erro!',
        template: 'Login Falhou'
      });
    })
  }

  $scope.registerEmail = function(user) {
    $ionicLoading.show({
      template: 'Loading...'
    });
    factoryRegister.save(user, function(user) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Sucesso!',
        template: 'Cadastro efetuado com sucesso!'
      });
      $state.go('app.home');
      console.log("BF create", user);
    }, function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Erro!',
        template: 'Cadastro falhou, verifique os dados ou se o email ja foi cadastrado'
      });
    });
  }

  $scope.registerTwitter = function(user) {
    $scope.dataFromFirebase = serviceLoginSocial.getUser();
    serviceRegisterSocial.setUser(
      $scope.dataFromFirebase.name,
      user.email,
      $scope.dataFromFirebase.id_social,
      user.gender,
      user.birthday,
      $scope.fbimage
    );
    $ionicLoading.show({
      template: 'Loading...'
    });
    factoryRegister.save(serviceRegisterSocial.getUser(), function(user) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Sucesso!',
        template: 'Logado com sucesso!'
      });
      console.log(user);
    }, function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Erro!',
        template: 'Cadastro falhou, verifique os dados ou se o email ja foi cadastrado'
      });
    });
  }

  $scope.logout = function(user) {
    $ionicLoading.show({
      template: 'Loading...'
    });
    serviceLogin.setUser(
      null,
      null,
      null,
      null
    );
    factoryRegister.save(serviceLogin.getUser());
    $rootScope.user = serviceLogin.getUser();
    console.log($rootScope.user);
    $state.go('app.home');
    $ionicLoading.hide();
    $rootScope.fblogged = false;
    $rootScope.logged = false;
  }

  $ionicModal.fromTemplateUrl('templates/terms.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };

})
