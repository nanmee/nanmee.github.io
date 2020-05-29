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

function fireClick(element) {
    var nav = navigator.userAgent.toLowerCase(),
        ie = (-1 !== nav.indexOf('msie')) ? parseInt(nav.split('msie')[1]) : false;
    if (ie && 8 === ie) {
        element.fireEvent('onclick');
    }
    else if (ie || !element.fireEvent) {
        var evObj = document.createEvent('Events');
        evObj.initEvent('click', true, false);
        element.dispatchEvent(evObj);
    } else {
        element.fireEvent('onclick');
    }
}

function openMpAjaxReviewsTab(searchText) {
    var tabs = document.querySelectorAll('ul.toggle-tabs li, ul.tabs li');
    for (var i = 0; i < tabs.length; ++i) {
        var tab = tabs[i],
            tabText = ('innerText' in tab) ? 'innerText' : 'textContent',
            tabId = tab.id,
            searchId = 'review';

        tabText = tab[tabText].toLowerCase();
        searchText = searchText.toLowerCase();

        if (-1 !== tabId.indexOf(searchId) || -1 !== tabText.indexOf(searchText)) {
            var link = tab.querySelector('a');
            if (link) {
                fireClick(link);
            } else {
                fireClick(tab);
            }
            return false;
        }
    }
}

function openMpAjaxReviews(isProductPage, productUrl, searchText, sameTab) {
    window.location.hash = '';
    if (isProductPage) {
        openMpAjaxReviewsTab(searchText);
        window.location.hash = '#mp-ajax-all-reviews';
    } else {
        var url = productUrl + '?reviews=true';
        sameTab ? window.open(url, '_self') : window.open(url, '_blank');
    }
    return false;
}
