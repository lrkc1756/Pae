from flask import Blueprint, render_template, request, flash, jsonify, url_for, g, current_app as app
from flask_login import login_required, current_user
from .models import User, Lca
from . import db
import json
import json
import os



views = Blueprint('views', __name__)


@views.route('/', methods=['GET', 'POST'])
def home():
    _ = app.jinja_env.globals['_'] 
    print("Current language:", g.get('current_lang', 'de'))
    demonstrator = [
        {"name": ("LCA"), "description": _('lca'), "image": "lca.png", "link":url_for('views.lca')},
        {"name": _('eco_design'), "description": _('eco_design_d'), "image": "eco_design.png"},
        {"name": _('ganz_energie'), "description": _('ganz_energie_d'), "image": "ganzheitliches.png"},
        {"name": _('energie_manage'), "description": _('energie_manage_d'), "image": "energy.png"},
        {"name": _('plastic_recycle'), "description": _('plastic_recycle_d'), "image": "plastic_recycling.png"}, 
        {"name": "", "description": "", "image":"logo.png"}
    ]

    return render_template("home.html", demonstrator=demonstrator, user=current_user)

@views.route('/contact')
def contact():
    # Dynamic data
    people = [
        {"name": "Prof. Dr. -Ing. Matthias Vette-Steinkamp", "email": "m.vette-steinkamp@umwelt-campus.de", "description": "Projektleiter", "image": "matthias.png", "tel": "+49 6782 17 1881"},
        {"name": "Rida Ahmed, M.Sc", "email": "R.Ahmed@umwelt-campus.de", "description": "Projektleiterin", "image": "rida.png", "tel": "+49 678217-1534"}
    ]
    return render_template("contact.html", people=people, user=current_user)

@views.route('/demo')
def demo():
    return render_template("demo.html", user=current_user)


@views.route('/about')
def about():
    return render_template("about.html", user=current_user)

@views.route('/lca')
def lca():
    return render_template("LCA_SPA.html", user=current_user)
