/**
 * Magpleasure Ltd.
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the EULA
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.magpleasure.com/LICENSE.txt
 *
 * @category   Magpleasure
 * @package    Magpleasure_Ajaxreviews
 * @copyright  Copyright (c) 2014-2015 Magpleasure Ltd. (http://www.magpleasure.com)
 * @license    http://www.magpleasure.com/LICENSE.txt
 */

var ecomAjaxReviewsApp = angular.module('ecomAjaxReviewsApp', []);

/**
 * Dynamic element background color
 *
 */
ecomAjaxReviewsApp.directive('ecomBackColor', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            attrs.$observe('ecomBackColor', function (value) {
                element[0].style.backgroundColor = value;
            })
        }
    }
})

/**
 * Directive for 'Add first review' link, if product has no reviews
 *
 */
ecomAjaxReviewsApp.directive('ecomAjaxReviewsAddReview', function () {
    return {
        restrict: 'C',
        templateUrl: 'magpleasure/ajaxreviews/helper/summary/template.html',
        scope: true,
        controller: addReviewController
    }
})

/**
 * Ajax Reviews Directive
 *
 */
ecomAjaxReviewsApp.directive('ecomAjaxReviewsDynamic', function () {
    return {
        restrict: 'C',
        templateUrl: 'magpleasure/ajaxreviews/reviews.html',
        scope: true,
        controller: reviewsController,
        link: function (scope, elem, attr) {
            if (elem[0]) {
                /** Show ajax reviews and hide standard reviews */
                elem[0].style.display = 'block';
                angular.forEach($$('.mp-ajax-reviews-indexing'), function (e) {
                    e.remove();
                })
            }

            /** Hide form when pressed 'esc' button or clicked anywhere but form */
            var elements = document.querySelectorAll('.mp-ajax-reviews .mp-add-btn, .mp-ajax-reviews .mp-first-btn,' +
            '#mp-add-box, #mp-login-box, #mp-how-to-box, #mp-thank-box, .ecom-ajax-reviews-add-review');
            angular.forEach(elements, function (el) {
                el.onclick = function (e) {
                    if (e) {
                        e.stopPropagation();
                    }
                }
            });
            window.onclick = function (e) {
                e = e || window.event;
                if (e.which && 3 !== e.which) {
                    scope.$apply(attr.clickAnywhereButHere);
                }
            };
            document.onkeyup = function (e) {
                e = e || window.event;
                if (27 === e.keyCode) {
                    scope.$apply(attr.clickAnywhereButHere);
                }
            };

            /** Submit form when pressed 'ctrl+enter' */
            document.onkeydown = function (e) {
                e = e || window.event;
                if (13 === e.keyCode && e.ctrlKey) {
                    scope.$apply(attr.ctrlEnter);
                }
                if (13 === e.keyCode && scope.form == scope.FORMS.LOGIN) {
                    scope.$apply(attr.ctrlEnter);
                }
            };
        }
    }
})

/**
 * Controller for ecomAjaxReviewsAddReview
 *
 * @param $scope
 * @param ajaxReviewsAddReviewFactory
 */
var addReviewController = function ($scope, ajaxReviewsAddReviewFactory, ajaxReviewsCommon) {
    $scope.openReviewForm = function () {
        openMpAjaxReviewsTab(ajaxReviewsCommon.getReviewText());
        ajaxReviewsAddReviewFactory.openForm();
    }
};

/**
 * Controller for ecomAjaxReviewsDynamic
 *
 * @param $scope
 * @param $http
 * @param $q
 * @param $timeout
 * @param $window
 * @param ajaxReviewsCommon
 * @param ajaxReviewsUrl
 * @param ajaxReviewsDialog
 * @param ajaxReviewsAddReviewFactory
 */
