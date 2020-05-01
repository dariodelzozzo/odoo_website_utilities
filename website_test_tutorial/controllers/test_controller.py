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
        values = {
            'value1': "This is a simple string",
            'list_test': ['Elem 1', 'Elem 2', 'Elem 3'],
            'no_html': "<h3>Test H3 tag on t-esc </h3>",
            'with_html': "<h3>Test H3 tag on t-raw </h3>",
            'models': models,
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
