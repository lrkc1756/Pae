from flask import Blueprint, render_template, request, flash, jsonify
from flask_login import login_required, current_user
from .models import Note
from . import db
import json

views = Blueprint('views', __name__)


@views.route('/', methods=['GET', 'POST'])
def home():
    demonstrator = [
        {"name": "LCA", "description": "Entwicklung einer Software, zur Darstellung des CO2 Fußabdruckes", "image": "lca.png"},
        {"name": "Eco Design", "description": "Veranschaulichung Nachhaltigkeit durch intelligentes Design", "image": "eco_design.png"},
        {"name": "Ganzheitliches Energiemanagement", "description": "Veranschaulichung Emissions-reduzierung durch Energie", "image": "ganzheitliches.png"},
        {"name": "Energy Measurement", "description": "Erreichen von hochauflösender Erfassung von Energie- und Stoffströmen", "image": "energy.png"},
        {"name": "Plastic Recycling", "description": "Einarbeitung von Produktions-abfall in neue Teile", "image": "plastic_recycling.png"}, 
        {"name": "", "description": "", "image":"logo.png"}
    ]
        
    if request.method == 'POST': 
        note = request.form.get('note')#Gets the note from the HTML 
        #category = request.form.get('category')

        if len(note) < 1:
            flash('Note is too short!', category='error') 
        else:
            new_note = Note(data=note, user_id=current_user.id)  #providing the schema for the note , category=category
            db.session.add(new_note) #adding the note to the database 
            db.session.commit()
            flash('Note added!', category='success')

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


@views.route('/delete-note', methods=['POST'])
def delete_note():  
    note = json.loads(request.data) # this function expects a JSON from the INDEX.js file 
    noteId = note['noteId']
    note = Note.query.get(noteId)
    if note:
        if note.user_id == current_user.id:
            db.session.delete(note)
            db.session.commit()

    return jsonify({})