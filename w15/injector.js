AmastyBannersInjector = Class.create();
AmastyBannersInjector.prototype = {
    container: null,
    after: null,
    wrapper: null,
    wrappers: $A([]),
    element: null,
    wrapperHtml: '',
    subContainerHtml: null,
    subContainer: null,
    rwdTheme: false,
    afterProductRow: 0,
    initialize: function(
        containerSelector,
        itemSelector,
        afterProductRow,
        afterProductNum,
        width
    ){
        this.rwdTheme = $$(containerSelector).length === 1;
        this.afterProductRow = afterProductRow;
        if (this.rwdTheme) {
            this.container = $$(containerSelector)[0];
            this.after = this.findAfterElement(itemSelector, afterProductNum);
            this.wrapperHtml = this.after ? this.after.clone().outerHTML : '<li class="item last"></li>';
        } else {
            this.container = $$(containerSelector)[0].up();
            this.after = $$(containerSelector)[afterProductRow - 1];
            this.wrapperHtml = $$(itemSelector)[0] ? $$(itemSelector)[0].clone().outerHTML : '<li class="item last"></li>';
            this.subContainerHtml = this.after ? this.after.clone().outerHTML : '<ul class="products-grid"></ul>';
        }


        this.width = width;
    },
    findAfterElement: function(itemSelector, afterProductNum) {
        var element =  $$(itemSelector)[afterProductNum];

        if ((typeof element == "undefined") && (afterProductNum > 0)) {
            element = this.findAfterElement(itemSelector, afterProductNum - 1);
        }

        return element;
    },
    inject: function(element){
        this.element = element;
        this.element.hide();
        this.element.addClassName('ambanners-injected-banner');
        var lastWrapper;
        var wrappers = this.wrappers;

        if ($('ambanner_first_time').innerHTML == "1") {
            $('ambanner_first_time').update(0);
            wrappers.clear();
        }

        for(var i = 0; i < this.width; i++) {
            var wrapper = new Element('div');
            wrapper.insert(this.wrapperHtml);
            var insert = wrapper.down();
            insert.id = 'wrapper_' + element.id + '_' + i;
            insert.setAttribute('banner_id', this.element.id);

            for (var index = 0; index < wrappers.length; ++index) {
                var item = wrappers[index];
                if (item.id == insert.id) {
                    wrappers.splice(index);
                }
            }

            wrappers.push(insert);
        }

        this.wrappers = wrappers;

        Event.observe(window, 'resize', this.resize.bind(this));

        this.resize();
    },
    guid: function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    },
    insertWrapper: function(insert){

        insert.addClassName('ambanners-injected');

        if (this.rwdTheme)
        {
            if (this.after) {
                this.after.insert({
                    'after': insert
                });
            } else if (this.container) {
                if (parseInt(this.afterProductRow) > 1){
                    this.container.insert({
                        'bottom': insert
                    });
                } else {
                    this.container.insert({
                        'top': insert
                    });
                }
            }
        } else {
            if (this.subContainer === null){
                var subContainer = new Element('div');
                subContainer.insert(this.subContainerHtml);
                this.subContainer = subContainer.down();

                this.subContainer.addClassName('ambanners-injected-sub-container');

                if (this.after) {
                    this.after.insert({
                        'after': this.subContainer
                    });
                } else if (this.container) {
                    if (parseInt(this.afterProductRow) > 1){
                        this.container.down('.toolbar-bottom').insert({
                            'before': this.subContainer
                        });
                    } else {
                        this.container.down('.toolbar').insert({
                            'after': this.subContainer
                        });
                    }
                }
            }

            this.subContainer.insert(insert);
        }
    },
    top: function()
    {
        var top = 0;
        if (this.wrappers.length > 0) {
            var tops = {};
            this.wrappers.each(function (wrapper) {
                if ($(wrapper.id)) {
                    if (tops[$(wrapper.id).cumulativeOffset().top]) {
                        tops[$(wrapper.id).cumulativeOffset().top]++;
                    } else {
                        tops[$(wrapper.id).cumulativeOffset().top] = 1;
                    }
                }
            });

            var max = 0;
            $H(tops).each(function(value){
                if (value.value > max)
                {
                    top = value.key;
                    max = value.value;
                }
            });
        }

        return top;
    },
    resize: function(){
        this.element.hide();
        if (this.wrappers.length > 0) {
            this.wrappers.each(function (wrapper) {
                if (!$(wrapper.id)){
                    this.insertWrapper(wrapper);

                }
            }.bind(this));

            window.setTimeout(this.showBanner.bind(this, this.container), 500);
        }
    },
    showBanner: function(container){
        var width = 0;
        var insertWrapper;
        var element = this.element;
        this.wrappers.each(function (wrapper) {
            if (wrapper.getAttribute('banner_id') == element.getAttribute('id')) {
                width += wrapper.getWidth();
                insertWrapper = wrapper;
            }
        })

        if (insertWrapper) {
            insertWrapper.insert(element);

            element.setStyle({
                'position': 'absolute',
                'width': width + 'px'
            });

            insertWrapper.setStyle({
                'min-height': element.getHeight() + 'px'
            })
        }
        element.show();
    }
};
