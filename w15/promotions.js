/**
* Magedelight
* Copyright (C) 2017 Magedelight <info@magedelight.com>
*
* NOTICE OF LICENSE
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* License for more details.
*
* @category MD
* @package MD_Bundlediscount
* @copyright Copyright (c) 2017 Mage Delight (http://www.magedelight.com/)
* @license http://opensource.org/licenses/gpl-3.0.html GNU General Public License,version 3 (GPL-3.0)
* @author Magedelight <info@magedelight.com>
*/
function configureOptions(bundle_id,ajaxUrl){
    if(bundle_id !== 'undefined'){
        $$('div[id^="configure_bundle_"]').each(function(configBundle){
            $(configBundle).update('');
            $(configBundle).removeAttribute("style");
        });
        new Ajax.Request(ajaxUrl,{
            'method':'post',
            'parameters':{bundle_id:bundle_id},
	    onLoading:function(){
                $pbd('#configure_bundle_'+bundle_id).bPopup({scrollBar:true});
            },
            onSuccess:function(transport){
                    var response = transport.responseText;
		if($('configure_bundle_'+bundle_id) !== 'undefined'){
				
                    $('configure_bundle_'+bundle_id).update('');
                    $('configure_bundle_'+bundle_id).setStyle({backgroundImage:'none'});
                    $('configure_bundle_'+bundle_id).update(response);
                    Event.observe('options-submit-button-'+bundle_id,'click',function(){
                        
                        var form = new VarienForm('bundlediscount-option-'+bundle_id, true);
                        if (form.validator.validate()) {
                            
                            try {
                                form.submit();
                            } catch (e) {
                            }
                        }
                    });
                }
                
		},
                onComplete:function(transport){
                    
                }
	});
        
    }
}
if (typeof Bundlepromotions == 'undefined') {
    var Bundlepromotions = {};
}
Bundlepromotions.Config = Class.create();
Bundlepromotions.Config.prototype = {
    initialize: function(config,productId){
        this.config     = config;
        this.productId = productId;
        this.taxConfig  = this.config.taxConfig;
        
        if (config.containerId) {
            this.settings   = $$('#' + config.containerId + ' ' + '.bundle-promotions-super-attribute-select');
        } else {
            this.settings   = $$('.bundle-promotions-super-attribute-select');
        }
        
        this.state      = new Hash();
        this.priceTemplate = new Template(this.config.template);
        this.prices     = config.prices;

        // Set default values from config
        if (config.defaultValues) {
            this.values = config.defaultValues;
        }

        // Overwrite defaults by inputs values if needed
        if (config.inputsInitialized) {
            this.values = {};
            this.settings.each(function(element) {
                if (element.value) {
                    var attributeId = element.id.replace(/[a-z]*/, '');
                    this.values[attributeId] = element.value;
                }
            }.bind(this));
        }

        // Put events to check select reloads
        this.settings.each(function(element){
            Event.observe(element, 'change', this.configure.bind(this))
        }.bind(this));

        // fill state
        this.settings.each(function(element){
            var attributeId = element.id.replace(/[a-z]*/, '');
            if(attributeId && this.config.attributes[attributeId]) {
                element.config = this.config.attributes[attributeId];
                element.attributeId = attributeId;
                this.state[attributeId] = false;
            }
        }.bind(this))

        // Init settings dropdown
        var childSettings = [];
        for(var i=this.settings.length-1;i>=0;i--){
            var prevSetting = this.settings[i-1] ? this.settings[i-1] : false;
            var nextSetting = this.settings[i+1] ? this.settings[i+1] : false;
            if (i == 0){
                this.fillSelect(this.settings[i])
            } else {
                this.settings[i].disabled = true;
            }
            $(this.settings[i]).childSettings = childSettings.clone();
            $(this.settings[i]).prevSetting   = prevSetting;
            $(this.settings[i]).nextSetting   = nextSetting;
            childSettings.push(this.settings[i]);
        }

        // Set values to inputs
        this.configureForValues();
        document.observe("dom:loaded", this.configureForValues.bind(this));
    },

    configureForValues: function () {
        if (this.values) {
            this.settings.each(function(element){
                var attributeId = element.attributeId;
                element.value = (typeof(this.values[attributeId]) == 'undefined')? '' : this.values[attributeId];
                this.configureElement(element);
            }.bind(this));
        }
    },

    configure: function(event){
        var element = Event.element(event);
        this.configureElement(element);
    },

    configureElement : function(element) {
        this.reloadOptionLabels(element);
        if(element.value){
            this.state[element.config.id] = element.value;
            if(element.nextSetting){
                element.nextSetting.disabled = false;
                this.fillSelect(element.nextSetting);
                this.resetChildren(element.nextSetting);
            }
        }
        else {
            this.resetChildren(element);
        }
        this.reloadPrice();
    },

    reloadOptionLabels: function(element){
        var selectedPrice;
        if(element.options[element.selectedIndex].config && !this.config.stablePrices){
            selectedPrice = parseFloat(element.options[element.selectedIndex].config.price)
        }
        else{
            selectedPrice = 0;
        }
        for(var i=0;i<element.options.length;i++){
            if(element.options[i].config){
                element.options[i].text = this.getOptionLabel(element.options[i].config, element.options[i].config.price-selectedPrice);
            }
        }
    },

    resetChildren : function(element){
        if(element.childSettings) {
            for(var i=0;i<element.childSettings.length;i++){
                element.childSettings[i].selectedIndex = 0;
                element.childSettings[i].disabled = true;
                if(element.config){
                    this.state[element.config.id] = false;
                }
            }
        }
    },

    fillSelect: function(element){
        var attributeId = element.id.replace(/[a-z]*/, '');
        var options = this.getAttributeOptions(attributeId);
        this.clearSelect(element);
        if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 8) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 13)){
            element.options[0] = new Option('', '');
            element.options[0].innerHTML = this.config.chooseText;
        }else{
            element.options[0] = new Option(this.config.chooseText, '');
        }
        var prevConfig = false;
        if(element.prevSetting){
            prevConfig = element.prevSetting.options[element.prevSetting.selectedIndex];
        }

        if(options) {
            var index = 1;
            for(var i=0;i<options.length;i++){
                var allowedProducts = [];
                if(prevConfig) {
                    for(var j=0;j<options[i].products.length;j++){
                        if(prevConfig.config.allowedProducts
                            && prevConfig.config.allowedProducts.indexOf(options[i].products[j])>-1){
                            allowedProducts.push(options[i].products[j]);
                        }
                    }
                } else {
                    allowedProducts = options[i].products.clone();
                }

                if(allowedProducts.size()>0){
                    options[i].allowedProducts = allowedProducts;
                    element.options[index] = new Option(this.getOptionLabel(options[i], options[i].price), options[i].id);
                    if (typeof options[i].price != 'undefined') {
                        element.options[index].setAttribute('price', options[i].price);
                    }
                    element.options[index].config = options[i];
                    index++;
                }
            }
        }
    },

    getOptionLabel: function(option, price){
        var price = parseFloat(price);
        if (this.taxConfig.includeTax) {
            var tax = price / (100 + this.taxConfig.defaultTax) * this.taxConfig.defaultTax;
            var excl = price - tax;
            var incl = excl*(1+(this.taxConfig.currentTax/100));
        } else {
            var tax = price * (this.taxConfig.currentTax / 100);
            var excl = price;
            var incl = excl + tax;
        }

        if (this.taxConfig.showIncludeTax || this.taxConfig.showBothPrices) {
            price = incl;
        } else {
            price = excl;
        }

        var str = option.label;
        if(price){
            if (this.taxConfig.showBothPrices) {
                str+= ' ' + this.formatPrice(excl, true) + ' (' + this.formatPrice(price, true) + ' ' + this.taxConfig.inclTaxTitle + ')';
            } else {
                str+= ' ' + this.formatPrice(price, true);
            }
        }
        return str;
    },

    formatPrice: function(price, showSign){
        var str = '';
        price = parseFloat(price);
        if(showSign){
            if(price<0){
                str+= '-';
                price = -price;
            }
            else{
                str+= '+';
            }
        }

        var roundedPrice = (Math.round(price*100)/100).toString();

        if (this.prices && this.prices[roundedPrice]) {
            str+= this.prices[roundedPrice];
        }
        else {
            str+= this.priceTemplate.evaluate({price:price.toFixed(2)});
        }
        return str;
    },

    clearSelect: function(element){
        for(var i=element.options.length-1;i>=0;i--){
            element.remove(i);
        }
    },

    getAttributeOptions: function(attributeId){
        if(this.config.attributes[attributeId]){
            return this.config.attributes[attributeId].options;
        }
    },

    reloadPrice: function(){
        if (this.config.disablePriceReload) {
            return;
        }
        var price    = 0;
        var oldPrice = 0;
        for(var i=this.settings.length-1;i>=0;i--){
            var selected = this.settings[i].options[this.settings[i].selectedIndex];
            if(selected.config){
                price    += parseFloat(selected.config.price);
                oldPrice += parseFloat(selected.config.oldPrice);
            }
        }

        bundles_optionsPrice[this.productId].changePrice('config', {'price': price, 'oldPrice': oldPrice});
        bundles_optionsPrice[this.productId].reload();

        return price;

        if($('product-price-'+this.config.productId+'-bundle-promotions')){
            $('product-price-'+this.config.productId+'-bundle-promotions').innerHTML = price;
        }
        this.reloadOldPrice();
    },

    reloadOldPrice: function(){
        if (this.config.disablePriceReload) {
            return;
        }
        if ($('old-price-'+this.config.productId)) {

            var price = parseFloat(this.config.oldPrice);
            for(var i=this.settings.length-1;i>=0;i--){
                var selected = this.settings[i].options[this.settings[i].selectedIndex];
                if(selected.config){
                    price+= parseFloat(selected.config.price);
                }
            }
            if (price < 0)
                price = 0;
            price = this.formatPrice(price);

            if($('old-price-'+this.config.productId)){
                $('old-price-'+this.config.productId).innerHTML = price;
            }

        }
    }
}
Bundlepromotions.Bundle = Class.create();
Bundlepromotions.Bundle.prototype = {
    initialize: function(config,productId){
        this.config = config;
        this.productId = productId;
        // Set preconfigured values for correct price base calculation
        if (config.defaultValues) {
            for (var option in config.defaultValues) {
                if (this.config['options'][option].isMulti) {
                    var selected = new Array();
                    for (var i = 0; i < config.defaultValues[option].length; i++) {
                        selected.push(config.defaultValues[option][i]);
                    }
                    this.config.selected[option] = selected;
                } else {
                    this.config.selected[option] = new Array(config.defaultValues[option] + "");
                }
            }
        }

        this.reloadPrice();
    },
    changeSelection: function(selection){
        var parts = selection.id.split('-');
        if (this.config['options'][parts[2]].isMulti) {
            selected = new Array();
            if (selection.tagName == 'SELECT') {
                for (var i = 0; i < selection.options.length; i++) {
                    if (selection.options[i].selected && selection.options[i].value != '') {
                        selected.push(selection.options[i].value);
                    }
                }
            } else if (selection.tagName == 'INPUT') {
                selector = parts[0]+'-'+parts[1]+'-'+parts[2];
                selections = $$('.'+selector);
                for (var i = 0; i < selections.length; i++) {
                    if (selections[i].checked && selections[i].value != '') {
                        selected.push(selections[i].value);
                    }
                }
            }
            this.config.selected[parts[2]] = selected;
        } else {
            if (selection.value != '') {
                this.config.selected[parts[2]] = new Array(selection.value);
            } else {
                this.config.selected[parts[2]] = new Array();
            }
            this.populateQty(parts[2], selection.value);
            if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 8) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 13)){
                var tierPriceElement = $('bundle-option-' + parts[2] + '-tier-prices-promotions'),
                    tierPriceHtml = '';
                if (selection.value != '' && this.config.options[parts[2]].selections[selection.value].customQty == 1) {
                    tierPriceHtml = this.config.options[parts[2]].selections[selection.value].tierPriceHtml;
                }
                tierPriceElement.update(tierPriceHtml);
            }
        }
        this.reloadPrice();
    },

    reloadPrice: function() {
        var calculatedPrice = 0;
        var dispositionPrice = 0;
        var includeTaxPrice = 0;

        for (var option in this.config.selected) {
            if (this.config.options[option]) {
                for (var i=0; i < this.config.selected[option].length; i++) {
                    var prices = this.selectionPrice(option, this.config.selected[option][i]);
                    calculatedPrice += Number(prices[0]);
                    dispositionPrice += Number(prices[1]);
                    includeTaxPrice += Number(prices[2]);
                }
            }
        }
        if(magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 8){
            //Tax is calculated in a different way for the the TOTAL BASED method
            //We round the taxes at the end. Hence we do the same for consistency
            //This variable is set in the bundle.phtml
            if (taxCalcMethod == CACL_TOTAL_BASE) {
                var calculatedPriceFormatted = calculatedPrice.toFixed(10);
                var includeTaxPriceFormatted = includeTaxPrice.toFixed(10);
                var tax = includeTaxPriceFormatted - calculatedPriceFormatted;
                calculatedPrice = includeTaxPrice - Math.round(tax * 100) / 100;
            }

            //make sure that the prices are all rounded to two digits
            //this is needed when tax calculation is based on total for dynamic
            //price bundle product. For fixed price bundle product, the rounding
            //needs to be done after option price is added to base price
            if (this.config.priceType == '0') {
                calculatedPrice = Math.round(calculatedPrice*100)/100;
                dispositionPrice = Math.round(dispositionPrice*100)/100;
                includeTaxPrice = Math.round(includeTaxPrice*100)/100;

            }
        }
        var event = $(document).fire('bundle:reload-price', {
            price: calculatedPrice,
            priceInclTax: includeTaxPrice,
            dispositionPrice: dispositionPrice,
            bundle: this
        });
        if (!event.noReloadPrice) {
            bundles_optionsPrice[this.productId].specialTaxPrice = 'true';
            bundles_optionsPrice[this.productId].changePrice('bundle', calculatedPrice);
            bundles_optionsPrice[this.productId].changePrice('nontaxable', dispositionPrice);
            bundles_optionsPrice[this.productId].changePrice('priceInclTax', includeTaxPrice);
            bundles_optionsPrice[this.productId].reload();
        }

        return calculatedPrice;
    },

    selectionPrice: function(optionId, selectionId) {
        if (selectionId == '' || selectionId == 'none') {
            return 0;
        }
        var qty = null;
        if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 8) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 13)){
            var tierPriceInclTax, tierPriceExclTax;
        }
        if (this.config.options[optionId].selections[selectionId].customQty == 1 && !this.config['options'][optionId].isMulti) {
            if ($('bundle-option-' + optionId + '-qty-input-promotions')) {
                qty = $('bundle-option-' + optionId + '-qty-input-promotions').value;
            } else {
                qty = 1;
            }
        } else {
            qty = this.config.options[optionId].selections[selectionId].qty;
        }
        if (this.config.priceType == '0') {
            price = this.config.options[optionId].selections[selectionId].price;
            tierPrice = this.config.options[optionId].selections[selectionId].tierPrice;

            for (var i=0; i < tierPrice.length; i++) {
                if (Number(tierPrice[i].price_qty) <= qty && Number(tierPrice[i].price) <= price) {
                    price = tierPrice[i].price;
                    if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 8) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 13)){
                        tierPriceInclTax = tierPrice[i].priceInclTax;
                        tierPriceExclTax = tierPrice[i].priceExclTax;
                    }
                }
            }
        } else {
            selection = this.config.options[optionId].selections[selectionId];
            if (selection.priceType == '0') {
                price = selection.priceValue;
            } else {
                price = (this.config.basePrice*selection.priceValue)/100;
            }
        }
        //price += this.config.options[optionId].selections[selectionId].plusDisposition;
        //price -= this.config.options[optionId].selections[selectionId].minusDisposition;
        //return price*qty;
        var disposition = this.config.options[optionId].selections[selectionId].plusDisposition +
            this.config.options[optionId].selections[selectionId].minusDisposition;

        if (this.config.specialPrice) {
            newPrice = (price*this.config.specialPrice)/100;
            if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) < 8) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) < 13)){
                newPrice = (Math.round(newPrice*100)/100).toString();
            }
            price = Math.min(newPrice, price);
        }

        selection = this.config.options[optionId].selections[selectionId];
        if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 8) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 14)){
            if (tierPriceInclTax !== undefined && tierPriceExclTax !== undefined) {
                priceInclTax = tierPriceInclTax;
                price = tierPriceExclTax;
            } else if (selection.priceInclTax !== undefined) {
                priceInclTax = selection.priceInclTax;
                price = selection.priceExclTax !== undefined ? selection.priceExclTax : selection.price;
            } else {
                priceInclTax = price;
            }
        if (this.config.priceType == '1' || taxCalcMethod == CACL_TOTAL_BASE) {
            var result = new Array(price*qty, disposition*qty, priceInclTax*qty);
            return result;
        }
        else if (taxCalcMethod == CACL_UNIT_BASE) {
            price = (Math.round(price*100)/100).toString();
            disposition = (Math.round(disposition*100)/100).toString();
            priceInclTax = (Math.round(priceInclTax*100)/100).toString();
            var result = new Array(price*qty, disposition*qty, priceInclTax*qty);
            return result;
        } else { //taxCalcMethod == CACL_ROW_BASE)
            price = (Math.round(price*qty*100)/100).toString();
            disposition = (Math.round(disposition*qty*100)/100).toString();
            priceInclTax = (Math.round(priceInclTax*qty*100)/100).toString();
            var result = new Array(price, disposition, priceInclTax);
            return result;
        }
        }else{
            if (selection.priceInclTax !== undefined) {
                priceInclTax = selection.priceInclTax;
                price = selection.priceExclTax !== undefined ? selection.priceExclTax : selection.price;
            } else {
                priceInclTax = price;
            }

            var result = new Array(price*qty, disposition*qty, priceInclTax*qty);
            return result;
        }
    },

    populateQty: function(optionId, selectionId){
        if (selectionId == '' || selectionId == 'none') {
            this.showQtyInput(optionId, '0', false);
            return;
        }
        if (this.config.options[optionId].selections[selectionId].customQty == 1) {
            this.showQtyInput(optionId, this.config.options[optionId].selections[selectionId].qty, true);
        } else {
            this.showQtyInput(optionId, this.config.options[optionId].selections[selectionId].qty, false);
        }
    },

    showQtyInput: function(optionId, value, canEdit) {
        elem = $('bundle-option-' + optionId + '-qty-input-promotions');
        elem.value = value;
        elem.disabled = !canEdit;
        if (canEdit) {
            elem.removeClassName('qty-disabled');
        } else {
            elem.addClassName('qty-disabled');
        }
    },

    changeOptionQty: function (element, event) {
        var checkQty = true;
        if (typeof(event) != 'undefined') {
            if (event.keyCode == 8 || event.keyCode == 46) {
                checkQty = false;
            }
        }
        if (checkQty && (Number(element.value) == 0 || isNaN(Number(element.value)))) {
            element.value = 1;
        }
        parts = element.id.split('-');
        optionId = parts[2];
        if (!this.config['options'][optionId].isMulti) {
            selectionId = this.config.selected[optionId][0];
            this.config.options[optionId].selections[selectionId].qty = element.value*1;
            this.reloadPrice();
        }
    },

    validationCallback: function (elmId, result){
        if (elmId == undefined || $(elmId) == undefined) {
            return;
        }
        var container = $(elmId).up('ul.options-list');
        if (typeof container != 'undefined') {
            if (result == 'failed') {
                container.removeClassName('validation-passed');
                container.addClassName('validation-failed');
            } else {
                container.removeClassName('validation-failed');
                container.addClassName('validation-passed');
            }
        }
    }
}
Bundlepromotions.OptionsPrice = Class.create();
Bundlepromotions.OptionsPrice.prototype = {
    initialize: function(config) {
        if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 7) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 12)){
            this.productId          = config.productId;
            this.priceFormat        = config.priceFormat;
            this.includeTax         = config.includeTax;
            this.defaultTax         = config.defaultTax;
            this.currentTax         = config.currentTax;
            this.productPrice       = config.productPrice;
            this.showIncludeTax     = config.showIncludeTax;
            this.showBothPrices     = config.showBothPrices;
            this.productOldPrice    = config.productOldPrice;
            if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) <= 6) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) <= 10)){
                this.priceInclTax       = config.priceInclTax;
                this.priceExclTax       = config.priceExclTax;
            }else{
                this.productPrice       = config.productPrice;
            }
            this.skipCalculate      = config.skipCalculate; /** @deprecated after 1.5.1.0 */
            this.duplicateIdSuffix  = config.idSuffix;
            this.specialTaxPrice    = config.specialTaxPrice;
            this.tierPrices         = config.tierPrices;
            this.tierPricesInclTax  = config.tierPricesInclTax;

            this.oldPlusDisposition = config.oldPlusDisposition;
            this.plusDisposition    = config.plusDisposition;
            this.plusDispositionTax = config.plusDispositionTax;

            this.oldMinusDisposition = config.oldMinusDisposition;
            this.minusDisposition    = config.minusDisposition;

            this.exclDisposition     = config.exclDisposition;

            this.optionPrices   = {};
            this.customPrices   = {};
            this.containers     = {};

            this.displayZeroPrice   = true;
        }else{
            this.productId          = config.productId;
            this.priceFormat        = config.priceFormat;
            this.includeTax         = config.includeTax;
            this.defaultTax         = config.defaultTax;
            this.currentTax         = config.currentTax;
            this.productPrice       = config.productPrice;
            this.showIncludeTax     = config.showIncludeTax;
            this.showBothPrices     = config.showBothPrices;
            this.productOldPrice    = config.productOldPrice;
            this.priceInclTax       = config.priceInclTax;
            this.priceExclTax       = config.priceExclTax;
            this.skipCalculate      = config.skipCalculate;//@deprecated after 1.5.1.0
            this.duplicateIdSuffix  = config.idSuffix;
            this.specialTaxPrice    = config.specialTaxPrice;

            this.oldPlusDisposition = config.oldPlusDisposition;
            this.plusDisposition    = config.plusDisposition;

            this.oldMinusDisposition = config.oldMinusDisposition;
            this.minusDisposition    = config.minusDisposition;

            this.optionPrices    = {};
            this.containers      = {};

            this.displayZeroPrice   = true;
        }
        this.initPrices();
    },

    setDuplicateIdSuffix: function(idSuffix) {
        this.duplicateIdSuffix = idSuffix;
    },

    initPrices: function() {
        this.containers[0] = 'product-price-' + this.productId+'-bundle-promotions';
        this.containers[1] = 'bundle-price-' + this.productId+'-bundle-promotions';
        this.containers[2] = 'price-including-tax-' + this.productId+'-bundle-promotions';
        this.containers[3] = 'price-excluding-tax-' + this.productId+'-bundle-promotions';
        this.containers[4] = 'old-price-' + this.productId+'-bundle-promotions';
    },

    changePrice: function(key, price) {
        this.optionPrices[key] = price;
    },
    
    addCustomPrices: function(key, price) {
        if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 7) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 12)){
            this.customPrices[key] = price;
        }
    },
    getOptionPrices: function() {
        var price = 0;
        var nonTaxable = 0;
        var oldPrice = 0;
        var priceInclTax = 0;
        var currentTax = this.currentTax;
        $H(this.optionPrices).each(function(pair) {
            if ('undefined' != typeof(pair.value.price) && 'undefined' != typeof(pair.value.oldPrice)) {
                price += parseFloat(pair.value.price);
                oldPrice += parseFloat(pair.value.oldPrice);
            } else if (pair.key == 'nontaxable') {
                nonTaxable = pair.value;
            } else if (pair.key == 'priceInclTax') {
                priceInclTax += pair.value;
            } else if (pair.key == 'optionsPriceInclTax') {
                priceInclTax += pair.value * (100 + currentTax) / 100;
            } else {
                price += parseFloat(pair.value);
                oldPrice += parseFloat(pair.value);
            }
        });
        var result = [price, nonTaxable, oldPrice, priceInclTax];
        return result;
    },

    reload: function() {
        var price;
        var formattedPrice;
        var optionPrices = this.getOptionPrices();
        var nonTaxable = optionPrices[1];
        var optionOldPrice = optionPrices[2];
        var priceInclTax = optionPrices[3];
        optionPrices = optionPrices[0];

        $H(this.containers).each(function(pair) {
            var _productPrice;
            var _plusDisposition;
            var _minusDisposition;
            if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 7) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 12)){
            var _priceInclTax;
            if ($(pair.value)) {
                if (pair.value == 'old-price-'+this.productId && this.productOldPrice != this.productPrice) {
                    _productPrice = this.productOldPrice;
                    _plusDisposition = this.oldPlusDisposition;
                    _minusDisposition = this.oldMinusDisposition;
                } else {
                    _productPrice = this.productPrice;
                    _plusDisposition = this.plusDisposition;
                    _minusDisposition = this.minusDisposition;
                }
                _priceInclTax = priceInclTax;

                if (pair.value == 'old-price-'+this.productId && optionOldPrice !== undefined) {
                    price = optionOldPrice+parseFloat(_productPrice);
                } else if (this.specialTaxPrice == 'true' && this.priceInclTax !== undefined && this.priceExclTax !== undefined) {
                    price = optionPrices+parseFloat(this.priceExclTax);
                    _priceInclTax += this.priceInclTax;
                } else {
                    price = optionPrices+parseFloat(_productPrice);
                    _priceInclTax += parseFloat(_productPrice) * (100 + this.currentTax) / 100;
                }

                if (this.specialTaxPrice == 'true') {
                    var excl = price;
                    var incl = _priceInclTax;
                } else if (this.includeTax == 'true') {
                    // tax = tax included into product price by admin
                    var tax = price / (100 + this.defaultTax) * this.defaultTax;
                    var excl = price - tax;
                    var incl = excl*(1+(this.currentTax/100));
                } else {
                    var tax = price * (this.currentTax / 100);
                    var excl = price;
                    var incl = excl + tax;
                }
                    var subPrice = 0;
                    var subPriceincludeTax = 0;
                    Object.values(this.customPrices).each(function(el){
                        if (el.excludeTax && el.includeTax) {
                            subPrice += parseFloat(el.excludeTax);
                            subPriceincludeTax += parseFloat(el.includeTax);
                        } else {
                            subPrice += parseFloat(el.price);
                            subPriceincludeTax += parseFloat(el.price);
                        }
                    });
                    excl += subPrice;
                    incl += subPriceincludeTax;

                    if (typeof this.exclDisposition == 'undefined') {
                        excl += parseFloat(_plusDisposition);
                    }

                    incl += parseFloat(_plusDisposition) + parseFloat(this.plusDispositionTax);
                    excl -= parseFloat(_minusDisposition);
                    incl -= parseFloat(_minusDisposition);

                    //adding nontaxlable part of options
                    excl += parseFloat(nonTaxable);
                    incl += parseFloat(nonTaxable);
                    if (pair.value == 'price-including-tax-'+this.productId) {
                    price = incl;
                } else if (pair.value == 'price-excluding-tax-'+this.productId) {
                    price = excl;
                } else if (pair.value == 'old-price-'+this.productId) {
                    if (this.showIncludeTax || this.showBothPrices) {
                        price = incl;
                    } else {
                        price = excl;
                    }
                } else {
                    if (this.showIncludeTax) {
                        price = incl;
                    } else {
                        price = excl;
                    }
                }

                if (price < 0) price = 0;

                if (price > 0 || this.displayZeroPrice) {
                    formattedPrice = this.formatPrice(price);
                } else {
                    formattedPrice = '';
                }

                if ($(pair.value).select('.price')[0]) {
                    $(pair.value).select('.price')[0].innerHTML = formattedPrice;
                    if ($(pair.value+this.duplicateIdSuffix) && $(pair.value+this.duplicateIdSuffix).select('.price')[0]) {
                        $(pair.value+this.duplicateIdSuffix).select('.price')[0].innerHTML = formattedPrice;
                    }
                } else {
                    $(pair.value).innerHTML = formattedPrice;
                    if ($(pair.value+this.duplicateIdSuffix)) {
                        $(pair.value+this.duplicateIdSuffix).innerHTML = formattedPrice;
                    }
                }
            };
                }else{
                    if ($(pair.value)) {
                if (pair.value == 'old-price-'+this.productId && this.productOldPrice != this.productPrice) {
                    _productPrice = this.productOldPrice;
                    _plusDisposition = this.oldPlusDisposition;
                    _minusDisposition = this.oldMinusDisposition;
                } else {
                    _productPrice = this.productPrice;
                    _plusDisposition = this.plusDisposition;
                    _minusDisposition = this.minusDisposition;
                }

                var price = 0;
                if (pair.value == 'old-price-'+this.productId && optionOldPrice !== undefined) {
                    price = optionOldPrice+parseFloat(_productPrice);
                } else {
                    price = optionPrices+parseFloat(_productPrice);
                    priceInclTax += parseFloat(_productPrice) * (100 + this.currentTax) / 100;
                }

                if (this.specialTaxPrice == 'true') {
                    var excl = price;
                    var incl = priceInclTax;
                } else if (this.includeTax == 'true') {
                    // tax = tax included into product price by admin
                    var tax = price / (100 + this.defaultTax) * this.defaultTax;
                    var excl = price - tax;
                    var incl = excl*(1+(this.currentTax/100));
                } else {
                    var tax = price * (this.currentTax / 100);
                    var excl = price;
                    var incl = excl + tax;
                }

                excl += parseFloat(_plusDisposition);
                incl += parseFloat(_plusDisposition);
                excl -= parseFloat(_minusDisposition);
                incl -= parseFloat(_minusDisposition);

                //adding nontaxlable part of options
                excl += parseFloat(nonTaxable);
                incl += parseFloat(nonTaxable);

                if (pair.value == 'price-including-tax-'+this.productId) {
                    price = incl;
                } else if (pair.value == 'price-excluding-tax-'+this.productId) {
                    price = excl;
                } else if (pair.value == 'old-price-'+this.productId) {
                    if (this.showIncludeTax || this.showBothPrices) {
                        price = incl;
                    } else {
                        price = excl;
                    }
                } else {
                    if (this.showIncludeTax) {
                        price = incl;
                    } else {
                        price = excl;
                    }
                }

                if (price < 0) price = 0;

                if (price > 0 || this.displayZeroPrice) {
                    formattedPrice = this.formatPrice(price);
                } else {
                    formattedPrice = '';
                }

                if ($(pair.value).select('.price')[0]) {
                    $(pair.value).select('.price')[0].innerHTML = formattedPrice;
                    if ($(pair.value+this.duplicateIdSuffix) && $(pair.value+this.duplicateIdSuffix).select('.price')[0]) {
                        $(pair.value+this.duplicateIdSuffix).select('.price')[0].innerHTML = formattedPrice;
                    }
                } else {
                    $(pair.value).innerHTML = formattedPrice;
                    if ($(pair.value+this.duplicateIdSuffix)) {
                        $(pair.value+this.duplicateIdSuffix).innerHTML = formattedPrice;
                    }
                }
            };
                }
                
        }.bind(this));

        if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 9) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 14)){
            if (typeof(skipTierPricePercentUpdate) === "undefined" && typeof(this.tierPrices) !== "undefined") {
                for (var i = 0; i < this.tierPrices.length; i++) {
                    $$('.benefit').each(function(el) {
                        var parsePrice = function(html) {
                            var format = this.priceFormat;
                            var decimalSymbol = format.decimalSymbol === undefined ? "," : format.decimalSymbol;
                            var regexStr = '[^0-9-' + decimalSymbol + ']';
                            //remove all characters except number and decimal symbol
                            html = html.replace(new RegExp(regexStr, 'g'), '');
                            html = html.replace(decimalSymbol, '.');
                            return parseFloat(html);
                        }.bind(this);

                        var updateTierPriceInfo = function(priceEl, tierPriceDiff, tierPriceEl, benefitEl) {
                            if (typeof(tierPriceEl) === "undefined") {
                                //tierPrice is not shown, e.g., MAP, no need to update the tier price info
                                return;
                            }
                            var price = parsePrice(priceEl.innerHTML);
                            var tierPrice = price + tierPriceDiff;

                            tierPriceEl.innerHTML = this.formatPrice(tierPrice);

                            var $percent = Selector.findChildElements(benefitEl, ['.percent.tier-' + i]);
                            $percent.each(function(el) {
                                el.innerHTML = Math.ceil(100 - ((100 / price) * tierPrice));
                            });
                        }.bind(this);

                        var tierPriceElArray = $$('.tier-price.tier-' + i + ' .price');
                        if (this.showBothPrices) {
                            var containerExclTax = $(this.containers[3]);
                            var tierPriceExclTaxDiff = this.tierPrices[i];
                            var tierPriceExclTaxEl = tierPriceElArray[0];
                            updateTierPriceInfo(containerExclTax, tierPriceExclTaxDiff, tierPriceExclTaxEl, el);
                            var containerInclTax = $(this.containers[2]);
                            var tierPriceInclTaxDiff = this.tierPricesInclTax[i];
                            var tierPriceInclTaxEl = tierPriceElArray[1];
                            updateTierPriceInfo(containerInclTax, tierPriceInclTaxDiff, tierPriceInclTaxEl, el);
                        } else if (this.showIncludeTax) {
                            var container = $(this.containers[0]);
                            var tierPriceInclTaxDiff = this.tierPricesInclTax[i];
                            var tierPriceInclTaxEl = tierPriceElArray[0];
                            updateTierPriceInfo(container, tierPriceInclTaxDiff, tierPriceInclTaxEl, el);
                        } else {
                            var container = $(this.containers[0]);
                            var tierPriceExclTaxDiff = this.tierPrices[i];
                            var tierPriceExclTaxEl = tierPriceElArray[0];
                            updateTierPriceInfo(container, tierPriceExclTaxDiff, tierPriceExclTaxEl, el);
                        }
                    }, this);
                }
            }
        }else{
            
            if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 7) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 12)){
                for (var i = 0; i < this.tierPrices.length; i++) {
                    $$('.price.tier-' + i).each(function (el) {
                        var price = this.tierPrices[i] + parseFloat(optionPrices);
                        el.innerHTML = this.formatPrice(price);
                    }, this);
                    $$('.price.tier-' + i + '-incl-tax').each(function (el) {
                        var price = this.tierPricesInclTax[i] + parseFloat(optionPrices);
                        el.innerHTML = this.formatPrice(price);
                    }, this);
                    $$('.benefit').each(function (el) {
                        var parsePrice = function (html) {
                            return parseFloat(/\d+\.?\d*/.exec(html));
                        };
                        var container = $(this.containers[3]) ? this.containers[3] : this.containers[0];
                        var price = parsePrice($(container).innerHTML);
                        if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) <= 8) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) <= 12)){
                            var tierPrice = $$('.price.tier-' + i);
                        }else{
                            var tierPrice = $$('.tier-price.tier-' + i+' .price');
                        }
                        tierPrice = tierPrice.length ? parsePrice(tierPrice[0].innerHTML, 10) : 0;
                        var $percent = Selector.findChildElements(el, ['.percent.tier-' + i]);
                        $percent.each(function (el) {
                            el.innerHTML = Math.ceil(100 - ((100 / price) * tierPrice));
                        });
                    }, this);
                }
            }
        }
    },
    formatPrice: function(price) {
        return formatCurrency(price, this.priceFormat);
    }
}
Bundlepromotions.Options = Class.create();
    Bundlepromotions.Options.prototype = {
        initialize : function(config,productId) {
            this.config = config;
            this.productId = productId;
            this.reloadPrice();
            document.observe("dom:loaded", this.reloadPrice.bind(this));
        },
        reloadPrice : function() {
            if((magentoEdition == "C" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 7) || (magentoEdition == "E" && parseInt(magentoEditionSplited[0]) >= 1 && parseInt(magentoEditionSplited[1]) >= 12)){
                var config = this.config;
                var skipIds = [];
                $$('body .product-custom-option').each(function(element){
                    var optionId = 0;
                    var lbox = element.name.indexOf("[");
                    var rbox = element.name.indexOf("]");
                    var lrId = element.name.slice(lbox,rbox + 1);
                    var productId = element.name.slice(lbox + 1,rbox);
                    var elementName = element.name.replace(lrId,'');

                    elementName.sub(/[0-9]+/, function(match){
                        optionId = parseInt(match[0], 10);
                    });
                    if (config[optionId]) {
                        var configOptions = config[optionId];
                        var curConfig = {price: 0};
                        if (element.type == 'checkbox' || element.type == 'radio') {
                            if (element.checked) {
                                if (typeof configOptions[element.getValue()] != 'undefined') {
                                    curConfig = configOptions[element.getValue()];
                                }
                            }
                        } else if(element.hasClassName('datetime-picker') && !skipIds.include(optionId)) {
                            dateSelected = true;
                            $$('.product-custom-option[id^="options_' + optionId + '-promotions"]').each(function(dt){
                                if (dt.getValue() == '') {
                                    dateSelected = false;
                                }
                            });
                            if (dateSelected) {
                                curConfig = configOptions;
                                skipIds[optionId] = optionId;
                            }
                        } else if(element.type == 'select-one' || element.type == 'select-multiple') {
                            if ('options' in element) {
                                $A(element.options).each(function(selectOption){
                                    if ('selected' in selectOption && selectOption.selected) {
                                        if (typeof(configOptions[selectOption.value]) != 'undefined') {
                                            curConfig = configOptions[selectOption.value];
                                        }
                                    }
                                });
                            }
                        } else {
                            if (element.getValue().strip() != '') {
                                curConfig = configOptions;
                            }
                        }
                        if(element.type == 'select-multiple' && ('options' in element)) {
                            $A(element.options).each(function(selectOption) {
                                if (('selected' in selectOption) && typeof(configOptions[selectOption.value]) != 'undefined') {
                                    if (selectOption.selected) {
                                        curConfig = configOptions[selectOption.value];
                                    } else {
                                        curConfig = {price: 0};
                                    }
                                    bundles_optionsPrice[productId].addCustomPrices(optionId + '-' + selectOption.value, curConfig);
                                    bundles_optionsPrice[productId].reload();
                                }
                            });
                        } else {

                            bundles_optionsPrice[productId].addCustomPrices(element.id || optionId, curConfig);
                            bundles_optionsPrice[productId].reload();
                        }
                    }
                });
            }else{
                price = new Number();
            config = this.config;
            skipIds = [];
            $$('.product-custom-option').each(function(element){
                var optionId = 0;
                element.name.sub(/[0-9]+/, function(match){
                    optionId = match[0];
                });
                if (this.config[optionId]) {
                    if (element.type == 'checkbox' || element.type == 'radio') {
                        if (element.checked) {
                            if (config[optionId][element.getValue()]) {
                                price += parseFloat(config[optionId][element.getValue()]);
                            }
                        }
                    } else if(element.hasClassName('datetime-picker') && !skipIds.include(optionId)) {
                        dateSelected = true;
                        $$('.product-custom-option[id^="options_' + optionId + '"]').each(function(dt){
                            if (dt.getValue() == '') {
                                dateSelected = false;
                            }
                        });
                        if (dateSelected) {
                            price += parseFloat(this.config[optionId]);
                            skipIds[optionId] = optionId;
                        }
                    } else if(element.type == 'select-one' || element.type == 'select-multiple') {
                        if (element.options) {
                            $A(element.options).each(function(selectOption){
                                if (selectOption.selected) {
                                    if (this.config[optionId][selectOption.value]) {
                                        price += parseFloat(this.config[optionId][selectOption.value]);
                                    }
                                }
                            });
                        }
                    } else {
                        if (element.getValue().strip() != '') {
                            price += parseFloat(this.config[optionId]);
                        }
                    }
                }
            });
            try {
                bundles_optionsPrice[productId].changePrice('options', price);
                bundles_optionsPrice[productId].changePrice('optionsPriceInclTax', price);
                bundles_optionsPrice[productId].reload();
            } catch (e) {

            }
            }
        }
    }
    var optionTextCounter = {
        count : function(field,cntfield,maxlimit){
            if (field.value.length > maxlimit){
                field.value = field.value.substring(0, maxlimit);
            } else {
                cntfield.innerHTML = maxlimit - field.value.length;
            }
        }
    }
    function validateOptionsCallback(elmId, result) {
        var container = $(elmId).up('ul.options-list');
        if (result == 'failed') {
            container.removeClassName('validation-passed');
            container.addClassName('validation-failed');
        } else {
            container.removeClassName('validation-failed');
            container.addClassName('validation-passed');
        }
    }
    Bundlepromotions.Downloadable = Class.create();
        Bundlepromotions.Downloadable.prototype = {
            config : {},
            initialize : function(config,product_id){
                this.config = config;
                this.productId = product_id;
                this.reloadPrice();
                document.observe("dom:loaded", this.reloadPrice.bind(this));
            },
            reloadPrice : function(){
                var price = 0;
                config = this.config;
                $$('.product-downloadable-link').each(function(elm){
                    if (config[elm.value] && elm.checked) {
                        price += parseFloat(config[elm.value]);
                    }
                });
                try {
                    var _displayZeroPrice = bundles_optionsPrice[this.productId].displayZeroPrice;
                    bundles_optionsPrice[this.productId].displayZeroPrice = false;
                    bundles_optionsPrice[this.productId].changePrice('downloadable', price);
                    bundles_optionsPrice[this.productId].reload();
                    bundles_optionsPrice[this.productId].displayZeroPrice = _displayZeroPrice;
                } catch (e) {

                }
            }
        };

        function validateDownloadableCallback(elmId, result) {
            var container = $('downloadable-links-list');
            if (result == 'failed') {
                container.removeClassName('validation-passed');
                container.addClassName('validation-failed');
            } else {
                container.removeClassName('validation-failed');
                container.addClassName('validation-passed');
            }
        }