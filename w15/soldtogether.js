var SoldTogether = {};
SoldTogether.Amazon = Class.create();
SoldTogether.Amazon.prototype = {
    initialize: function(options) {
        this.config = Object.extend({
            checkboxes            : '.relatedorderamazon-checkbox',
            checkboxIdPattern     : '#relatedorderamazon-checkbox{{id}}',
            priceSelector         : '#relatedorderamazon-hidden{{id}}',
            priceSelectorInc      : '#relatedorderamazon-hidden-inc{{id}}',
            mainProductPrice      : '.soldtogether-amazon-main',
            mainProductPriceInc   : '.soldtogether-amazon-main-inc',
            totalPriceSelector    : '.amazonstyle-checkboxes .totalprice .price',
            totalPriceSelectorInc : '.amazonstyle-checkboxes .totalprice .price-including-tax .price',
            totalPriceSelectorExc : '.amazonstyle-checkboxes .totalprice .price-excluding-tax .price',
            submitEl              : '.block-soldtogether-order .btn-cart'
        }, options || {});

        if ($$('.product-shop .price-box .price-excluding-tax')[0]
            && $$('.product-shop .price-box .price-including-tax')[0]) {

            $('soldtogether-total-price-inc').show();
        } else {
            $('soldtogether-total-price').show();
        }

        this.checkboxes = $$(this.config.checkboxes);
        this.mainProductPrice = $$(this.config.mainProductPrice).first();
        this.mainProductPriceInc = $$(this.config.mainProductPriceInc).first();

        $$(this.config.submitEl).invoke('observe', 'click', this.submit.bind(this));
        this.checkboxes.invoke('observe', 'click', this.onCheckboxClick.bind(this));
        this.checkboxes.each(function(el) {
            this.syncCheckboxState(el);
        }.bind(this));

        this.addProductPriceChangeListener();
    },

    onCheckboxClick: function(e) {
        this.syncCheckboxState(e.element());
    },

    /**
     * Sync total and images with browser cached state of checkboxes
     */
    syncCheckboxState: function(el) {
        if (el.checked) {
            this.activate(el.value);
        } else {
            this.deactivate(el.value);
        }
    },

    activate: function(id) {
        this.getCheckbox(id).checked = true;
        $('image' + id).appear({
            duration: 0.2
        });
        this.updateTotal();
    },

    deactivate: function(id) {
        this.getCheckbox(id).checked = false;
        $('image' + id).fade({
            duration: 0.2
        });
        this.updateTotal();
    },

    getCheckbox: function(id) {
        return $$(this.config.checkboxIdPattern.replace('{{id}}', id)).first();
    },

    parseLocalizedFloat: function(value) {
        if (typeof optionsPrice !== 'undefined' && optionsPrice.priceFormat) {
            var groupSymbol   = optionsPrice.priceFormat.groupSymbol,
                decimalSymbol = optionsPrice.priceFormat.decimalSymbol;
        } else {
            var groupSymbol   = this.config.priceFormat.groupSymbol,
                decimalSymbol = this.config.priceFormat.decimalSymbol;
        }
        value = value.replace(/\s/g, '');
        value = value.replace(/&nbsp;/g, '');
        value = value.replace(new RegExp('\\' + groupSymbol, 'g'), '');
        value = value.replace(decimalSymbol, '.');
        value = value.match(/\d.+/)[0];
        return parseFloat(value);
    },

    updateTotal: function() {
        //var total = parseFloat(this.mainProductPrice.getValue()),
            //totalInc = parseFloat(this.mainProductPriceInc.getValue()),
             var total = 0,
            totalInc = 0,
            formattedPrice = '',
            formattedPriceInc = '',
            priceSelector  = this.config.priceSelector,
            priceSelectorInc  = this.config.priceSelectorInc,
            currentPriceSelector = '',
            self = this,
            currentPriceSelectorInc = '';

        this.checkboxes.each(function(el) {
            if (!el.checked) {
                return;
            }
            currentPriceSelector = priceSelector.replace('{{id}}', el.value);
            currentPriceSelectorInc = priceSelectorInc.replace('{{id}}', el.value);
            totalInc += parseFloat($$(currentPriceSelectorInc).first().getValue());

            total += parseFloat($$(currentPriceSelector).first().getValue());
        });

        if (typeof optionsPrice !== 'undefined' && optionsPrice.priceFormat) {
            formattedPrice = optionsPrice.formatPrice(total);
            formattedPriceInc = optionsPrice.formatPrice(totalInc);
        } else {
            formattedPrice = formatCurrency(total, this.config.priceFormat);
            formattedPriceInc = formatCurrency(totalInc, this.config.priceFormat);
        }

        $$(this.config.totalPriceSelectorInc).first().update(formattedPriceInc);
        $$(this.config.totalPriceSelectorExc).first().update(formattedPrice);
        $$(this.config.totalPriceSelector).first().update(formattedPrice);
    },

    submit: function() {
        if (!productAddToCartForm.validator.validate()) {
            return;
        }

        var values = [],
            hiddenProductsField = $('related-products-field');
        this.checkboxes.each(function(el) {
            if (!el.checked) {
                return;
            }
            values.push(el.value);
        });
        values = values.uniq();
        if (hiddenProductsField) {
            // reset related selected checkboxes?
            hiddenProductsField.value = values.join(',');
        }
        productAddToCartForm.submit();
    },

    /**
     * Update main price and amazon total, when options are changes
     * on bundle, configurable and grouped products
     */
    addProductPriceChangeListener: function() {
        if (optionsPrice !== 'undefined' && optionsPrice.priceFormat && optionsPrice.reload) {
            var finalPriceEls = $$('.product-options-bottom .price');
            if (!finalPriceEls.length) {
                finalPriceEls = $$('.product-shop .price-box .price');
            }
            optionsPrice.reload = optionsPrice.reload.wrap(
                function(original) {
                    original();
                    syncPrice();
                }
            );
        } else if ($('super-product-table')) {
            var groupedTable = $('super-product-table'),
                finalPriceEls = groupedTable.select('.price-box .price');

            groupedTable.select('.qty').each(function(el) {
                el.observe('change', function() {
                    syncPrice();
                });
            });
        } else {
            return;
        }

        var self = this,
            syncPrice = function() {
                var total = {
                    'default'  : 0,
                    'including': 0
                };
                finalPriceEls.each(function(priceEl) {
                    var price = self.parseLocalizedFloat(priceEl.innerHTML);
                    if (isNaN(price)) {
                        return;
                    }
                    var id = priceEl.id || priceEl.up().id;
                    if (0 === id.indexOf('price-including-tax-')) {
                        var key = 'including';
                    } else if (0 === id.indexOf('price-excluding-tax-')
                        || 0 === id.indexOf('product-price-')) {

                        var key = 'default';
                    } else {
                        // old-price goes here
                        return;
                    }

                    id = id.match(/-(\d+)/);
                    id = id[1];
                    if ($('super-product-table')) {
                        qtyName = 'super_group[' + id + ']';
                        var qty = parseFloat($$('input[name="'+qtyName+'"]')[0].getValue());
                        qty = (qty < 0) ? 1 : qty;
                    } else {
                        qty = 1;
                    }
                    total[key] += (price * qty);
                });
                self.mainProductPrice.setValue(total['default']);
                self.mainProductPriceInc.setValue(total['including']);
                self.updateTotal();
            };
        syncPrice();
    }
};

