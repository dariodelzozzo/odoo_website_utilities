odoo.define('document_management_system.documents_container', function (require) {
    "use strict";

    require('web_editor.ready');

    var ajax = require('web.ajax');
    var base = require('web_editor.base');
    var core = require('web.core');
    var Widget = require("web.Widget");
    var rpc = require("web.rpc");

    var qweb = core.qweb;

    var DocumentContainer = Widget.extend({
        template: 'document_management_system.portal_documents',
        events: {
            'click button.js_navigate_directory_back': 'navigate_parent_back',
            'click a.js_breadcrumbs_item_navigate': 'navigate_clicked_breadcrumbs',
            'click div.document-type-directory': 'navigate_inside_directory',
            'click button.js_create_document': 'create_new_document',
            'click button.btn-modify-attachment': 'modify_selected_document',
            'click button.btn-remove-attachment': 'remove_selected_document',
        },
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.options = _.extend(options || {}, {
                csrf_token: odoo.csrf_token,
            });
            this.res_model = options['resModel'];
            this.res_id = options['resId'];
            this.res_name = options['resName'];
            //Used by create button for recognize where to create new item
            this.current_directory_model = this.res_model;
            this.current_directory_id = this.res_id;
        },
        willStart: function () {
            return this._loadTemplates();
        },

        start: function () {
            return this.get_resource_documents();
        },
        get_resource_documents: function (ev) {
            var post = {
                'master_res_model': this.res_model,
                'master_res_id': this.res_id,
                'res_model': this.res_model,
                'res_id': this.res_id,
            };
            return ajax.jsonRpc('/process/resource-informations', 'call', post).then(function (renderedQweb) {
                if (renderedQweb) {
                    $('.documents-container').html(renderedQweb);
                    // Handlers for objects inside renderedQweb
                    //Download click
                    $(document).on("click", "div.document-type-binary", function () {
                        var data_attr = $(this).data();
                        ajax.post('/download/selected-file', data_attr);
                        window.location = data_attr['downloadUrl']
                    });
                }
            });
        },
        navigate_inside_directory: function (ev) {
            //alert('This is a Directory, show content!');
            var data_attr = $(ev.currentTarget).data();
            var directory_content_post = {
                'res_model': data_attr['resModel'],
                'res_id': data_attr['docId'],
                'master_res_model': this.res_model,
                'master_res_id': this.res_id,
            };
            //Keep trace of the current directory for create action
            this.current_directory_id = data_attr['docId'];
            this.current_directory_model = data_attr['resModel'];
            ajax.jsonRpc('/process/resource-informations', 'call', directory_content_post).then(function (directoryQweb) {
                $('.documents-container').html(directoryQweb);
            });
        },
        navigate_parent_back: function (ev) {
            var data_attr = $(ev.currentTarget).data();
            var back_post = {
                'current_id': data_attr['currentDirectory'],
                'current_model': data_attr['currentModel'],
                'master_res_model': this.res_model,
                'master_res_id': this.res_id,
                'navigate_back': true,
            };
            ajax.jsonRpc('/process/resource-informations', 'call', back_post).then(function (backQweb) {
                $('.documents-container').html(backQweb);
            });
        },
        navigate_clicked_breadcrumbs: function (ev) {
            var data_attr = $(ev.currentTarget).data();
            //Keep trace of the current directory for create action
            this.current_directory_id = data_attr['resId'];
            this.current_directory_model = data_attr['resModel'];
            var back_post = {
                'res_model': data_attr['resModel'],
                'res_id': data_attr['resId'],
                'master_res_model': this.res_model,
                'master_res_id': this.res_id,
            };
            ajax.jsonRpc('/process/resource-informations', 'call', back_post).then(function (backBreadcrumbsQweb) {
                $('.documents-container').html(backBreadcrumbsQweb);
            });
        },
        create_new_document: function (ev) {
            var $createButton = $(ev.currentTarget);
            //let data_attr = $(ev.currentTarget).data();
            let create_post = {
                'res_model': this.current_directory_model,
                'res_id': this.current_directory_id,
                'current_url': window.location.href,
            };
            $createButton.prop('disabled', true);
            ajax.jsonRpc('/dms/modal/create', 'call', create_post).then(function (createModal) {
                var $modal = $(createModal);
                $modal.modal({backdrop: 'static', keyboard: false});
                $modal.appendTo('body').modal();
                //Destroy modal after end of hidden action
                $modal.on('hidden.bs.modal', function (e) {
                    $modal.remove();
                    $('.modal-backdrop').remove();
                    $('body').removeClass("modal-open");
                });
                //Trigger the change type for the first open up
                $modal.on('shown.bs.modal', function (e) {
                    $('.select-type-create').change();
                });
                $modal.on('click', '.js_goto_prev_view', function () {
                    $modal.modal('hide');
                    $createButton.prop('disabled', false);
                });
                $modal.on('click', '.close', function () {
                    $createButton.prop('disabled', false);
                });
                $modal.on('change', '.select-type-create', function () {
                    let $this = $(this);
                    let value = $this.val();
                    if (value === 'binary') {
                        //TODO hide url input
                        $('.file-group').show();
                        $('.url-group').hide();
                    } else if (value === 'directory') {
                        //TODO hide file and url input
                        $('.file-group').hide();
                        $('.url-group').hide();
                    } else if (value === 'url') {
                        //TODO hide file input
                        $('.file-group').hide();
                        $('.url-group').show();
                    }
                });
                //Async form submit with ajax json that update documents container
                $modal.on('submit', '#document_creation', function (e) {
                    e.preventDefault();
                    //do some verification
                    $.ajax({
                        url: $(this).attr('action'),
                        data: new FormData($(this)[0]),
                        // Tell jQuery not to process data or worry about content-type
                        // You *must* include these options!
                        cache: false,
                        contentType: false,
                        processData: false,
                        method: 'POST',
                        success: function (data) {
                            let $root_container = $('div.o_portal_documents_div');
                            let root_data = $root_container.data();
                            $modal.modal('hide');
                            $createButton.prop('disabled', false);
                            var parsedData = $.parseJSON(data);
                            if (parsedData['success']) {
                                var post = {
                                    'res_model': parsedData['res_model'],
                                    'res_id': parsedData['res_id'],
                                    'master_res_model': root_data['resModel'],
                                    'master_res_id': root_data['resId'],
                                    'csrf_token': core.csrf_token,
                                };
                                ajax.jsonRpc('/process/resource-informations', 'call', post).then(function (documentContent) {
                                    $('.documents-container').html(documentContent);
                                });
                            }
                        }
                    });
                });
            });
        },
        modify_selected_document: function (ev) {
            //Necessary because the button is inside a clickable div
            ev.preventDefault();
            ev.stopPropagation();
            let $parent_container = $(ev.currentTarget).closest("div.doc-container-content");
            var data_attr = $parent_container.data();
            let root_data = $('div.o_portal_documents_div').data();
            let modify_post = {
                'id': data_attr['docId'],
                'model': data_attr['resModel'],
                'master_res_model': root_data['resModel'],
                'master_res_id': root_data['resId'],
            };
            ajax.jsonRpc('/dms/button_update/modal', 'call', modify_post).then(function (modifyModal) {
                var $modal = $(modifyModal);
                $modal.modal({backdrop: 'static', keyboard: false});
                $modal.appendTo('body').modal();
                //Destroy modal after end of hidden action
                $modal.on('hidden.bs.modal', function (e) {
                    $modal.remove();
                    $('.modal-backdrop').remove();
                    $('body').removeClass("modal-open");
                });
                $modal.on('click', '.js_goto_prev_view', function () {
                    $modal.modal('hide');
                });
                //Async form submit with ajax json that update documents container
                $modal.on('submit', '#document_modify', function (e) {
                    e.preventDefault();
                    $.ajax({
                        url: $(this).attr('action'),
                        data: new FormData($(this)[0]),
                        cache: false,
                        contentType: false,
                        processData: false,
                        method: 'POST',
                        success: function (data) {
                            let $root_container = $('div.o_portal_documents_div');
                            let root_data = $root_container.data();
                            $modal.modal('hide');
                            var parsedData = $.parseJSON(data);
                            if (parsedData['success']) {
                                var post = {
                                    'res_model': parsedData['res_model'],
                                    'res_id': parsedData['res_id'],
                                    'master_res_model': root_data['resModel'],
                                    'master_res_id': root_data['resId'],
                                    'csrf_token': core.csrf_token,
                                };
                                ajax.jsonRpc('/process/resource-informations', 'call', post).then(function (documentContent) {
                                    $('.documents-container').html(documentContent);
                                });
                            }
                        }
                    });
                });
            });
        },
        remove_selected_document: function (ev) {
            //Necessary because the button is inside a clickable div
            ev.stopPropagation();
            ev.preventDefault();
            let $parent_container = $(ev.currentTarget).closest("div.doc-container-content");
            var data_attr = $parent_container.data();
            let $root_container = $('div.o_portal_documents_div');
            let root_data = $root_container.data();
            let remove_post = {
                'id': data_attr['docId'],
                'model': data_attr['resModel'],
                'master_res_model': root_data['resModel'],
                'master_res_id': root_data['resId'],
            };
            ajax.jsonRpc('/dms/button_remove', 'call', remove_post).then(function (response) {
                /*Here we get the same response of the first call of widget but now
                we pass the current directory id so we keep the same breadcrumbs
                and navigation*/
                $('.documents-container').html(response);
            });
        },

        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------
        /**
         * @private
         * @returns {Deferred}
         */
        _loadTemplates: function () {
            return ajax.loadXML('/document_management_system/static/src/xml/portal_document_management.xml', qweb);
        },
    });

    base.ready().then(function () {
        $('.o_portal_documents_div').each(function () {
            var $elem = $(this);
            var div = new DocumentContainer(null, $elem.data());
            div.appendTo($elem);
        });
    });

    return DocumentContainer
});
