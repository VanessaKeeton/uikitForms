/* *****************
    UIkit 2 Forms JS Version 1.0.0
    Requires jQuery

    Build UIkit 2 forms in jQuery JS.
    By: Vanessa Keeton

    !!Currently does not support UIkit 2 'Form and Grid' layout.!!

    fields = {
        'fieldID01': {
            type: '',//string (defaults to text)
            label: '',//string
            name: '',//string (defaults to field key)
            id: '',//string (defaults to field key)
            //any other valid HTML attr for the type of field you need can go in this array
            //Placeholder converts to empty option for selects
            options: {//array
                row: {//boolen or array (defaults to { controls: true }),
                    controls: //boolen or array['text','condensed']
                },
                icon: '', string (icon class),
                vertical: //boolen (defaults to false option to add breaks between checkbox and radios in group)

            },
            choices: ,//required for radio_group, checkbox_group and select types: array {html_value: choice_display_text} or [choice_display_text] (value will be array index),
        },
    }
****************** */


var UIkitForms = function (element,fields) {
            this.element = element;
            this.fields = fields;
            this._renderFields();
        };

jQuery.extend( UIkitForms.prototype, {

    _renderFields: function () {
            var _this = this;
            var field = {};
            var options = {};
            jQuery.each(_this.fields, function(id,value) {

                //set defaults
                field = {
                    type: 'text',
                    name: id,
                    id: id
                };
                jQuery.extend(field, _this.defaults);
                jQuery.extend(field, value);

                //extract non-attributes
                if (field.hasOwnProperty('options')){
                    options = field['options'];
                    delete field['options'];
                }
                if (field.hasOwnProperty('label')){
                    label = _this._label(field.type,field.label,field.id);
                    delete field['label'];
                }

                //build field type
                switch (field.type) {
                        case 'checkbox':
                        case 'color':
                        case 'date':
                        case 'datetime-local':
                        case 'email':
                        case 'file':
                        case 'hidden':
                        case 'month':
                        case 'number':
                        case 'password':
                        case 'radio':
                        case 'range':
                        case 'search':
                        case 'tel':
                        case 'text':
                        case 'time':
                        case 'url':
                        case 'week':
                            control = _this._input(field);
                            break;
                        case 'select':
                            control = _this._select(field);
                            break;
                        case 'checkbox_group':
                            control = _this._choiceGroup('checkbox',field,options);
                            break;
                        case 'radio_group':
                            control = _this._choiceGroup('radio',field,options);
                            break;
                        default:
                            throw 'Unsupported field type: ' + field.type;
                }

                //build field content
                if (options.hasOwnProperty('row')){
                    content = _this._row(control, label, options.row);
                }else{
                    content =  content = label + control;
                }
                _this.element.append(content);

            });
        },

    _row: function(control, label, options){
        var _this = this;
        if (options != undefined) {
            options.controls ? control = _this._controls(control,options.controls) : control;
        }
        content = label + control;
        return '<div class="uk-form-row">' + content + '</div>'

    },
    _controls: function(control, options){
        var _class = 'uk-form-controls';
        if (options != undefined) {
           options.text ? _class = _class + ' uk-form-controls-text' : _class;
           options.condensed ? control = '<p class="uk-form-controls-condensed">' + control + '</p>' : control;
        }
        return '<div class="' + _class + '">' + control + '</div>'
    },

    _label: function(type,label,id){
        switch (type){
            case 'radio_group':
            case 'checkbox_group':
                return '<span class="uk-form-label">' + label + '</span>';
                break;
            default:
                return '<label class="uk-form-label" for="' + id + '">' + label + '</label>';
        }
    },

    _input: function (field) {
        var _this = this;
        var attributes = '';
        attributes = _this._makeAttributes(field);
        return '<input' + attributes + '>'
    },

    _select: function (field) {
        var _this = this;
        var attributes = '', opt, ca;
        //selects don't have placeholder attr but we'll set a data-placeholder to use with other js functions
        if (field.hasOwnProperty('placeholder')) {
            var placeholder = field.placeholder;
            delete field.placeholder;
         }
         //to make the object more flexible between form types we can set "selected" on load options by adding a string or array to the value.
        if (field.hasOwnProperty('value')) {
            var selectedOption = field.value;
            delete field.value;
        }
        if (field.hasOwnProperty('choices')) {
            var choices = field.choices;
            delete field.choices;

            jQuery.each(choices, function (i,choice) {
                if (choice.hasOwnProperty('label')) {
                    var label = choice.label;
                    delete choice.label;
                }
                if (selectedOption) {
                    if (choice.value == selectedOption || jQuery.inArray(choice.value, selectedOption) != -1) {
                        choice["selected"] = true;
                    }
                }
                ca = _this._makeAttributes(choice);
                if (opt == undefined) {
                    opt = '<option ' + ca + '>' + label + '</option>';
                }else{
                    opt = 
                    opt +
                    '<option ' + ca + '>' + label + '</option>'
                    ;
                }
            });
        }else {
            throw 'You need choices in field ' + field.id + '.';
        }
        attributes = _this._makeAttributes(field);

        return '<select' + attributes + ' data-placeholder="' + placeholder + '">' +
                opt +
            '</select>'
    },
    _choiceGroup: function (type,field,options) {
        var _this = this, input, attributes = '',name;
        if (field.hasOwnProperty('name')) {
                    name = field.name;
            }else{
                throw 'name is required';
            }
        if (field.hasOwnProperty('value')) {
            var selectedOption = field.value;
            delete field.value;
        }
        if (field.hasOwnProperty('choices')) {
            var choices = field.choices;
            delete field.choices;

            jQuery.each(choices, function (i,choice){
                if (choice.hasOwnProperty('label')) {
                    var label = choice.label;
                    delete choice.label;
                }
                id = choice.id ? choice.id : field.id + '_' + i;
                if (type == 'radio') {
                    name = choice.name ? choice.name : name;
                }else{
                    choice.name ? choice.name : name + '_' + i;
                }
                choice['id'] = id;
                choice['name'] = name;
                choice['type'] = type;
                if (selectedOption) {
                    if (choice.value == selectedOption || jQuery.inArray(choice.value, selectedOption) != -1) {
                        choice["checked"] = true;
                    }
                }
                if (input == undefined) {
                    input = (options.vertical ? '<div class="form-choices">' : ' ') + _this._input(choice) + ' ' + _this._label('checkbox',label,id) + (options.vertical ? '</div>' : '');
                }else{
                    input = 
                    input +
                    (options.vertical ? '<div class="form-choices">' : ' ') +
                    _this._input(choice) + ' ' + _this._label('checkbox',label,id) +
                    (options.vertical ? '</div>' : '');
                }
            });
        }else {
            throw 'You need choices in field ' + field.id + '.';
        }
        attributes = _this._makeAttributes(field);
        return '<div' + attributes + '>' + input + '</div>'
    },
    _makeAttributes: function(field){
        var attributes = '';
        jQuery.each(field, function (key,value){
                attributes = (attributes ? attributes : ' ') + key + '=' + '"' + value + '" ' ;
        });
        return attributes
    },
    defaults: {
        options: {
        row: { controls: true }
        }
    },
});
