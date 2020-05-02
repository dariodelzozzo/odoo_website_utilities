# Copyright 2020 Dario Del Zozzo (www.ddzsoftware.com)
# MIT License.

# Documentation links
# https://www.odoo.com/documentation/12.0/reference/http.html

from odoo.http import request, route, Controller


class TestController(Controller):

    # website True is necessary for the template's visualizations
    # into Odoo's website
    @route('/test/url', type='http', auth='user', website=True)
    def test_controller(self, **post):
        # self.env[model_name] become request.env[model_name]
        model_domain = []
        # Careful with .sudo() into website controllers!!!
        models = request.env['ir.model'].sudo().search(model_domain)

        # Get the first sale order that we find so we can test the print
        # report functionality!!
        # this is a test module, so sudo() is good for a bad model.access
        # management, in your production environment if possible avoid sudo()
        sale_order = request.env['sale.order'].sudo().search([], limit=1)
        values = {
            'value1': "This is a simple string",
            'list_test': ['Elem 1', 'Elem 2', 'Elem 3'],
            'no_html': "<h3>Test H3 tag on t-esc </h3>",
            'with_html': "<h3>Test H3 tag on t-raw </h3>",
            'models': models,
            'sale_order': sale_order,
        }
        return request.render("website_test_tutorial.test_template", values)

    @route('/test/url/json', type='json', auth='user', website=True)
    def test_controller_json(self, **post):
        # Come l'altro controller è possibile caricare dei valori per la
        # render!
        # As the other HTTP Controller it's possibile to load values for
        # render method

        # TODO: remove comment and see what happens here!
        # import pdb; pdb.set_trace()

        if post.get('call_type') == 'simple':
            values = {}
            template = request.env['ir.ui.view'].render_template(
                "website_test_tutorial.test_template_json_call", values
            )
            return {
                'success': True,
                'template': template
            }
        elif post.get('call_type') == 'models':
            model_domain = []
            models = request.env['ir.model'].sudo().search(model_domain)
            values = {
                'models': models,
            }
            # The JSON Controller use render_template for a qweb render.
            # It's not possible to use request.render()
            template = request.env['ir.ui.view'].render_template(
                "website_test_tutorial.test_template_json_modules", values
            )
            return {
                'success': True,
                'template': template,
            }
        else:
            return {'error': "OPS..."}

    """
    Call the controller below with this anchors
    As t-value add the current object where you need the report, for example a
    project, or and invoice etc..
    <t t-set="this_object" t-value=""/>
    As example we add sale order report id ref (add the report that you want print)
    <t t-set="report_id_string" t-value="'sale.action_report_saleorder'"/>
    <a t-att-href="'/' + this_object._name + '/' + this_object.id + '/' + report_id_string + '/pdf'" class="btn btn-primary">Download PDF</a>
    <a t-att-href="'/' + this_object._name + '/' + this_object.id + '/' + report_id_string + '/pdf?view_pdf=true'" target="_blank" class="btn btn-secondary">View PDF</a>
    """
    # It's possible to add dynamic strings, integer and objects into route
    # paths <model("project.project"):project>.
    # Remember to add project as method parameters!
    @route(['/<string:res_model>/<int:res_id>/<string:report_id_ref>/pdf'],
           type='http', auth="public", website=True)
    def portal_event_registration_report(self, res_model, res_id,
                                         report_id_ref, view_pdf=False,
                                         **kwargs):
        """
        Generic controller that show or download a pdf report for given
        object model, id and report.
        :param res_model: Current object model
        :param res_id: Current object id
        :param report_id_ref: Object report id
        :param view_pdf: GET variable that manage download or view
        :param kwargs:
        :return:
        """
        record = request.env[res_model].browse(res_id)
        if not record or not report_id_ref:
            return request.render('website.403')

        pdf = request.env.ref(report_id_ref)\
            .sudo().render_qweb_pdf([record.id])[0]

        httpheaders = [
            ('Content-Type', 'application/pdf'),
            ('Content-Length', len(pdf)),
        ]
        if not view_pdf:
            httpheaders.append(
                (
                    'Content-Disposition',
                    'attachment; filename=downloaded_file.pdf'
                )
            )
        return request.make_response(pdf, headers=httpheaders)
