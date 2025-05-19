from flask import Flask, request, g
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
import os
import json

db = SQLAlchemy()
DB_NAME = "database.db"
TRANSLATIONS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'translations')


def load_translations():
    translations = {}
    for filename in os.listdir(TRANSLATIONS_DIR):
        if filename.endswith('.json'):
            lang = filename[:-5]  # e.g., "en" from "en.json"
            with open(os.path.join(TRANSLATIONS_DIR, filename), encoding='utf-8') as f:
                translations[lang] = json.load(f)
    return translations

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'hjshjhdjah kjshkjdhjs'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    app.config['SUPPORTED_LANGUAGES'] = ['en', 'de', 'fr']
 
    db.init_app(app)
    
    translations = load_translations() 
    

    # Language selection logic
    @app.before_request
    def set_language():
        lang = request.args.get('lang')
        if lang not in app.config['SUPPORTED_LANGUAGES']:
            lang = request.accept_languages.best_match(app.config['SUPPORTED_LANGUAGES'])
        g.current_lang = lang or 'de'

    # Translation function
    def _(text):
        return translations.get(g.get('current_lang', 'de'), {}).get(text, text)

    app.jinja_env.globals.update(_=_)

    from .views import views
    from .auth import auth
    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    from .models import User, Lca
    with app.app_context():
        db.create_all()

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))

    return app