var reviewsController = function ($scope, $http, $q, $timeout, $window, ajaxReviewsCommon, ajaxReviewsUrl, ajaxReviewsDialog, ajaxReviewsAddReviewFactory) {
    ajaxReviewsAddReviewFactory.$on('open-form', function () {
        $scope.showForm();
    });

    var ICON_DISPLAYS = {EMAIL_AVATAR: 1, LETTER: 2, BOTH: 3},
        GRAVATAR_URL = prepareUrl('http://www.gravatar.com/avatar/'),
        FORM_FIELDS_STORAGE_KEY = 'mp-ajax-reviews-add-' + ajaxReviewsCommon.getLocalStorageFormKey(),
        iconDisplay = parseInt(ajaxReviewsCommon.getIconDisplay()),
        checkingGravatars = false,
        voteRequest = false,
        logged = false,
        btnDisabled = {login: false, submit: false},
        page = 1,
        addHash = false,
        notificationKey = null;

    $scope.httpRequest = false;
    $scope.averageRating = ajaxReviewsCommon.getAvgRating();
    $scope.reviewsCount = ajaxReviewsCommon.getReviewsCount();
    $scope.ratings = ajaxReviewsCommon.getRatings();
    $scope.FORMS = {HIDE: 1, LOGIN: 2, REVIEW: 3, HOW_TO: 4, THANK: 5, PURCHASE:6};
    $scope.form = $scope.FORMS.HIDE;
    $scope.MESSAGES = {HIDE: 1, ERROR: 2, CONFIRM: 3, NOTIFICATION: 4};
    $scope.messageType = $scope.MESSAGES.HIDE;

    /** General settings */
    $scope.useSorting = ajaxReviewsCommon.useSorting();
    $scope.sortingTypes = $scope.useSorting ? getSortingTypes() : [];
    $scope.activeSorting = $scope.useSorting ? $scope.sortingTypes[0] : null;
    $scope.nextDescending = $scope.trySubmit = false;

    $scope.reviewsError = false;
    $scope.changeOrder = function () {
        if (!$scope.httpRequest) {
            $scope.nextDescending = !$scope.nextDescending;
            getReviews();
        }
    };
    $scope.loadMore = function () {
        if (!$scope.httpRequest) {
            page += 1;
            getReviews(true);
        }
    };

    /** Change sorting order */
    $scope.$watch('activeSorting', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            getReviews();
        }
    });

    getReviews();
    if (window.addEventListener) {
        window.addEventListener('beforeunload', saveFormFields, false);
    } else if (window.attachEvent) {
        window.attachEvent('onbeforeunload', saveFormFields);
    }
    fillFormFields();

    $scope.vote = ajaxReviewsCommon.isVotesEnabled();
    /** Product image for pinterest button */
    $scope.productImgUrl = ajaxReviewsCommon.getProductImageUrl();

    /** Styling functions */
    $scope.getIconBackColor = function (review) {
        if (checkingGravatars) {
            return 'transparent';
        }
        switch (iconDisplay) {
            case ICON_DISPLAYS.EMAIL_AVATAR:
                return 'transparent';
            case ICON_DISPLAYS.LETTER:
                return review.icon_color;
            case ICON_DISPLAYS.BOTH:
                return review.email_hash ? 'transparent' : review.icon_color;
        }
    };
    $scope.getIconBackImage = function (review) {
        if (checkingGravatars) {
            return 'none';
        }
        var defaultAvatar = ajaxReviewsCommon.getDefaultAvatar();
        switch (iconDisplay) {
            case ICON_DISPLAYS.EMAIL_AVATAR:
                return 'url("' + (review.email_hash ? GRAVATAR_URL + review.email_hash : defaultAvatar) + '")';
            case ICON_DISPLAYS.LETTER:
                return review.icon_color;
            case ICON_DISPLAYS.BOTH:
                if (review.email_hash) {
                    return 'url("' + GRAVATAR_URL + review.email_hash + '")';
                } else {
                    return review.icon_color;
                }
        }
    };
    $scope.showLetter = function (review) {
        if (checkingGravatars) {
            return false;
        }
        switch (iconDisplay) {
            case ICON_DISPLAYS.EMAIL_AVATAR:
                return false;
            case ICON_DISPLAYS.LETTER:
                return true;
            case ICON_DISPLAYS.BOTH:
                return !review.email_hash;
        }
    };
    $scope.getVoteBackColor = function (review) {
        if (0 == review.votes) {
            return '#a2a2a2';
        }
        return review.votes > 0 ? '#009688' : '#e91e63';
    };
    $scope.getRatingClass = function (rating, option) {
        if (!rating.activeOption && !rating.selected) {
            return '';
        }
        if (!rating.activeOption && option <= rating.selected) {
            return 'full-width';
        }
        return option <= rating.activeOption ? 'full-width' : '';
    };
    $scope.showRatingValidation = function () {
        if ($scope.trySubmit) {
            var show = false;
            angular.forEach($scope.ratings, function (rating) {
                if (!rating.selected) {
                    show = true;
                }
            })
            return show;
        }
        return false;
    };
    angular.forEach(document.querySelectorAll('#mp-login-form input'), function (el) {
        if (el.addEventListener) {
            el.addEventListener('focus', hideError, false);
        }
        else if (el.attachEvent) {
            el.attachEvent('onfocus', hideError);
        }
    });

    /**
     * Add new review vote
     *
     * @param review
     * @param like
     */
    $scope.assesReview = function (review, like) {
        if (!voteRequest) {
            voteRequest = true;
            var vote = like ? 1 : -1;
            $http.post(prepareUrl(ajaxReviewsUrl.vote()), {
                review_id: review.id,
                vote: vote
            }).success(function (response) {
                if (!response || !'error' in response) {
                    review.voted = true;
                    review.votes += vote;
                }
                voteRequest = false;
            }).error(function () {
                voteRequest = false;
            })

        }
    };

    $scope.sendData = function () {
        if ($scope.FORMS.LOGIN == $scope.form) {
            $scope.login()
        } else if ($scope.FORMS.REVIEW == $scope.form) {
            $scope.submitForm();
        }
    };

    /** 'Add review' form actions */
    $scope.showForm = function () {
        var isCustomer = ajaxReviewsCommon.getCurrentCustomerId() || logged;
        hideValidationResults();
        if(ajaxReviewsCommon.isPurchaseToReview())
        {
            if (isCustomer && ajaxReviewsCommon.isCustomerCanReview()) {
                $scope.form = $scope.FORMS.REVIEW;
            } else if (isCustomer) {
                $scope.form = $scope.FORMS.PURCHASE;
            } else {
                $scope.form = $scope.FORMS.LOGIN;
            }
        } else {
            if (ajaxReviewsCommon.allowGuestReview() || isCustomer) {
                $scope.form = $scope.FORMS.REVIEW;
            } else {
                $scope.form = $scope.FORMS.LOGIN;
            }
        }
    };
    $scope.hideForm = function () {
        if ($scope.FORMS.HOW_TO == $scope.form) {
            $scope.form = $scope.FORMS.REVIEW;
        } else {
            $scope.form = $scope.FORMS.HIDE;
            $scope.trySubmit = false;
            $timeout(function () {
                $scope.messageType = $scope.MESSAGES.HIDE;
            }, 200)
        }
    };
    $scope.submitForm = function () {
        if (btnDisabled.submit) {
            return;
        }
        $scope.messageType = $scope.MESSAGES.HIDE;
        if (!verifyElements(['nickname', 'title', 'detail'], true)) {
            $scope.trySubmit = true;
        } else {
            var parameters = Form.serializeElements($$(['#nickname', '#title', '#detail']), true),
                productInfo = ajaxReviewsCommon.getProductInfo();
            angular.forEach($scope.ratings, function (rating) {
                parameters['ratings[' + rating.id + ']'] = rating.selected;
            })
            parameters['id'] = productInfo.product_id;
            parameters['category'] = productInfo.category_id;
            parameters['average_rating'] = getPendingReviewRating();
            parameters['notification_key'] = notificationKey;

            btnDisabled.submit = true;
            $http.post(prepareUrl(ajaxReviewsUrl.post()), parameters).success(function (response) {
                if ('error' in response) {
                    $scope.messageType = $scope.MESSAGES.ERROR;
                    $scope.message = response.error;
                } else {
                    $scope.showThankIcon = showThumbsUp();
                    $scope.form = $scope.FORMS.THANK;
                    $timeout(function () {
                        if (document.forms['mp-add-form']) {
                            var formElements = document.forms['mp-add-form'].elements;
                            formElements['nickname'].value = response.customer_name == ' ' ? '' : response.customer_name;
                            formElements['title'].value = formElements['detail'].value = '';
                        }
                        angular.forEach($scope.ratings, function (rating) {
                            rating.selected = null;
                        })
                    }, 200)
                }
                btnDisabled.submit = false;
            }).error(function () {
                $scope.messageType = $scope.MESSAGES.ERROR;
                $scope.message = ajaxReviewsCommon.getErrorText();
                btnDisabled.submit = false;
            })
        }
    };

    /** 'Login' form actions */
    $scope.login = function () {
        if (btnDisabled.login) {
            return false;
        }
        $scope.messageType = $scope.MESSAGES.HIDE;
        if (verifyElements(['login-email', 'login-pass'])) {
            var formEl = Form.serializeElements($$(['#login-email', '#login-pass']), true),
                parameters = {
                    'login[username]': formEl['login-email'],
                    'login[password]': formEl['login-pass'],
                    'product_id': ajaxReviewsCommon.getProductInfo().product_id
                };
            btnDisabled.login = true;
            $http.post(prepareUrl(ajaxReviewsUrl.login()), parameters).success(function (response) {
                if ('error' in response) {
                    if (typeof response.error != 'string' && 'confirm' in response.error) {
                        $scope.messageType = $scope.MESSAGES.CONFIRM;
                    } else {
                        $scope.messageType = $scope.MESSAGES.ERROR;
                        $scope.message = response.error;
                        $('login-email').addClassName('validation-failed');
                        $('login-pass').addClassName('validation-failed');
                    }
                } else {
                    /** Success logged in **/
                    if (response.can_review) {
                        $scope.form = $scope.FORMS.REVIEW;
                    } else {
                        $scope.form = $scope.FORMS.PURCHASE;
                    }
                    setCustomerName(response.customer_name);
                    logged = true;
                }
                btnDisabled.login = false;
            }).error(function () {
                $scope.messageType = $scope.MESSAGES.ERROR;
                $scope.message = ajaxReviewsCommon.getErrorText();
                btnDisabled.login = false;
            })
        }
    };
    $scope.sendConfirmation = function () {
        btnDisabled.login = true;
        $scope.messageType = $scope.MESSAGES.HIDE;
        $http.post(prepareUrl(ajaxReviewsUrl.confirmation()), {email: $F('login-email')}).success(function (response) {
            if ('error' in response) {
                $scope.messageType = $scope.MESSAGES.ERROR;
                $scope.message = response.error.msg;
                $('login-email').addClassName('validation-failed');
                if (2 == response.error.type) {
                    /** Wrong email or password **/
                    $('login-pass').addClassName('validation-failed');
                }
            } else if ('notification' in response) {
                $scope.messageType = $scope.MESSAGES.NOTIFICATION;
                $scope.message = response.notification;
            }
            btnDisabled.login = false;
        }).error(function () {
            $scope.messageType = $scope.MESSAGES.ERROR;
            $scope.message = ajaxReviewsCommon.getErrorText();
            btnDisabled.login = false;
        })
    };
    $scope.register = function () {
        window.open(ajaxReviewsUrl.register());
    };

    /** Dialogs */
    $scope.howTo = {
        enabled: ajaxReviewsDialog.isHowToEnabled(),
        title: ajaxReviewsDialog.howToTitle(),
        text: ajaxReviewsDialog.howToText().split('lnbr'),
        btnLabel: ajaxReviewsDialog.howToBtnLabel()
    };
    $scope.purchase = {
        title: ajaxReviewsDialog.needPurchaseTitle(),
        text: ajaxReviewsDialog.needPurchaseText().split('lnbr'),
        btnLabel: ajaxReviewsDialog.needPurchaseBtnLabel()
    };
    $scope.showHowToDialog = function () {
        $scope.form = $scope.FORMS.HOW_TO;
    };
    $scope.thank = {
        title: ajaxReviewsDialog.thankTitle(),
        text: ajaxReviewsDialog.thankText().split('lnbr'),
        btnLabel: ajaxReviewsDialog.thankBtnLabel()
    };

    /** Straight show product reviews */
    if ('#mp-ajax-all-reviews' == window.location.hash) {
        addHash = true;
        window.location.hash = '';
    }
    if ('true' == findUrlParameter('reviews')) {
        openMpAjaxReviewsTab(ajaxReviewsCommon.getReviewText());
        addHash = true;
        window.location.hash = '';
    }
    if ('true' == findUrlParameter('leavereview')) {
        $scope.showForm();
    } else if (findUrlParameter('leavereview')) {
        openMpAjaxReviewsTab(ajaxReviewsCommon.getReviewText());
        notificationKey = findUrlParameter('leavereview');
        $scope.showForm();
    }

    function findUrlParameter(text) {
        var regex = new RegExp("[\\?&]" + text + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\/+/g, ""));
    }

    function saveFormFields() {
        if (!document.forms['mp-add-form']) {
            return;
        }
        var formElements = document.forms['mp-add-form'].elements,
            selectedRatings = {};
        angular.forEach($scope.ratings, function (rating) {
            selectedRatings[rating.id] = rating.selected;
        })
        $window.localStorage.setItem(FORM_FIELDS_STORAGE_KEY, angular.toJson({
            nickname: formElements['nickname'].value || '',
            title: formElements['title'].value || '',
            detail: formElements['detail'].value || '',
            ratings: selectedRatings
        }))
    }

    function fillFormFields() {
        if (!document.forms['mp-add-form']) {
            return;
        }
        var formElements = document.forms['mp-add-form'].elements,
            storageData = $window.localStorage.getItem(FORM_FIELDS_STORAGE_KEY);
        if (storageData) {
            storageData = angular.fromJson(storageData);
            formElements['nickname'].value = storageData.nickname || ajaxReviewsCommon.getCustomerName();
            formElements['title'].value = storageData.title;
            formElements['detail'].value = storageData.detail;
            angular.forEach($scope.ratings, function (rating) {
                if (storageData.ratings[rating.id]) {
                    rating.selected = storageData.ratings[rating.id];
                }
            })
        } else {
            formElements['nickname'].value = ajaxReviewsCommon.getCustomerName();
        }
    }

    /**
     * Get sorting types, available for reviews ordering
     *
     * @returns {Array}
     */
    function getSortingTypes() {
        var names = ajaxReviewsCommon.getSortingTypeNames(),
            TYPES = {
                1: {title: names.newest, id: 1, field: 'created_at'},
                2: {title: names.useful, id: 2, field: 'votes'},
                3: {title: names.topRated, id: 3, field: 'rating'}
            },
            result = [];
        angular.forEach(ajaxReviewsCommon.getSortingTypes().split(','), function (type) {
            result.push(TYPES[type]);
        })
        return result;

    }

    function setCustomerName(name) {
        if (document.forms['mp-add-form']) {
            var formElements = document.forms['mp-add-form'].elements;
            formElements['nickname'].value = name;
        }
    }

    /**
     * Get reviews according to page and sorting order
     *
     */
    function getReviews(loadMore) {
        $scope.httpRequest = true;
//        if (!loadMore) {
//            $scope.reviews = {};
//        }
        var productInfo = ajaxReviewsCommon.getProductInfo(),
            data = {
                product_id: productInfo.product_id,
                order_direction: $scope.nextDescending ? 'asc' : 'desc',
                order: $scope.activeSorting ? $scope.activeSorting.field : 'created_at',
                page: page
            }
        if (loadMore) {
            data.load_more = 1;
        }
        $http.post(prepareUrl(ajaxReviewsUrl.getReviews()), data).success(function (response) {
            if ('error' in response) {
                $scope.reviewsError = true;
                addHash = false;
            } else {
                checkGravatars(response.reviews).then(function () {
                    $scope.reviews = loadMore ? $scope.reviews.concat(response.reviews) : response.reviews;
                    if (addHash) {
                        $timeout(function () {
                            window.location.hash = '#mp-ajax-all-reviews';
                        })
                    }
                    addHash = false;
                }).then(/** never happens because checkGravatars always resolves promise **/);
            }
            $scope.httpRequest = false;
        }).error(function () {
            $scope.reviewsError = true;
            $scope.httpRequest = addHash = false;
        })
    }

    /**
     * Check every customer for gravatar image
     *
     * @param reviews
     * @returns {promise|*|a.fn.promise}
     */
    function checkGravatars(reviews) {
        var deferred = $q.defer();
        if (ajaxReviewsCommon.showIcons() && ICON_DISPLAYS.LETTER != iconDisplay) {
            checkingGravatars = true;
            var promises = [];
            angular.forEach(reviews, function (review) {
                if (review.email_hash) {
                    promises.push(checkGravatarImage(review));
                }
            })
            $q.all(promises).then(function () {
                checkingGravatars = false;
                deferred.resolve();
            }).then(/** never happens because checkGravatarImage always resolves promise */);
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    }

    /**
     * Check if email image was setted
     *
     * @param review
     * @returns {promise|*|a.fn.promise}
     */
    function checkGravatarImage(review) {
        var deferred = $q.defer();
        $http.get(GRAVATAR_URL + review.email_hash + '?d=404').success(function (response) {
            deferred.resolve();
        }).error(function () {
            review.email_hash = false;
            deferred.resolve();
        })
        return deferred.promise;
    }

    function hideError() {
        hideValidationResults();
        $scope.messageType = $scope.MESSAGES.HIDE;
        $timeout(function () {
            $scope.$apply();
        })
    }

    function verifyElements(elements, considerRating) {
        var success = true;
        angular.forEach(elements, function (item) {
            if (!Validation.validate($(item))) {
                success = false;
            }
        })
        if (considerRating) {
            angular.forEach($scope.ratings, function (rating) {
                if (!rating.selected) {
                    success = false;
                }
            })
        }
        return success;
    }

    function hideValidationResults() {
        angular.forEach($$('.mp-ajax-reviews .validation-advice:not(.rating-advice)'), function (e) {
            e.remove();
        })
        angular.forEach($$('.mp-ajax-reviews .validation-failed'), function (e) {
            e.removeClassName('validation-failed')
        })
    }

    function getPendingReviewRating() {
        if (!$scope.ratings.length) {
            return 0;
        }
        return 100 * getAverageRating($scope.ratings) / 5;
    }

    /**
     * Show 'thumbs up' image if average rating >= 3
     *
     * @returns {boolean}
     */
    function showThumbsUp() {
        if (!$scope.ratings.length) {
            return true;
        }
        return 3 <= getAverageRating($scope.ratings);
    }

    function getAverageRating(ratings) {
        var avg = 0;
        angular.forEach(ratings, function (rating) {
            var qty = rating.options.length,
                dif = rating.options[qty - 1] - rating.selected;
            avg += qty - dif;
        })
        return avg / ratings.length;
    }

    function prepareUrl(url) {
        return url.replace(/^http[s]{0,1}/, window.location.href.replace(/:[^:].*$/i, ''));
    }
};