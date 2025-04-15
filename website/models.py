from . import db
from flask_login import UserMixin
from sqlalchemy.sql import func


class Lca(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    raw_material = db.Column(db.String(200), nullable=False)
    distance_km = db.Column(db.Float, nullable=True)
    location = db.Column(db.String(200), nullable=True)
    co2_impact_kg = db.Column(db.Float, nullable=True)
    data = db.Column(db.String(10000))
    date = db.Column(db.DateTime(timezone=True), default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    lcas = db.relationship('Lca') #one user to many notes relationship
    
#can add another database class to save videos or LCA demonstrator or photos