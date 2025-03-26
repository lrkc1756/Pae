from flask import Blueprint, render_template, request, flash, jsonify
from flask_login import login_required, current_user
from .models import Note
from . import db
import json

views = Blueprint('views', __name__)


@views.route('/', methods=['GET', 'POST'])
def home():
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

    return render_template("home.html", user=current_user)

@views.route('/contact')
def contact():
    # Dynamic data
    people = [
        {"name": "Prof. Prof. Dr. Dr. John Doe", "email": "pae@umwelt-campus.de", "description": "PAE-e-green", "image": "static/img/john.jpg"},
        {"name": "Frau Lauren Koch", "email": "pae@umwelt-campus.de", "description": "PAE-e-green Hiwi", "image": "static/img/jane.jpg"},
        {"name": "Mark Turner BSc", "email": "student@umwelt-campus.de", "description": "LCA Demonstrator Creator", "image": "static/img/mark.jpg"}
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