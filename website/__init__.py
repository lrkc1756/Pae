from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_babel import Babel, _
import os

db = SQLAlchemy()
babel = Babel()
DB_NAME = "database.db"

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'hjshjhdjah kjshkjdhjs'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    app.config['BABEL_DEFAULT_LOCALE'] = 'de'
    app.config['BABEL_SUPPORTED_LOCALES'] = ['de', 'en', 'fr']
    app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'

    db.init_app(app)

    # Use the new Babel 4 locale_selector approach
    def get_locale():
        lang = request.args.get('lang')
        if lang in app.config['BABEL_SUPPORTED_LOCALES']:
            return lang
        return request.accept_languages.best_match(app.config['BABEL_SUPPORTED_LOCALES'])

    babel.init_app(app, locale_selector=get_locale)

    app.jinja_env.add_extension('jinja2.ext.i18n')
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