SoldTogether.Checkboxes = Class.create();
SoldTogether.Checkboxes.prototype = {
    initialize: function(options) {
        this.config = Object.extend({
            container        : '.block-soldtogether-customer',
            checkboxIdPattern: '#relatedcustomer-checkbox{{id}}',
            checkboxes       : '.addtocart-checkbox',
            selectAll        : '.select-all',
            selectAllText    : 'select all',
            unselectAllText  : 'unselect all'
        }, options || {});

        this.container  = $$(this.config.container).first();
        this.checkboxes = this.container.select(this.config.checkboxes);
        this.selectAll  = this.container.select(this.config.selectAll);

        this.selectAll.invoke('observe', 'click', this.toggleAll.bind(this));
        this.checkboxes.invoke('observe', 'click', this.onCheckboxClick.bind(this));
    },

    onCheckboxClick: function(e) {
        this.syncCheckboxState(e.element());
    },

    /**
     * Sync total and images with browser cached state of checkboxes
     */
    syncCheckboxState: function(el) {
        if (el.checked) {
            this.activate(el.value);
        } else {
            this.deactivate(el.value);
        }
    },

    activate: function(id) {
        this.getCheckbox(id).checked = true;
        this.updateSelectAllLabel();
        addRelatedToProduct();
    },

    deactivate: function(id) {
        this.getCheckbox(id).checked = false;
        this.updateSelectAllLabel();
        addRelatedToProduct();
    },

    getCheckbox: function(id) {
        return $$(this.config.checkboxIdPattern.replace('{{id}}', id)).first();
    },

    toggleAll: function() {
        var status = this.hasNotCheckedCheckboxes();
        this.checkboxes.each(function(el) {
            el.checked = status;
            this.syncCheckboxState(el);
        }.bind(this));
    },

    hasNotCheckedCheckboxes: function() {
        var status = false;
        this.checkboxes.each(function(el) {
            if (!el.checked) {
                status = true;
                throw $break;
            }
        });
        return status;
    },

    updateSelectAllLabel: function() {
        var text = this.hasNotCheckedCheckboxes() ?
            this.config.selectAllText : this.config.unselectAllText;

        this.selectAll.each(function(el) {
            el.innerHTML = text;
        });
    }
};

// override addRelatedToProduct because we use the same hidden field
document.observe('dom:loaded', function() {
    addRelatedToProduct = function() {
        var checkboxes = $$('.related-checkbox, .addtocart-checkbox'),
            values = [];

        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                values.push(checkboxes[i].value);
            }
        }

        values = values.uniq();
        if ($('related-products-field')) {
            $('related-products-field').value = values.join(',');
        }
    };
    addRelatedToProduct();
});
